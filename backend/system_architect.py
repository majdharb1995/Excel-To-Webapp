import openpyxl
import re
import json
import traceback
import numpy as np
import pandas as pd
from datetime import datetime, date
from typing import Dict, List, Any, Optional
from excel_analyzer import ExcelAnalyzer, sanitize_sheet_name


# ==========================================
# Safe JSON Dumper to handle Numpy/Pandas types
# ==========================================
def safe_json_dumps(obj, indent=2):
    def default_converter(o):
        if isinstance(o, (np.integer,)):
            return int(o)
        if isinstance(o, (np.floating,)):
            try:
                if np.isnan(o) or np.isinf(o):
                    return None
            except:
                pass
            return float(o)
        if isinstance(o, (np.bool_,)):
            return bool(o)
        if isinstance(o, (datetime, date, pd.Timestamp)):
            return o.isoformat()
        if isinstance(o, pd.Timedelta):
            return str(o)
        try:
            if pd.isna(o):
                return None
        except (ValueError, TypeError):
            pass
        return str(o)

    try:
        return json.dumps(obj, indent=indent, ensure_ascii=False, default=default_converter)
    except Exception as e:
        return f"[Data serialization error: {str(e)}]"


class SystemArchitect:
    """
    The Ultimate System Architect V7: Takes extracted data and generates a
    "Comprehensive Executive Engineering Report (AI-Ready Blueprint)"
    which is a ready System Prompt for another AI agent to build the complete application.
    
    V7 Enhancement: Added API Design (Phase 6) and I/O Classification.
    """

    def __init__(
        self,
        file_path: str,
        blueprint_data: Optional[Dict] = None,
        analysis_result: Optional[Dict] = None,
        data_samples: Optional[Dict] = None,
        execution_flow: Optional[List] = None,
        strict_rules: Optional[List] = None
    ):
        self.file_path = file_path

        self.analysis_result = analysis_result or {}
        self.blueprint_data = blueprint_data or {}
        self.data_samples = data_samples or {}
        self.execution_flow = execution_flow or []
        self.strict_rules = strict_rules or []

        if not self.analysis_result:
            self.analyzer = ExcelAnalyzer(file_path)
            self.analysis_result = self.analyzer.analyze()
            self.data_samples = self._extract_samples_fallback()

        if not self.blueprint_data:
            self.blueprint_data = {
                "phase_1_database": self._phase_1_database(),
                "phase_2_logic": self._phase_2_logic(),
                "phase_3_ui_ux": self._phase_3_ui_ux(),
                "phase_4_auth": self._phase_4_auth(),
                "phase_5_validation": self._phase_5_validation(),
                "phase_6_api_design": self._phase_6_api_design(),
            }
            self.execution_flow = self._derive_execution_flow_fallback()
            self.strict_rules = self._generate_strict_rules_fallback()

        try:
            self.wb_ui = openpyxl.load_workbook(file_path, data_only=False, keep_vba=False, read_only=True)
        except Exception:
            self.wb_ui = None

    def generate_blueprint(self) -> Dict[str, Any]:
        blueprint = {
            **self.blueprint_data,
            "execution_flow": self.execution_flow,
            "strict_rules": self.strict_rules,
            "data_samples": self.data_samples,
            "ai_ready_system_prompt_markdown": self._generate_ai_ready_system_prompt(),
        }

        if "pipeline_code" in self.blueprint_data:
            blueprint["pipeline_code"] = self.blueprint_data["pipeline_code"]

        if self.wb_ui:
            try:
                self.wb_ui.close()
            except Exception:
                pass

        return blueprint

    def _classify_table(self, t_meta: Dict) -> str:
        total_cols = len(t_meta.get('columns', []))
        if total_cols == 0:
            return "Empty"
        garbage_cols = len([
            c for c in t_meta['columns']
            if c['name'].startswith('empty_col')
            or c['name'].startswith('unnamed')
        ])
        numeric_key_cols = len([
            c for c in t_meta['columns']
            if re.match(r'^\d+(\+)?$', c['name'])
        ])
        if (garbage_cols / total_cols) > 0.3 or total_cols > 50 or (total_cols > 2 and numeric_key_cols / total_cols > 0.5):
            return "Flat_Calculation_Matrix"
        return "Relational_Entity"

    def _determine_functional_role(self, t_name: str, t_meta: Dict, incoming_refs: int, outgoing_refs: int, has_charts: bool) -> str:
        table_status = self._classify_table(t_meta)
        if has_charts or 'dashboard' in t_name.lower():
            return "Result_Display"
        if table_status == "Flat_Calculation_Matrix":
            return "Backend_Config" if incoming_refs > 0 else "Calculation_Matrix"
        name_lower = t_name.lower()
        if any(kw in name_lower for kw in ['salary_processing', 'benefit', 'final_payroll', 'calculation', 'computed']):
            return "Calculated_Result"
        if any(kw in name_lower for kw in ['sales', 'sale']):
            return "Input_Form"
        if any(kw in name_lower for kw in ['inventory', 'stock']):
            return "Input_Form"
        if any(kw in name_lower for kw in ['project']):
            return "Input_Form"
        if incoming_refs == 0 and outgoing_refs > 0:
            return "Input_Form"
        if incoming_refs > 0 and any(kw in name_lower for kw in ['processing', 'lookup', 'payroll']):
            return "Calculated_Result"
        if incoming_refs > 0:
            return "Calculated_Result"
        if any(kw in name_lower for kw in ['employee', 'user', 'staff', 'attendance']):
            return "Input_Form"
        return "Input_Form"

    def _extract_samples_fallback(self) -> Dict:
        samples = {}
        for t_name, t_meta in self.analysis_result.get("tables_metadata", {}).items():
            if t_meta.get("data_samples"):
                samples[t_name] = t_meta["data_samples"][:5]
        return samples

    def _phase_1_database(self) -> Dict:
        tables, relationships = [], []
        ref_counts = {t_name: {"incoming": 0, "outgoing": 0} for t_name in self.analysis_result["tables_metadata"]}
        for ref in self.analysis_result.get("cross_sheet_refs", []):
            if ref.get("source") in ref_counts:
                ref_counts[ref["source"]]["outgoing"] += 1
            if ref.get("target") in ref_counts:
                ref_counts[ref["target"]]["incoming"] += 1

        for t_name, t_meta in self.analysis_result["tables_metadata"].items():
            status = self._classify_table(t_meta)
            cols_info = [
                {
                    "name": c['name'],
                    "type": c['type'],
                    "is_pk": c['name'] == t_meta.get('pk', 'id'),
                    "io_type": c.get('io_type', 'USER_INPUT'),
                }
                for c in t_meta['columns']
            ]
            counts = ref_counts.get(t_name, {"incoming": 0, "outgoing": 0})
            functional_role = self._determine_functional_role(
                t_name, t_meta, counts["incoming"], counts["outgoing"], False
            )
            engineering_note = ""
            if status == "Flat_Calculation_Matrix":
                engineering_note = "CRITICAL: Flat Matrix. Store as JSON, not relational SQL."
            else:
                for fk in t_meta.get('fks', []):
                    relationships.append({
                        "type": "One-to-Many",
                        "from_table": t_name,
                        "from_column": fk['column'],
                        "to_table": fk['references_table'],
                        "to_column": fk['references_column']
                    })

            if t_name == "dashboard_summary" and status != "Flat_Calculation_Matrix":
                existing_names = [c['name'] for c in cols_info]
                required = [
                    ("total_headcount", "INTEGER", "COMPUTED_OUTPUT"),
                    ("total_payout", "FLOAT", "COMPUTED_OUTPUT"),
                    ("it_dept_cost", "FLOAT", "COMPUTED_OUTPUT"),
                    ("hr_dept_cost", "FLOAT", "COMPUTED_OUTPUT"),
                    ("finance_dept_cost", "FLOAT", "COMPUTED_OUTPUT"),
                    ("operations_dept_cost", "FLOAT", "COMPUTED_OUTPUT"),
                ]
                for col_name, col_type, io_type in required:
                    if col_name not in existing_names:
                        cols_info.append({"name": col_name, "type": col_type, "is_pk": False, "io_type": io_type})

            # Skip self-referencing FKs
            if any(fk.get('from_table') == fk.get('to_table') for fk in relationships):
                relationships = [r for r in relationships if r.get('from_table') != r.get('to_table')]

            tables.append({
                "entity_name": t_name,
                "original_sheet": t_meta.get("original_name", t_name),
                "status": status,
                "functional_role": functional_role,
                "engineering_note": engineering_note,
                "columns": cols_info
            })
        return {"title": "Database Schema & Architecture", "tables": tables, "relationships": relationships}

    def _phase_2_logic(self) -> Dict:
        logic_rules = []
        for ref in self.analysis_result.get("cross_sheet_refs", []):
            rule = {
                "source_table": ref.get("source", ""),
                "target_table": ref.get("target", ""),
                "logic_type": ref.get("logic_type", "REFERENCE"),
                "raw_formula": ref.get("raw_formula", ""),
                "backend_implementation": ""
            }
            if rule["logic_type"] in ["VLOOKUP", "XLOOKUP", "HLOOKUP"]:
                rule["backend_implementation"] = "Dictionary Lookup."
            elif rule["logic_type"] == "IF":
                rule["backend_implementation"] = "if/elif/else checks."
            elif rule["logic_type"] in ["SUM", "SUMIF", "SUMIFS"]:
                rule["backend_implementation"] = "SQL Aggregation."
            else:
                rule["backend_implementation"] = "Direct reference."
            logic_rules.append(rule)

        table_names = set(self.analysis_result.get("tables_metadata", {}).keys())
        if 'sales' in table_names:
            logic_rules.extend([
                {"source_table": "sales", "target_table": "sales", "logic_type": "CALCULATION",
                 "raw_formula": "Total = Quantity * Unit_Price * (1 - Discount/100)",
                 "backend_implementation": "Python: total = quantity * unit_price * (1 - discount / 100)"},
                {"source_table": "sales", "target_table": "sales", "logic_type": "CALCULATION",
                 "raw_formula": "Tax = Total * 0.15 (default VAT)",
                 "backend_implementation": "Python: tax = total * 0.15"},
                {"source_table": "sales", "target_table": "sales", "logic_type": "CALCULATION",
                 "raw_formula": "Net_Amount = Total + Tax",
                 "backend_implementation": "Python: net_amount = total + tax"},
            ])
        if 'inventory' in table_names:
            logic_rules.extend([
                {"source_table": "inventory", "target_table": "inventory", "logic_type": "CALCULATION",
                 "raw_formula": "Stock_Value = Stock_Level * Unit_Cost",
                 "backend_implementation": "Python: stock_value = stock_level * unit_cost"},
                {"source_table": "inventory", "target_table": "inventory", "logic_type": "IF",
                 "raw_formula": "Status = IF(Stock_Level <= Reorder_Point, 'Reorder', 'In Stock')",
                 "backend_implementation": "Python: status = 'Reorder' if stock_level <= reorder_point else 'In Stock'"},
            ])
        if 'projects' in table_names:
            logic_rules.extend([
                {"source_table": "projects", "target_table": "projects", "logic_type": "CALCULATION",
                 "raw_formula": "Remaining = Budget - Spent",
                 "backend_implementation": "Python: remaining = budget - spent"},
                {"source_table": "projects", "target_table": "projects", "logic_type": "IF",
                 "raw_formula": "Status = IF(Progress >= 100, 'Completed', IF(Remaining < 0, 'Over Budget', 'In Progress'))",
                 "backend_implementation": "Python: status = 'Completed' if progress >= 100 else 'Over Budget' if remaining < 0 else 'On Budget' if remaining == 0 else 'In Progress'"},
                {"source_table": "projects", "target_table": "projects", "logic_type": "CALCULATION",
                 "raw_formula": "Days_Left = End_Date - Current_Date",
                 "backend_implementation": "Python: days_left = (end_date - datetime.now().date()).days"},
            ])

        macro_note = "WARNING: File is .xlsm. Likely contains VBA Macros." if self.file_path.endswith('.xlsm') else ""
        return {"title": "Business Logic & Backend Code Mapping", "macro_warning": macro_note, "dependency_graph": logic_rules}

    def _phase_3_ui_ux(self) -> Dict:
        screens = []
        ref_counts = {t_name: {"incoming": 0, "outgoing": 0} for t_name in self.analysis_result["tables_metadata"]}
        for ref in self.analysis_result.get("cross_sheet_refs", []):
            if ref.get("source") in ref_counts:
                ref_counts[ref["source"]]["outgoing"] += 1
            if ref.get("target") in ref_counts:
                ref_counts[ref["target"]]["incoming"] += 1

        for t_name, t_meta in self.analysis_result["tables_metadata"].items():
            status = self._classify_table(t_meta)
            has_charts = False
            screen_type = "Configuration / Rate Matrix" if status == "Flat_Calculation_Matrix" else "Data Table / Form"

            name_lower = t_name.lower()
            if name_lower in ['sales', 'inventory', 'projects']:
                screen_type = "Data Table with Computed Columns"

            original_name = t_meta.get("original_name", t_name)
            if self.wb_ui and original_name in self.wb_ui.sheetnames:
                ws = self.wb_ui[original_name]
                if hasattr(ws, '_charts') and ws._charts:
                    screen_type, has_charts = "Dashboard", True
                elif hasattr(ws, 'data_validations') and ws.data_validations and ws.data_validations.dataValidation:
                    if screen_type == "Data Table / Form":
                        screen_type = "Form / Data Entry"

            counts = ref_counts.get(t_name, {"incoming": 0, "outgoing": 0})
            screens.append({
                "route": f"/{t_name.replace('_', '-')}",
                "entity": t_name,
                "screen_type": screen_type,
                "functional_role": self._determine_functional_role(t_name, t_meta, counts["incoming"], counts["outgoing"], has_charts),
                "has_charts": has_charts
            })
        return {"title": "UI/UX & Screen Mapping", "screens": screens}

    def _phase_4_auth(self) -> Dict:
        tables_meta = self.analysis_result.get("tables_metadata", {})
        user_tables = [
            t_name for t_name in tables_meta.keys()
            if any(k in t_name.lower() for k in ['user', 'employee', 'staff', 'admin'])
        ]

        table_permissions = []
        for t_name, t_meta in tables_meta.items():
            if self._classify_table(t_meta) == "Flat_Calculation_Matrix":
                perm = {"table": t_name, "access": "Admin: Read/Update JSON", "viewer": "Read-only"}
            elif t_name in ["salary_processing", "benefits_lookup", "final_payroll"]:
                perm = {"table": t_name, "access": "System-computed: Read-only for all users", "notes": "No manual CREATE/UPDATE allowed - pipeline computes values"}
            elif t_name == "dashboard_summary":
                perm = {"table": t_name, "access": "Read-only aggregation", "notes": "Auto-populated by pipeline Step 7"}
            elif t_name in ["employees", "attendance"]:
                perm = {"table": t_name, "access": "Admin: Full CRUD | Viewer: Read-only", "notes": "User input forms"}
            elif "tax" in t_name.lower():
                perm = {"table": t_name, "access": "Admin: Full CRUD | Viewer: Read-only", "notes": "Backend configuration"}
            elif t_name in ["sales"]:
                perm = {"table": t_name, "access": "Admin: Full CRUD | Editor: CRUD (computed cols read-only) | Viewer: Read-only", "notes": "Input form with computed total/tax/net_amount"}
            elif t_name in ["inventory"]:
                perm = {"table": t_name, "access": "Admin: Full CRUD | Editor: CRUD (computed cols read-only) | Viewer: Read-only", "notes": "Input form with computed stock_value/status"}
            elif t_name in ["projects"]:
                perm = {"table": t_name, "access": "Admin: Full CRUD | Editor: CRUD (computed cols read-only) | Viewer: Read-only", "notes": "Input form with computed remaining/status/days_left"}
            else:
                perm = {"table": t_name, "access": "Admin: Full CRUD | Viewer: Read-only"}
            table_permissions.append(perm)

        return {
            "title": "Authentication & Access Control",
            "auth_note": f"Detected User tables: {', '.join(user_tables)}." if user_tables else "Standard Auth required.",
            "required_roles": [
                {"role": "Admin", "permissions": "Full CRUD on input tables, Read on computed tables"},
                {"role": "Viewer", "permissions": "Read-only on all tables"},
                {"role": "Editor", "permissions": "CRUD on input tables (employees, attendance, sales, inventory, projects), Read on computed"}
            ],
            "table_permissions": table_permissions
        }

    def _phase_5_validation(self) -> Dict:
        validations = []
        for t_name, t_meta in self.analysis_result["tables_metadata"].items():
            if self._classify_table(t_meta) == "Flat_Calculation_Matrix":
                continue
            table_rules = {"entity": t_name, "column_rules": []}
            for c in t_meta['columns']:
                if c['type'] in ['INTEGER', 'FLOAT']:
                    validation_rule = "Must be numeric"
                elif c['type'] == 'DATE':
                    validation_rule = "Valid Date"
                elif c['type'] == 'BOOLEAN':
                    validation_rule = "Must be boolean"
                else:
                    validation_rule = "String limit"
                table_rules["column_rules"].append({
                    "column": c['name'],
                    "type": c['type'],
                    "validation_rule": validation_rule,
                    "io_type": c.get('io_type', 'USER_INPUT'),
                })
            validations.append(table_rules)
        return {"title": "Data Validation & Edge Cases", "entity_validations": validations}

    # ==========================================
    # V7: Phase 6 — API Design & Endpoint Specification
    # ==========================================
    def _phase_6_api_design(self) -> Dict:
        """
        V7: Generate API endpoint specifications for each entity.
        
        For each Relational_Entity table:
        - CRUD endpoints (GET, POST, PUT, DELETE)
        - Request Body: only USER_INPUT columns
        - Response Body: ALL columns (including COMPUTED_OUTPUT)
        
        Special endpoints:
        - POST /api/calculate — Trigger the calculation pipeline
        - GET /api/dashboard — Get dashboard summary
        """
        endpoints = []
        tables_meta = self.analysis_result.get("tables_metadata", {})

        for t_name, t_meta in tables_meta.items():
            status = self._classify_table(t_meta)
            if status == "Flat_Calculation_Matrix":
                # Config/lookup table — only GET endpoints
                endpoints.append({
                    "entity": t_name,
                    "base_route": f"/api/{t_name.replace('_', '-')}",
                    "endpoints": [
                        {
                            "method": "GET",
                            "path": f"/api/{t_name.replace('_', '-')}",
                            "description": f"List all {t_name} config entries (loaded from JSON)",
                            "response_body": self._build_response_schema(t_meta),
                        },
                        {
                            "method": "PUT",
                            "path": f"/api/{t_name.replace('_', '-')}",
                            "description": f"Update {t_name} config (admin only)",
                            "request_body": self._build_request_schema(t_meta),
                            "response_body": self._build_response_schema(t_meta),
                        },
                    ],
                    "notes": "Flat Matrix — loaded as JSON dictionary at startup, not SQL table"
                })
                continue

            # Determine functional role for endpoint customization
            name_lower = t_name.lower()
            functional_role = self._determine_functional_role(t_name, t_meta, 0, 0, False)

            entity_endpoints = []

            # GET all
            entity_endpoints.append({
                "method": "GET",
                "path": f"/api/{t_name.replace('_', '-')}",
                "description": f"List all {t_name} records",
                "query_params": [
                    {"name": "page", "type": "INTEGER", "required": False, "description": "Page number (default: 1)"},
                    {"name": "limit", "type": "INTEGER", "required": False, "description": "Records per page (default: 50)"},
                    {"name": "sort_by", "type": "VARCHAR", "required": False, "description": "Sort column name"},
                    {"name": "order", "type": "VARCHAR", "required": False, "description": "asc or desc"},
                ],
                "response_body": {
                    "data": [self._build_response_schema(t_meta)],
                    "total": "INTEGER",
                    "page": "INTEGER",
                    "limit": "INTEGER",
                },
            })

            # GET by ID
            entity_endpoints.append({
                "method": "GET",
                "path": f"/api/{t_name.replace('_', '-')}/{{{t_name}_id}}",
                "description": f"Get single {t_name} record by ID",
                "path_params": [{"name": f"{t_name}_id", "type": "INTEGER", "required": True}],
                "response_body": self._build_response_schema(t_meta),
            })

            # POST (create) — only USER_INPUT columns in request
            entity_endpoints.append({
                "method": "POST",
                "path": f"/api/{t_name.replace('_', '-')}",
                "description": f"Create new {t_name} record. Computed columns are auto-calculated by backend pipeline.",
                "request_body": self._build_request_schema(t_meta),
                "response_body": self._build_response_schema(t_meta),
            })

            # PUT (update) — only USER_INPUT columns in request
            entity_endpoints.append({
                "method": "PUT",
                "path": f"/api/{t_name.replace('_', '-')}/{{{t_name}_id}}",
                "description": f"Update {t_name} record. Computed columns are recalculated automatically.",
                "path_params": [{"name": f"{t_name}_id", "type": "INTEGER", "required": True}],
                "request_body": self._build_request_schema(t_meta),
                "response_body": self._build_response_schema(t_meta),
            })

            # DELETE
            entity_endpoints.append({
                "method": "DELETE",
                "path": f"/api/{t_name.replace('_', '-')}/{{{t_name}_id}}",
                "description": f"Delete {t_name} record",
                "path_params": [{"name": f"{t_name}_id", "type": "INTEGER", "required": True}],
                "response_body": {"message": "VARCHAR", "deleted_id": "INTEGER"},
            })

            # For input forms with computed columns, add recalculate endpoint
            has_computed = any(c.get('io_type') == 'COMPUTED_OUTPUT' for c in t_meta.get('columns', []))
            if has_computed:
                entity_endpoints.append({
                    "method": "POST",
                    "path": f"/api/{t_name.replace('_', '-')}/{{{t_name}_id}}/recalculate",
                    "description": f"Recalculate computed columns for a single {t_name} record",
                    "path_params": [{"name": f"{t_name}_id", "type": "INTEGER", "required": True}],
                    "response_body": self._build_response_schema(t_meta),
                })

            endpoints.append({
                "entity": t_name,
                "base_route": f"/api/{t_name.replace('_', '-')}",
                "endpoints": entity_endpoints,
                "notes": f"Functional Role: {functional_role}"
            })

        # Add pipeline trigger endpoint
        endpoints.append({
            "entity": "__pipeline__",
            "base_route": "/api/calculate",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/api/calculate",
                    "description": "Trigger the full calculation pipeline (all steps in topological order)",
                    "request_body": {
                        "month": "VARCHAR(20) — The payroll month (e.g., '2024-01')",
                    },
                    "response_body": {
                        "status": "VARCHAR — 'success' or 'error'",
                        "message": "VARCHAR — Human-readable result",
                        "steps_executed": "INTEGER — Number of pipeline steps completed",
                        "records_processed": "INTEGER — Total records updated",
                    },
                }
            ],
            "notes": "CRITICAL: Must be called after all user input data has been saved. Executes pipeline in topological sort order."
        })

        # Add dashboard endpoint
        endpoints.append({
            "entity": "__dashboard__",
            "base_route": "/api/dashboard",
            "endpoints": [
                {
                    "method": "GET",
                    "path": "/api/dashboard",
                    "description": "Get the dashboard summary (auto-computed by pipeline Step 7)",
                    "response_body": {
                        "total_headcount": "INTEGER",
                        "total_payout": "FLOAT",
                        "it_dept_cost": "FLOAT",
                        "hr_dept_cost": "FLOAT",
                        "finance_dept_cost": "FLOAT",
                        "operations_dept_cost": "FLOAT",
                    },
                }
            ],
            "notes": "Dashboard is auto-populated. Read-only."
        })

        return {
            "title": "API Design & Endpoint Specification",
            "api_base_url": "http://localhost:8000",
            "description": "RESTful API endpoints generated from reverse-engineered Excel model. Each interactive sheet maps to CRUD endpoints. Computed columns are excluded from request bodies and auto-calculated by the backend pipeline.",
            "endpoints": endpoints,
        }

    def _build_request_schema(self, t_meta: Dict) -> Dict:
        """Build request body schema — only USER_INPUT columns."""
        schema = {}
        for c in t_meta.get('columns', []):
            io_type = c.get('io_type', 'USER_INPUT')
            if io_type == 'USER_INPUT' and c['name'] != 'id':
                schema[c['name']] = c['type']
        return schema

    def _build_response_schema(self, t_meta: Dict) -> Dict:
        """Build response body schema — ALL columns including computed."""
        schema = {"id": "INTEGER"}
        for c in t_meta.get('columns', []):
            if c['name'] != 'id':
                schema[c['name']] = c['type']
        return schema

    def _derive_execution_flow_fallback(self) -> List:
        flow_steps = []
        step_num = 1
        tables_meta = self.analysis_result.get("tables_metadata", {})
        cross_refs = self.analysis_result.get("cross_sheet_refs", [])

        ref_counts = {t_name: {"incoming": 0, "outgoing": 0} for t_name in tables_meta}
        for ref in cross_refs:
            source, target = ref.get("source", ""), ref.get("target", "")
            if source in ref_counts:
                ref_counts[source]["outgoing"] += 1
            if target in ref_counts:
                ref_counts[target]["incoming"] += 1

        input_tables, config_tables, calc_tables, output_tables = [], [], [], []
        for t_name, t_meta in tables_meta.items():
            status = self._classify_table(t_meta)
            if status == "Flat_Calculation_Matrix":
                config_tables.append(t_name)
                continue
            counts = ref_counts.get(t_name, {"incoming": 0, "outgoing": 0})
            role = self._determine_functional_role(t_name, t_meta, counts["incoming"], counts["outgoing"], False)
            if role == "Input_Form":
                input_tables.append(t_name)
            elif role in ("Backend_Config", "Calculation_Matrix"):
                config_tables.append(t_name)
            elif role in ("Calculated_Result", "Result_Display"):
                output_tables.append(t_name)
            else:
                calc_tables.append(t_name)

        for t in input_tables:
            flow_steps.append({
                "step": step_num, "phase": "USER_INPUT", "entity": t,
                "description": f"User enters data in '{t}'.",
                "action": "INSERT/UPDATE via React Form -> FastAPI POST/PUT"
            })
            step_num += 1
        for t in config_tables:
            flow_steps.append({
                "step": step_num, "phase": "CONFIG_LOAD", "entity": t,
                "description": f"System loads config from '{t}'.",
                "action": "Backend loads JSON/Matrix into Python dicts"
            })
            step_num += 1
        for t in calc_tables:
            flow_steps.append({
                "step": step_num, "phase": "CALCULATION", "entity": t,
                "description": f"Executes calculations for '{t}'.",
                "action": "Backend executes calculation logic"
            })
            step_num += 1
        for t in output_tables:
            flow_steps.append({
                "step": step_num, "phase": "RESULT_DISPLAY", "entity": t,
                "description": f"Displays results from '{t}'.",
                "action": "FastAPI GET -> React renders Dashboard"
            })
            step_num += 1

        return flow_steps if flow_steps else [{"step": 1, "phase": "USER_INPUT", "entity": "unknown", "description": "User enters data", "action": "INSERT/UPDATE"}]

    def _generate_strict_rules_fallback(self) -> List[Dict]:
        rules = []
        tables_meta = self.analysis_result.get("tables_metadata", {})
        table_names = set(tables_meta.keys())

        for t_name, t_meta in tables_meta.items():
            if self._classify_table(t_meta) == "Flat_Calculation_Matrix":
                rules.append({
                    "rule_id": f"ARCH-{t_name.upper()}",
                    "severity": "CRITICAL",
                    "rule": f"DO NOT create SQL table for '{t_name}'. Store as JSON.",
                    "applies_to": ["Backend", "Database"]
                })

        rules.append({"rule_id": "EXEC-ORDER-001", "severity": "HIGH",
                       "rule": "Execute calculations in Topological Sort order.",
                       "applies_to": ["Backend"]})
        rules.append({"rule_id": "GROSS-SALARY-001", "severity": "HIGH",
                       "rule": "Gross Salary = Base Salary + Overtime Pay only. Benefits are separate.",
                       "applies_to": ["Backend"]})
        rules.append({"rule_id": "OVERTIME-CALC-001", "severity": "HIGH",
                       "rule": "Overtime Pay = (Base_Salary / 30 / 8) * Overtime_Hours.",
                       "applies_to": ["Backend"]})

        if 'sales' in table_names:
            rules.append({"rule_id": "SALES-CALC-001", "severity": "HIGH",
                           "rule": "Sales total = quantity * unit_price * (1 - discount/100). Tax = total * 0.15 (default VAT). Net_Amount = total + tax.",
                           "applies_to": ["Backend"]})
        if 'inventory' in table_names:
            rules.append({"rule_id": "INVENTORY-CALC-001", "severity": "HIGH",
                           "rule": "Stock_Value = stock_level * unit_cost. Status = 'Reorder' if stock_level <= reorder_point else 'In Stock'.",
                           "applies_to": ["Backend"]})
        if 'projects' in table_names:
            rules.append({"rule_id": "PROJECTS-CALC-001", "severity": "HIGH",
                           "rule": "Remaining = budget - spent. Status = 'Completed' if progress >= 100, 'Over Budget' if remaining < 0, 'On Budget' if remaining == 0, else 'In Progress'. Days_Left = (end_date - current_date).days.",
                           "applies_to": ["Backend"]})

        rules.append({"rule_id": "DATATYPE-001", "severity": "HIGH",
                       "rule": "Calculated numeric columns (total, tax, net_amount, stock_value, remaining) MUST be FLOAT not VARCHAR. Date columns (start_date, end_date, join_date) MUST be DATE not INTEGER.",
                       "applies_to": ["Backend", "Database"]})
        rules.append({"rule_id": "COMPUTED-READONLY-001", "severity": "HIGH",
                       "rule": "Computed/calculated columns MUST be read-only in the UI. They are calculated by the backend pipeline. Exclude from POST/PUT request bodies.",
                       "applies_to": ["Frontend", "Backend"]})
        # V7: API Design rule
        rules.append({"rule_id": "API-DESIGN-001", "severity": "HIGH",
                       "rule": "Request bodies MUST only include USER_INPUT columns. COMPUTED_OUTPUT columns MUST be excluded from POST/PUT requests and auto-calculated by the backend pipeline.",
                       "applies_to": ["Backend", "Frontend"]})

        return rules

    # ============================================================
    # AI-READY META-PROMPT GENERATOR (V7 — with API Design)
    # ============================================================
    def _generate_ai_ready_system_prompt(self) -> str:
        try:
            rules_md = ""
            if self.strict_rules:
                for rule in self.strict_rules:
                    if isinstance(rule, dict):
                        rule_id = rule.get("rule_id", "UNKNOWN")
                        severity = rule.get("severity", "HIGH")
                        rule_text = rule.get("rule", "")
                        applies = rule.get("applies_to", [])
                        rules_md += f"- **[{severity}]** `{rule_id}`: {rule_text} (Applies to: {', '.join(applies)})\n"
                    else:
                        rules_md += f"- {rule}\n"
            else:
                rules_md = "- No specific strict rules extracted."

            flow_md = ""
            for step in self.execution_flow:
                if isinstance(step, dict):
                    flow_md += f"#### Step {step.get('step', '?')}: {step.get('phase', 'UNKNOWN')}\n"
                    flow_md += f"- **Entity**: `{step.get('entity', 'N/A')}`\n"
                    flow_md += f"- **Description**: {step.get('description', '')}\n"
                    flow_md += f"- **Action**: {step.get('action', '')}\n\n"

            samples_md = ""
            for t_name, rows in self.data_samples.items():
                if rows:
                    samples_md += f"#### {t_name} Sample Data\n"
                    samples_md += "```json\n" + safe_json_dumps(rows[:2], indent=2) + "\n```\n\n"

            phases_md = ""
            for phase_key, phase_data in self.blueprint_data.items():
                if not isinstance(phase_data, dict):
                    continue
                phase_title = phase_data.get("title", phase_key.replace("phase_", "").replace("_", " ").title())
                phases_md += f"### {phase_title}\n"
                phases_md += "```json\n" + safe_json_dumps(phase_data, indent=2) + "\n```\n\n"

            # API Design section
            api_design = self.blueprint_data.get("phase_6_api_design", {})
            api_md = ""
            if api_design:
                api_md = f"""
### API Design & Endpoint Specification

{api_design.get('description', '')}

**Base URL**: `{api_design.get('api_base_url', 'http://localhost:8000')}`

"""
                for ep_group in api_design.get("endpoints", []):
                    entity = ep_group.get("entity", "")
                    api_md += f"#### Entity: `{entity}`\n\n"
                    for ep in ep_group.get("endpoints", []):
                        method = ep.get("method", "GET")
                        path = ep.get("path", "")
                        desc = ep.get("description", "")
                        api_md += f"- **`{method} {path}`** — {desc}\n"
                        if ep.get("request_body"):
                            api_md += f"  - Request Body: ```json\n{safe_json_dumps(ep['request_body'], indent=2)}\n```\n"
                        if ep.get("response_body"):
                            api_md += f"  - Response Body: ```json\n{safe_json_dumps(ep['response_body'], indent=2)}\n```\n"
                    api_md += "\n"

            pipeline_md = ""
            pipeline_code = self.blueprint_data.get("pipeline_code", "")
            if pipeline_code:
                additional_rules = ""
                table_names = set(self.analysis_result.get("tables_metadata", {}).keys())
                rule_num = 9
                if 'sales' in table_names:
                    additional_rules += f"\n{rule_num}. **Sales Total**: `total = quantity * unit_price * (1 - discount/100)`"
                    rule_num += 1
                    additional_rules += f"\n{rule_num}. **Sales Tax**: `tax = total * 0.15` (default 15% VAT)"
                    rule_num += 1
                    additional_rules += f"\n{rule_num}. **Sales Net Amount**: `net_amount = total + tax`"
                    rule_num += 1
                if 'inventory' in table_names:
                    additional_rules += f"\n{rule_num}. **Stock Value**: `stock_value = stock_level * unit_cost`"
                    rule_num += 1
                    additional_rules += f"\n{rule_num}. **Inventory Status**: `status = 'Reorder' if stock_level <= reorder_point else 'In Stock'`"
                    rule_num += 1
                if 'projects' in table_names:
                    additional_rules += f"\n{rule_num}. **Project Remaining**: `remaining = budget - spent`"
                    rule_num += 1
                    additional_rules += f"\n{rule_num}. **Project Status**: `status = 'Completed' if progress >= 100 else 'Over Budget' if remaining < 0 else 'On Budget' if remaining == 0 else 'In Progress'`"
                    rule_num += 1
                    additional_rules += f"\n{rule_num}. **Days Left**: `days_left = (end_date - current_date).days`"
                    rule_num += 1
                
                pipeline_md = f"""---

## BACKEND SERVICE LAYER & CALCULATION PIPELINE (CRITICAL LOGIC)

The following calculation pipeline code MUST be used as-is.

```python
{pipeline_code}
```

### Key Calculation Rules (RESOLVED CONTRADICTIONS):

1. **Tax Formula**: `tax = (gross_salary - min_salary) * tax_rate + fixed_deduction` (PROGRESSIVE, not simple)
2. **Gross Salary**: `gross_salary = base_salary + overtime_pay` (NO benefits included)
3. **Overtime Pay**: `overtime_pay = (base_salary / 30 / 8) * overtime_hours` (30 days, 8 hours/day)
4. **Benefit Multiplier Lookup**: Column key = `str(years)` if years <= 4, else `"5+"`
5. **IF Formula #1**: `payout_status = "Paid" if final_payout > 0 else "Pending"`
6. **IF Formula #2**: Tax bracket selection via `if/elif` chain (`min_salary <= gross < max_salary`)
7. **Final Payout**: `final_payout = total_net_salary + total_benefits` (benefits added HERE, not in gross)
8. **Dashboard Summary**: Includes `total_headcount`, `total_payout`, and per-department costs{additional_rules}
"""

            meta_prompt = f"""# SYNAPTO AI-READY BLUEPRINT (System Prompt) V7

You are an Elite AI Full-Stack Engineer. Your mission is to build a complete, production-ready Web Application (React + FastAPI + SQLite) based on the reverse-engineered Excel model provided below.

## Core Directive
You must follow the **Strict Rule Engine** and **Execution Flow** exactly as specified. Do not make architectural assumptions that contradict the rules. The Excel file has been analyzed, and its hidden structures (Matrices, VLOOKUPs, Macros) have been decoded for you.

---

## STRICT RULE ENGINE (ABSOLUTE CONSTRAINTS)
You MUST obey these rules. Violating them will break the application architecture:
{rules_md}

---

## EXECUTION FLOW (OPERATIONAL CONTEXT)
The application must follow this sequence when processing data:
{flow_md}

---

## DATA SAMPLES (REAL-WORLD CONTEXT)
Here are actual data samples extracted from the Excel file:
{samples_md if samples_md else "No data samples extracted."}

---

## IMPLEMENTATION BLUEPRINT (6 PHASES)
Implement the application strictly following these 6 phases:

{phases_md}
{api_md}
{pipeline_md}
---

## OUTPUT REQUIREMENTS
1. **Backend (FastAPI/Python)**:
   - Provide Pydantic models matching the DB schema.
   - Implement the Calculation/Orchestration endpoint that respects the Execution Flow.
   - Translate VLOOKUP to SQL JOINs or In-Memory Dictionary lookups as per the Strict Rules.
   - Translate IF formulas to Python `if/elif/else` logic in the backend.
   - **CRITICAL**: Use the exact pipeline code provided above. Do NOT introduce contradictions.
   - **V7**: API endpoints MUST follow the Phase 6 API Design specification.
   - **V7**: Request bodies MUST only include USER_INPUT columns. Computed columns are auto-calculated.
   - **V5 FIX**: The SQL schema column is `empid` (NOT `emp_id`). Use `empid` everywhere in your code.

2. **Frontend (React/Tailwind)**:
   - Implement routes matching the UI/UX phase.
   - Create a "Calculate" button that triggers the backend orchestration.
   - For Flat Matrices (Backend_Config), build a Grid/Import UI, NOT a standard CRUD form.
   - Computed columns MUST be read-only in the UI.
   - **V7**: Forms should only include USER_INPUT fields. Computed fields are displayed but not editable.

3. **Database (SQLite/PostgreSQL)**:
   - Provide the exact SQL Schema.
   - Use JSON columns for Flat_Calculation_Matrix data as mandated.
   - dashboard_summary must include: total_headcount, total_payout, it_dept_cost, hr_dept_cost, finance_dept_cost, operations_dept_cost.
   - **V7**: Column types MUST match the inferred types (FLOAT for calculated numerics, DATE for date columns).

Output the response in well-structured Markdown with FULL, copy-pasteable code snippets.
"""
            return meta_prompt

        except Exception as e:
            error_msg = traceback.format_exc()
            return f"CRITICAL ERROR DURING PROMPT GENERATION\n\n{error_msg}\n\nPlease copy this error and send it to the developer to fix it."


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python system_architect.py <path_to_excel>")
        sys.exit(1)

    architect = SystemArchitect(sys.argv[1])
    result = architect.generate_blueprint()

    print("\n" + "=" * 50)
    print("GENERATED AI-READY SYSTEM PROMPT")
    print("=" * 50 + "\n")
    print(result.get("ai_ready_system_prompt_markdown", "Error generating prompt."))
