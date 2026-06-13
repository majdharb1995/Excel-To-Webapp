import React, { useMemo, useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';

/* ═══════════════════════════════════════════════════════════════════════
   🌍 LINEAGE GRAPH TRANSLATIONS (EN / AR)
   ═══════════════════════════════════════════════════════════════════════ */
const LT = {
  en: {
    node: {
      entity: 'ENTITY',
      flatMatrix: 'FLAT MATRIX',
      cols: 'cols',
      pk: 'PK',
      fk: 'FK',
      role: 'Role:',
    },
    empty: {
      title: 'No Schema Data Available',
      desc: 'Upload and analyze an Excel file first to see the lineage graph.',
      back: '← Back',
    },
    toolbar: {
      back: '← Back',
      sheets: 'Sheets',
      fkLinks: 'FK Links',
      formulaLinks: 'Formula Links',
      search: 'Search sheets...',
      allLinks: 'All Links',
      fkOnly: 'FK Only',
      formulasOnly: 'Formulas Only',
    },
    legend: {
      title: 'Legend',
      fkRelationship: 'FK Relationship',
      formulaRef: 'Formula Reference',
      vlookup: 'VLOOKUP / XLOOKUP',
      aggregation: 'Aggregation (SUM, COUNT)',
      conditional: 'Conditional (IF)',
    },
    popover: {
      fkTitle: '🔗 Foreign Key Relationship',
      funcTitle: '⚙️ ',
      funcTitleSuffix: ' Function',
      dataFlowDir: 'Data Flow Direction',
      fkFlowDesc: (src, tgt) => `Data is fetched from "${src}" into "${tgt}"`,
      formulaFlowDesc: (tgt, src) => `"${tgt}" uses data from "${src}" via a formula`,
      relDetail: 'Relationship Detail',
      formulaDetail: 'Formula / Function',
      noFormula: 'No formula extracted',
      flatMatrixDesc: 'Flat Calculation Matrix (JSON Dictionary)',
      entityDesc: (count) => `Entity Table — ${count} columns`,
      columns: 'Columns',
      connections: 'Connections',
    },
  },
  ar: {
    node: {
      entity: 'كيان',
      flatMatrix: 'مصفوفة مسطحة',
      cols: 'أعمدة',
      pk: 'م.ر',
      fk: 'م.غ',
      role: 'الدور:',
    },
    empty: {
      title: 'لا توجد بيانات مخطط متاحة',
      desc: 'ارفع وحلل ملف Excel أولاً لرؤية رسم تدفق البيانات.',
      back: '→ رجوع',
    },
    toolbar: {
      back: '→ رجوع',
      sheets: 'أوراق',
      fkLinks: 'روابط م.غ',
      formulaLinks: 'روابط المعادلات',
      search: 'البحث في الأوراق...',
      allLinks: 'جميع الروابط',
      fkOnly: 'مفاتيح أجنبية فقط',
      formulasOnly: 'معادلات فقط',
    },
    legend: {
      title: 'دليل الألوان',
      fkRelationship: 'علاقة مفتاح أجنبي',
      formulaRef: 'مرجع معادلة',
      vlookup: 'بحث عمودي / VLOOKUP',
      aggregation: 'تجميع (SUM, COUNT)',
      conditional: 'شرطي (IF)',
    },
    popover: {
      fkTitle: '🔗 علاقة مفتاح أجنبي',
      funcTitle: '⚙️ ',
      funcTitleSuffix: ' دالة',
      dataFlowDir: 'اتجاه تدفق البيانات',
      fkFlowDesc: (src, tgt) => `يتم جلب البيانات من "${src}" إلى "${tgt}"`,
      formulaFlowDesc: (tgt, src) => `"${tgt}" يستخدم بيانات من "${src}" عبر معادلة`,
      relDetail: 'تفاصيل العلاقة',
      formulaDetail: 'معادلة / دالة',
      noFormula: 'لم يتم استخراج معادلة',
      flatMatrixDesc: 'مصفوفة حساب مسطحة (قاموس JSON)',
      entityDesc: (count) => `جدول كيان — ${count} أعمدة`,
      columns: 'الأعمدة',
      connections: 'الاتصالات',
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════════
   CUSTOM SHEET NODE - Professional Design
   ═══════════════════════════════════════════════════════════════════════ */
const SheetNode = ({ data, selected }) => {
  const isMatrix = data.isMatrix;
  const accentColor = isMatrix ? '#8b5cf6' : '#00d4ff';
  const lang = data.lang || 'en';
  const lt = LT[lang];
  const statusLabel = isMatrix ? lt.node.flatMatrix : lt.node.entity;
  const cols = data.columns || [];
  const pkCol = data.pk || 'id';
  const fks = data.fks || [];

  return (
    <div style={{
      background: 'rgba(10, 15, 28, 0.95)',
      backdropFilter: 'blur(12px)',
      border: `1.5px solid ${selected ? accentColor : 'rgba(30, 41, 59, 0.8)'}`,
      borderRadius: '12px',
      width: '280px',
      overflow: 'hidden',
      boxShadow: selected
        ? `0 0 25px ${accentColor}40, 0 8px 32px rgba(0,0,0,0.5)`
        : '0 4px 20px rgba(0,0,0,0.4)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Handles for edges */}
      <Handle type="target" position={Position.Top} style={{
        background: accentColor, width: '8px', height: '8px',
        border: '2px solid #0a0f1c', borderRadius: '50%'
      }} />
      <Handle type="source" position={Position.Bottom} style={{
        background: accentColor, width: '8px', height: '8px',
        border: '2px solid #0a0f1c', borderRadius: '50%'
      }} />
      <Handle type="target" position={Position.Left} id="left" style={{
        background: '#4ade80', width: '7px', height: '7px',
        border: '2px solid #0a0f1c', borderRadius: '50%', left: '-4px'
      }} />
      <Handle type="source" position={Position.Right} id="right" style={{
        background: '#4ade80', width: '7px', height: '7px',
        border: '2px solid #0a0f1c', borderRadius: '50%', right: '-4px'
      }} />

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${accentColor}15 0%, transparent 60%)`,
        borderBottom: `1px solid ${accentColor}30`,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{
          fontSize: '16px',
          filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))'
        }}>
          {isMatrix ? '📊' : '🗃️'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#e2e8f0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            direction: 'ltr',
            textAlign: 'left',
          }}>
            {data.originalName || data.label}
          </div>
          <div style={{
            fontSize: '9px',
            fontWeight: 600,
            color: accentColor,
            textTransform: lang === 'ar' ? 'none' : 'uppercase',
            letterSpacing: lang === 'ar' ? '0' : '1px',
            marginTop: '1px',
          }}>
            {statusLabel}
          </div>
        </div>
        <div style={{
          fontSize: '9px',
          color: '#64748b',
          background: 'rgba(255,255,255,0.04)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 600,
        }}>
          {cols.length} {lt.node.cols}
        </div>
      </div>

      {/* Body - Key info */}
      <div style={{ padding: '8px 14px 10px' }}>
        {/* PK */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: '4px', fontSize: '10.5px', direction: 'ltr', textAlign: 'left'
        }}>
          <span style={{ color: '#facc15', fontWeight: 700, fontSize: '9px' }}>{lt.node.pk}</span>
          <span style={{ color: '#94a3b8', fontFamily: "'Cascadia Code', monospace" }}>{pkCol}</span>
        </div>

        {/* FKs */}
        {fks.length > 0 && (
          <div style={{ marginBottom: '6px' }}>
            {fks.map((fk, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '10.5px', direction: 'ltr', textAlign: 'left',
                marginBottom: '2px'
              }}>
                <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '9px' }}>{lt.node.fk}</span>
                <span style={{ color: '#94a3b8', fontFamily: "'Cascadia Code', monospace" }}>
                  {fk.column} → {fk.references_table}.{fk.references_column}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Columns preview */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '5px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3px',
          direction: 'ltr',
        }}>
          {cols.slice(0, 6).map((col, i) => (
            <span key={i} style={{
              fontSize: '9px',
              color: col.name === pkCol ? '#facc15' : '#64748b',
              background: col.name === pkCol ? 'rgba(250,204,21,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${col.name === pkCol ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.06)'}`,
              padding: '1px 5px',
              borderRadius: '3px',
              fontFamily: "'Cascadia Code', monospace",
            }}>
              {col.name}
            </span>
          ))}
          {cols.length > 6 && (
            <span style={{
              fontSize: '9px',
              color: '#475569',
              padding: '1px 4px',
            }}>
              +{cols.length - 6}
            </span>
          )}
        </div>

        {/* Functional Role */}
        {data.functionalRole && (
          <div style={{
            marginTop: '6px',
            fontSize: '9px',
            color: '#64748b',
            direction: 'ltr',
            textAlign: 'left',
            fontStyle: 'italic',
          }}>
            {lt.node.role} {data.functionalRole}
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes = { sheetNode: SheetNode };

/* ── Helper: Sanitize name ── */
const sanitizeName = (name) => {
  if (!name) return "";
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
    if (incoming[e.source] !== undefined) incoming[e.source] = incoming[e.source];
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
      if (tempIncoming[target] === 0) {
        queue.push(target);
      }
    });
  }

  nodeIds.forEach(id => {
    if (!sorted.includes(id)) sorted.push(id);
  });

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

/* ═══════════════════════════════════════════════════════════════════════
   MAIN LINEAGE GRAPH COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
const LineageGraph = ({ result, onBack, lang = 'en' }) => {
  const lt = LT[lang];
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
          originalName: originalName,
          isMatrix: isMatrix,
          columns: tableData.columns || [],
          pk: tableData.pk || 'id',
          fks: tableData.fks || [],
          functionalRole: tableData.functional_role || tableData.status || '',
          lang: lang,
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
      let rawConsumer = ref.source || ref.source_table || (ref.from && ref.from.sheet) || "";
      let rawProvider = ref.target || ref.target_table || (ref.to && ref.to.sheet) || "";

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
            edgeColor = '#f472b6';
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
              rawFormula: rawFormula,
              source: providerName,
              target: consumerName,
              functionDetail: rawFormula || `${logicLabel}: ${providerName} → ${consumerName}`,
            },
          });
        }
      }
    });

    const positions = computeLayout(nodes.map(n => n.id), edges);
    nodes.forEach(node => {
      node.position = positions[node.id] || { x: 0, y: 0 };
    });

    return {
      initialNodes: nodes,
      initialEdges: edges,
      stats: { sheets: nodes.length, fks: fkCount, formulas: formulaCount }
    };
  }, [result, lang]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  /* ── Filter nodes by search ── */
  const displayNodes = useMemo(() => {
    if (!searchTerm.trim()) return nodes;
    const term = searchTerm.toLowerCase();
    return nodes.map(n => ({
      ...n,
      style: {
        ...n.style,
        opacity: (n.data.label || n.id).toLowerCase().includes(term) ? 1 : 0.15,
      }
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

  /* ── Event Handlers ── */
  const handleEdgeClick = useCallback((event, edge) => {
    setSelectedEdgeData(edge.data);
    setSelectedNodeData(null);
  }, []);

  const handleNodeClick = useCallback((event, node) => {
    setSelectedNodeData({
      id: node.id,
      ...node.data
    });
    setSelectedEdgeData(null);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedEdgeData(null);
    setSelectedNodeData(null);
  }, []);

  /* ── If no data ── */
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
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{lt.empty.title}</p>
        <p style={{ fontSize: '0.85rem' }}>{lt.empty.desc}</p>
        <button onClick={onBack} style={{
          background: '#1e293b', color: '#fff', border: 'none',
          padding: '8px 20px', borderRadius: '6px', cursor: 'pointer',
          fontWeight: 'bold', marginTop: '0.5rem'
        }}>
          {lt.empty.back}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      height: '85vh', width: '100%',
      background: '#090d16', borderRadius: '12px',
      border: '1px solid #1e293b',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* ── Top Toolbar ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 10, padding: '12px 16px',
        background: 'linear-gradient(180deg, rgba(9,13,22,0.95) 0%, rgba(9,13,22,0.7) 80%, transparent 100%)',
        display: 'flex', alignItems: 'center', gap: '12px',
        flexWrap: 'wrap',
      }}>
        <button onClick={onBack} style={{
          background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155',
          padding: '7px 14px', borderRadius: '6px', cursor: 'pointer',
          fontWeight: 600, fontSize: '12px',
          transition: 'all 0.2s',
        }}>
          {lt.toolbar.back}
        </button>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <StatBadge label={lt.toolbar.sheets} value={stats.sheets} color="#00d4ff" />
          <StatBadge label={lt.toolbar.fkLinks} value={stats.fks} color="#4ade80" />
          <StatBadge label={lt.toolbar.formulaLinks} value={stats.formulas} color="#38bdf8" />
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <input
            type="text"
            placeholder={lt.toolbar.search}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              background: '#0f172a', border: '1px solid #334155',
              color: '#e2e8f0', padding: '6px 12px 6px 30px',
              borderRadius: '6px', fontSize: '12px', width: '180px',
              outline: 'none', fontFamily: "'Inter', sans-serif",
            }}
          />
          <span style={{
            position: 'absolute', left: '10px', top: '50%',
            transform: 'translateY(-50%)', color: '#64748b', fontSize: '12px'
          }}>
            🔍
          </span>
        </div>

        {/* Filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{
            background: '#0f172a', border: '1px solid #334155',
            color: '#00d4ff', padding: '6px 10px',
            borderRadius: '6px', fontSize: '11px', fontWeight: 600,
            outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all">{lt.toolbar.allLinks}</option>
          <option value="fk">{lt.toolbar.fkOnly}</option>
          <option value="formula">{lt.toolbar.formulasOnly}</option>
        </select>
      </div>

      {/* ── Legend ── */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '16px', zIndex: 10,
        background: 'rgba(10, 15, 28, 0.92)', backdropFilter: 'blur(10px)',
        border: '1px solid #1e293b', borderRadius: '8px',
        padding: '10px 14px', fontSize: '10px',
      }}>
        <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: '6px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {lt.legend.title}
        </div>
        <LegendItem color="#4ade80" label={lt.legend.fkRelationship} dashed />
        <LegendItem color="#38bdf8" label={lt.legend.formulaRef} animated />
        <LegendItem color="#f59e0b" label={lt.legend.vlookup} animated />
        <LegendItem color="#a78bfa" label={lt.legend.aggregation} animated />
        <LegendItem color="#f472b6" label={lt.legend.conditional} animated />
      </div>

      {/* ── ReactFlow Canvas ── */}
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
          nodeColor={(n) => {
            if (n.data?.isMatrix) return '#8b5cf6';
            return '#00d4ff';
          }}
          maskColor="rgba(9, 13, 22, 0.85)"
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '8px',
          }}
          position="bottom-right"
        />
      </ReactFlow>

      {/* ── Edge Detail Popover ── */}
      {selectedEdgeData && (
        <EdgeDetailPopover data={selectedEdgeData} onClose={() => setSelectedEdgeData(null)} lt={lt} />
      )}

      {/* ── Node Detail Popover ── */}
      {selectedNodeData && (
        <NodeDetailPopover data={selectedNodeData} result={result} onClose={() => setSelectedNodeData(null)} lt={lt} />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

const StatBadge = ({ label, value, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '5px',
    background: 'rgba(255,255,255,0.03)', padding: '4px 10px',
    borderRadius: '5px', border: `1px solid ${color}25`,
  }}>
    <span style={{ color, fontWeight: 800, fontSize: '13px' }}>{value}</span>
    <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 500 }}>{label}</span>
  </div>
);

const LegendItem = ({ color, label, dashed, animated }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
    <div style={{
      width: '24px', height: '2px',
      background: color,
      borderRadius: '1px',
      borderStyle: dashed ? 'dashed' : 'solid',
      opacity: animated ? 0.8 : 1,
    }} />
    <span style={{ color: '#94a3b8' }}>{label}</span>
  </div>
);

const EdgeDetailPopover = ({ data, onClose, lt }) => {
  const isFK = data.logicType === 'FK';
  const accentColor = isFK ? '#4ade80' : '#38bdf8';

  return (
    <div className="synapto-edge-popover" style={{ borderColor: accentColor }}>
      <button className="synapto-popover-close" onClick={onClose}>✕</button>
      <h3 className="synapto-popover-title" style={{ color: accentColor }}>
        {isFK ? lt.popover.fkTitle : `${lt.popover.funcTitle}${data.logicType}${lt.popover.funcTitleSuffix}`}
      </h3>
      <div className="synapto-popover-info">
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#64748b', fontSize: '11px' }}>{lt.popover.dataFlowDir}</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginTop: '4px', fontSize: '13px',
          }}>
            <span style={{
              color: '#e2e8f0', fontWeight: 700,
              background: 'rgba(0,212,255,0.08)',
              padding: '3px 8px', borderRadius: '4px',
            }}>
              {data.source}
            </span>
            <span style={{ color: accentColor, fontWeight: 700, fontSize: '16px' }}>➜</span>
            <span style={{
              color: '#e2e8f0', fontWeight: 700,
              background: 'rgba(0,212,255,0.08)',
              padding: '3px 8px', borderRadius: '4px',
            }}>
              {data.target}
            </span>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
          {isFK
            ? lt.popover.fkFlowDesc(data.source, data.target)
            : lt.popover.formulaFlowDesc(data.target, data.source)
          }
        </div>
      </div>
      <div style={{ marginTop: '10px', marginBottom: '4px', fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {isFK ? lt.popover.relDetail : lt.popover.formulaDetail}
      </div>
      <div className="synapto-popover-code">
        <code>{data.functionDetail || data.rawFormula || lt.popover.noFormula}</code>
      </div>
    </div>
  );
};

const NodeDetailPopover = ({ data, result, onClose, lt }) => {
  const nodeMeta = result?.tables_metadata?.[data.id];
  if (!nodeMeta) return null;

  const isMatrix = nodeMeta.status === 'Flat_Calculation_Matrix';
  const accentColor = isMatrix ? '#8b5cf6' : '#00d4ff';

  const allRefs = result?.cross_sheet_refs || [];
  const connectedFrom = [];
  const connectedTo = [];

  allRefs.forEach(ref => {
    const source = ref.source || '';
    const target = ref.target || '';
    if (target === data.id) connectedFrom.push(ref);
    if (source === data.id) connectedTo.push(ref);
  });

  const fkSources = (nodeMeta.fks || []).map(fk => fk.references_table).filter(Boolean);
  const fkConsumers = [];
  Object.entries(result?.tables_metadata || {}).forEach(([tName, tMeta]) => {
    (tMeta.fks || []).forEach(fk => {
      if (fk.references_table === data.id) {
        fkConsumers.push({ table: tName, column: fk.column, refCol: fk.references_column });
      }
    });
  });

  return (
    <div className="synapto-edge-popover" style={{ borderColor: accentColor, width: '420px' }}>
      <button className="synapto-popover-close" onClick={onClose}>✕</button>
      <h3 className="synapto-popover-title" style={{ color: accentColor }}>
        {isMatrix ? '📊' : '🗃️'} {data.originalName || data.id}
      </h3>

      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
        {isMatrix ? lt.popover.flatMatrixDesc : lt.popover.entityDesc(nodeMeta.columns?.length || 0)}
      </div>

      {/* Columns */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
          {lt.popover.columns}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', direction: 'ltr' }}>
          {(nodeMeta.columns || []).map((col, i) => {
            const isPK = col.name === (nodeMeta.pk || 'id');
            const isFK = (nodeMeta.fks || []).some(fk => fk.column === col.name);
            return (
              <span key={i} style={{
                fontSize: '10px', padding: '2px 6px', borderRadius: '3px',
                background: isPK ? 'rgba(250,204,21,0.1)' : isFK ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isPK ? 'rgba(250,204,21,0.3)' : isFK ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: isPK ? '#facc15' : isFK ? '#4ade80' : '#94a3b8',
                fontFamily: "'Cascadia Code', monospace",
              }}>
                {isPK && '🔑 '}{isFK && '🔗 '}{col.name} ({col.type})
              </span>
            );
          })}
        </div>
      </div>

      {/* Connections */}
      {(fkSources.length > 0 || fkConsumers.length > 0 || connectedFrom.length > 0 || connectedTo.length > 0) && (
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            {lt.popover.connections}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {fkSources.map((src, i) => (
              <ConnectionRow key={`fk-src-${i}`} from={src} to={data.id} type="FK" color="#4ade80" />
            ))}
            {fkConsumers.map((c, i) => (
              <ConnectionRow key={`fk-con-${i}`} from={data.id} to={c.table} type={`FK (${c.column})`} color="#4ade80" />
            ))}
            {connectedFrom.map((ref, i) => (
              <ConnectionRow key={`ref-from-${i}`} from={ref.source || '?'} to={data.id} type={ref.logic_type || 'REF'} color="#38bdf8" formula={ref.raw_formula} />
            ))}
            {connectedTo.map((ref, i) => (
              <ConnectionRow key={`ref-to-${i}`} from={data.id} to={ref.target || '?'} type={ref.logic_type || 'REF'} color="#38bdf8" formula={ref.raw_formula} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ConnectionRow = ({ from, to, type, color, formula }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '4px 8px', background: 'rgba(255,255,255,0.02)',
    borderRadius: '4px', fontSize: '11px', direction: 'ltr', textAlign: 'left',
  }}>
    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{from}</span>
    <span style={{ color, fontWeight: 700 }}>→</span>
    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{to}</span>
    <span style={{
      color, fontSize: '9px', fontWeight: 700,
      background: `${color}15`, padding: '1px 5px', borderRadius: '3px',
      marginLeft: 'auto',
    }}>
      {type}
    </span>
    {formula && (
      <div style={{
        fontSize: '9px', color: '#64748b',
        maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', fontFamily: "'Cascadia Code', monospace",
      }} title={formula}>
        {formula}
      </div>
    )}
  </div>
);

export default LineageGraph;
