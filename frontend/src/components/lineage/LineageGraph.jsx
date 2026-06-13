import React, { useMemo, useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../styles/lineage.css';
import { useAppContext } from '../../context/AppContext';
import SheetNode from './SheetNode';
import GraphToolbar from './GraphToolbar';
import EdgePopover from './EdgePopover';
import NodePopover from './NodePopover';

const nodeTypes = { sheetNode: SheetNode };

/* ── Helper: Sanitize name ── */
const sanitizeName = (name) => {
  if (!name) return '';
  return name.replace(/[^\w]+/g, '_').toLowerCase().replace(/^_+|_+$/g, '');
};

/* ── Helper: Compute hierarchical layout ── */
const computeLayout = (nodeIds, edges) => {
  const positions = {};
  const NODE_W = 280;
  const NODE_H = 180;
  const GAP_X = 80;
  const GAP_Y = 100;

  const incoming = {};
  const outgoing = {};
  nodeIds.forEach(id => { incoming[id] = 0; outgoing[id] = []; });

  edges.forEach(e => {
    if (incoming[e.target] !== undefined) incoming[e.target] = (incoming[e.target] || 0) + 1;
    if (outgoing[e.source]) outgoing[e.source].push(e.target);
  });

  const queue = nodeIds.filter(id => (incoming[id] || 0) === 0);
  const sorted = [];
  const tempIncoming = { ...incoming };

  while (queue.length > 0) {
    queue.sort();
    const node = queue.shift();
    sorted.push(node);
    (outgoing[node] || []).forEach(target => {
      tempIncoming[target] = (tempIncoming[target] || 0) - 1;
      if (tempIncoming[target] === 0) queue.push(target);
    });
  }

  nodeIds.forEach(id => { if (!sorted.includes(id)) sorted.push(id); });

  const layerOf = {};
  sorted.forEach(id => {
    let maxParentLayer = -1;
    edges.forEach(e => {
      if (e.target === id && layerOf[e.source] !== undefined) {
        maxParentLayer = Math.max(maxParentLayer, layerOf[e.source]);
      }
    });
    layerOf[id] = maxParentLayer + 1;
  });

  const layers = {};
  sorted.forEach(id => {
    const layer = layerOf[id] || 0;
    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(id);
  });

  const maxLayerSize = Math.max(...Object.values(layers).map(l => l.length));
  const totalWidth = maxLayerSize * (NODE_W + GAP_X);

  Object.entries(layers).forEach(([layerIdx, nodesInLayer]) => {
    const layerWidth = nodesInLayer.length * (NODE_W + GAP_X) - GAP_X;
    const startX = (totalWidth - layerWidth) / 2;
    nodesInLayer.forEach((id, idx) => {
      positions[id] = {
        x: startX + idx * (NODE_W + GAP_X),
        y: parseInt(layerIdx) * (NODE_H + GAP_Y)
      };
    });
  });

  return positions;
};

/* ── Main Component ── */
export default function LineageGraph({ result, onBack }) {
  const { t } = useAppContext();
  const [selectedEdgeData, setSelectedEdgeData] = useState(null);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  /* ── Build Nodes and Edges ── */
  const { initialNodes, initialEdges, stats } = useMemo(() => {
    if (!result || !result.tables_metadata) {
      return { initialNodes: [], initialEdges: [], stats: { sheets: 0, fks: 0, formulas: 0 } };
    }

    const tables = Object.entries(result.tables_metadata);
    const nodes = [];
    const edges = [];
    const edgeIds = new Set();

    tables.forEach(([tableName, tableData]) => {
      const isMatrix = tableData.status === 'Flat_Calculation_Matrix';
      const originalName = tableData.original_name || tableName;
      nodes.push({
        id: tableName,
        type: 'sheetNode',
        position: { x: 0, y: 0 },
        data: {
          label: originalName,
          originalName,
          isMatrix,
          columns: tableData.columns || [],
          pk: tableData.pk || 'id',
          fks: tableData.fks || [],
          functionalRole: tableData.functional_role || tableData.status || '',
        },
      });
    });

    const validNodeIds = new Set(nodes.map(n => n.id));

    let fkCount = 0;
    tables.forEach(([tableName, tableData]) => {
      if (tableData.fks && tableData.fks.length > 0) {
        tableData.fks.forEach((fk) => {
          const providerTable = fk.references_table;
          const consumerTable = tableName;
          const providerExists = validNodeIds.has(providerTable) || validNodeIds.has(sanitizeName(providerTable));
          const resolvedProvider = validNodeIds.has(providerTable) ? providerTable : sanitizeName(providerTable);

          if (providerExists && resolvedProvider !== consumerTable) {
            const edgeId = `fk-${resolvedProvider}-${consumerTable}-${fk.column}`;
            if (!edgeIds.has(edgeId)) {
              edgeIds.add(edgeId);
              fkCount++;
              edges.push({
                id: edgeId,
                source: resolvedProvider,
                target: consumerTable,
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#4ade80', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#4ade80', width: 18, height: 18 },
                label: `FK: ${fk.column}`,
                labelStyle: { fill: '#4ade80', fontWeight: 700, fontSize: '10px', fontFamily: "'Cascadia Code', monospace" },
                labelBgStyle: { fill: '#0a0f1c', fillOpacity: 0.92, rx: 4, ry: 4 },
                labelBgPadding: [6, 3],
                data: {
                  logicType: 'FK',
                  rawFormula: `${consumerTable}.${fk.column} references ${resolvedProvider}.${fk.references_column || 'id'}`,
                  source: resolvedProvider,
                  target: consumerTable,
                  functionDetail: `Foreign Key: ${fk.column} → ${resolvedProvider}.${fk.references_column || 'id'}`,
                },
              });
            }
          }
        });
      }
    });

    let formulaCount = 0;
    const refs = result.cross_sheet_refs || [];
    refs.forEach((ref, index) => {
      let rawConsumer = ref.source || ref.source_table || (ref.from && ref.from.sheet) || '';
      let rawProvider = ref.target || ref.target_table || (ref.to && ref.to.sheet) || '';
      let providerName = validNodeIds.has(rawProvider) ? rawProvider : sanitizeName(rawProvider);
      let consumerName = validNodeIds.has(rawConsumer) ? rawConsumer : sanitizeName(rawConsumer);

      if (providerName && consumerName && providerName !== consumerName &&
          validNodeIds.has(providerName) && validNodeIds.has(consumerName)) {
        const edgeId = `ref-${providerName}-${consumerName}-${index}`;
        if (!edgeIds.has(edgeId)) {
          edgeIds.add(edgeId);
          formulaCount++;
          const logicLabel = ref.logic_type || 'FORMULA';
          const rawFormula = ref.raw_formula || '';

          let edgeColor = '#38bdf8';
          let edgeLabel = logicLabel;

          if (logicLabel === 'FK') {
            edgeColor = '#4ade80';
          } else if (['VLOOKUP', 'XLOOKUP', 'HLOOKUP'].includes(logicLabel)) {
            edgeColor = '#f59e0b';
            edgeLabel = `🔍 ${logicLabel}`;
          } else if (['SUM', 'SUMIF', 'SUMIFS', 'COUNT', 'COUNTIF'].includes(logicLabel)) {
            edgeColor = '#a78bfa';
            edgeLabel = `📊 ${logicLabel}`;
          } else if (logicLabel === 'IF') {
            edgeColor = '#22c55e';
            edgeLabel = `❓ IF`;
          } else {
            edgeLabel = `⚙️ ${logicLabel}`;
          }

          edges.push({
            id: edgeId,
            source: providerName,
            target: consumerName,
            type: 'smoothstep',
            animated: true,
            style: { stroke: edgeColor, strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor, width: 18, height: 18 },
            label: edgeLabel,
            labelStyle: { fill: edgeColor, fontWeight: 700, fontSize: '10px', fontFamily: "'Cascadia Code', monospace", cursor: 'pointer' },
            labelBgStyle: { fill: '#0a0f1c', fillOpacity: 0.92, rx: 4, ry: 4 },
            labelBgPadding: [6, 3],
            data: {
              logicType: logicLabel,
              rawFormula,
              source: providerName,
              target: consumerName,
              functionDetail: rawFormula || `${logicLabel}: ${providerName} → ${consumerName}`,
            },
          });
        }
      }
    });

    const positions = computeLayout(nodes.map(n => n.id), edges);
    nodes.forEach(node => { node.position = positions[node.id] || { x: 0, y: 0 }; });

    return {
      initialNodes: nodes,
      initialEdges: edges,
      stats: { sheets: nodes.length, fks: fkCount, formulas: formulaCount }
    };
  }, [result]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const displayNodes = useMemo(() => {
    if (!searchTerm.trim()) return nodes;
    const term = searchTerm.toLowerCase();
    return nodes.map(n => ({
      ...n,
      style: { ...n.style, opacity: (n.data.label || n.id).toLowerCase().includes(term) ? 1 : 0.15 },
    }));
  }, [nodes, searchTerm]);

  const displayEdges = useMemo(() => {
    if (filterType === 'all') return edges;
    return edges.filter(e => {
      if (filterType === 'fk') return e.data?.logicType === 'FK';
      if (filterType === 'formula') return e.data?.logicType !== 'FK';
      return true;
    });
  }, [edges, filterType]);

  const handleEdgeClick = useCallback((event, edge) => {
    setSelectedEdgeData(edge.data);
    setSelectedNodeData(null);
  }, []);

  const handleNodeClick = useCallback((event, node) => {
    setSelectedNodeData({ id: node.id, ...node.data });
    setSelectedEdgeData(null);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedEdgeData(null);
    setSelectedNodeData(null);
  }, []);

  if (!result || !result.tables_metadata || Object.keys(result.tables_metadata).length === 0) {
    return (
      <div style={{
        height: '85vh', width: '100%',
        background: '#090d16', borderRadius: '12px',
        border: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '1rem', color: '#64748b'
      }}>
        <span style={{ fontSize: '3rem' }}>📭</span>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('lineage.noData')}</p>
        <p style={{ fontSize: '0.85rem' }}>{t('lineage.noDataHint')}</p>
        <button onClick={onBack} style={{
          background: '#1e293b', color: '#fff', border: 'none',
          padding: '8px 20px', borderRadius: '6px', cursor: 'pointer',
          fontWeight: 'bold', marginTop: '0.5rem'
        }}>
          {t('lineage.back')}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      height: '85vh', width: '100%',
      background: '#090d16', borderRadius: '12px',
      border: '1px solid rgba(34, 197, 94, 0.15)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column'
    }}>
      <GraphToolbar
        stats={stats}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        onBack={onBack}
      />

      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={handleEdgeClick}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ flex: 1, width: '100%', height: '100%' }}
      >
        <Background color="#1e293b" gap={25} size={1} />
        <Controls
          position="top-right"
          style={{
            background: '#0f172a',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            marginTop: '50px',
          }}
        />
        <MiniMap
          nodeColor={(n) => n.data?.isMatrix ? '#22c55e' : '#00d4ff'}
          maskColor="rgba(9, 13, 22, 0.85)"
          style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
          position="bottom-right"
        />
      </ReactFlow>

      {selectedEdgeData && <EdgePopover data={selectedEdgeData} onClose={() => setSelectedEdgeData(null)} />}
      {selectedNodeData && <NodePopover data={selectedNodeData} result={result} onClose={() => setSelectedNodeData(null)} />}
    </div>
  );
}
