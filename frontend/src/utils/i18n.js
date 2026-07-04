/**
 * SYNAPTO i18n — Arabic / English Translation Dictionary
 * Usage: t('key') returns the translated string based on current language
 */

const translations = {
  /* ── Navbar ── */
  'nav.brand': { en: 'SYNAPTO', ar: 'SYNAPTO' },
  'nav.sub': { en: 'System Architect Engine', ar: 'محرك هندسة الأنظمة' },
  'nav.tagline': { en: 'Reverse-Engineer Excel → Web App', ar: 'هندسة عكسية من Excel → تطبيق ويب' },
  'nav.lang': { en: 'عربي', ar: 'EN' },

  /* ── Hero ── */
  'hero.title.pre': { en: 'Decode Your ', ar: 'فكّ ترميز ' },
  'hero.title.highlight': { en: 'Excel', ar: 'Excel' },
  'hero.title.post': { en: ' Into Production Code', ar: ' إلى كود إنتاجي' },
  'hero.desc': {
    en: 'Upload any .xlsx / .xlsm file and Synapto will reverse-engineer its structure, formulas, VLOOKUPs, and hidden logic into a complete AI-ready blueprint with a 7-step calculation pipeline, SQL schema, data lineage graph, and system prompt that any AI agent can use to build the full web application.',
    ar: 'ارفع أي ملف .xlsx / .xlsm وسيقوم Synapto بالهندسة العكسية لهيكل البيانات، الصيغ، VLOOKUPs، والمنطق المخفي إلى مخطط كامل جاهز للذكاء الاصطناعي مع خط أنابيب حسابي من 7 خطوات، ومخطط SQL، ورسم نسب البيانات، وموجه نظام يمكن لأي وكيل ذكاء اصطناعي استخدامه لبناء التطبيق الكامل.'
  },
  'hero.selectFile': { en: 'Select Excel File', ar: 'اختر ملف Excel' },
  'hero.fileSelected': { en: 'selected', ar: 'تم الاختيار' },
  'hero.analyze': { en: 'Analyze', ar: 'تحليل' },
  'hero.analyzing': { en: 'Analyzing...', ar: 'جاري التحليل...' },
  'hero.architect': { en: 'Architect Blueprint', ar: 'مخطط البنية' },
  'hero.building': { en: 'Building...', ar: 'جاري البناء...' },

  /* ── Sidebar Cards ── */
  'sidebar.fileQuality': { en: 'File Quality', ar: 'جودة الملف' },
  'sidebar.filled': { en: 'filled', ar: 'معبأ' },
  'sidebar.sheets': { en: 'Sheets', ar: 'أوراق' },
  'sidebar.filledCells': { en: 'Filled Cells', ar: 'خلايا معبأة' },
  'sidebar.formulas': { en: 'Formulas', ar: 'صيغ' },
  'sidebar.schemaOverview': { en: 'Schema Overview', ar: 'نظرة عامة على المخطط' },
  'sidebar.tablesDetected': { en: 'Tables Detected', ar: 'جداول مكتشفة' },
  'sidebar.relationalEntities': { en: 'Relational Entities', ar: 'كيانات علائقية' },
  'sidebar.flatMatrices': { en: 'Flat Matrices', ar: 'مصفوفات مسطحة' },
  'sidebar.crossSheetRefs': { en: 'Cross-Sheet Refs', ar: 'مراجع بين الأوراق' },
  'sidebar.detectedSheets': { en: 'Detected Sheets', ar: 'الأوراق المكتشفة' },

  /* ── Tabs ── */
  'tab.metadata': { en: 'Metadata', ar: 'البيانات الوصفية' },
  'tab.logic': { en: 'Logic', ar: 'المنطق' },
  'tab.sql': { en: 'SQL', ar: 'SQL' },
  'tab.apiDesign': { en: 'API Design', ar: 'تصميم API' },
  'tab.architect': { en: 'Architect', ar: 'المعماري' },
  'tab.aiReport': { en: 'AI Report', ar: 'تقرير AI' },

  /* ── Metadata Tab ── */
  'meta.column': { en: 'Column', ar: 'العمود' },
  'meta.type': { en: 'Type', ar: 'النوع' },
  'meta.constraints': { en: 'Constraints', ar: 'القيود' },
  'meta.flatMatrix': { en: 'FLAT MATRIX', ar: 'مصفوفة مسطحة' },
  'meta.entity': { en: 'ENTITY', ar: 'كيان' },
  'meta.jsonNote': { en: 'Stored as JSON dictionary - NOT a SQL table', ar: 'مخزّن كقاموس JSON — ليس جدول SQL' },

  /* ── Logic Tab ── */
  'logic.title': { en: 'Business Logic & Data Lineage', ar: 'المنطق التجاري ونسب البيانات' },
  'logic.subtitle': { en: 'Formulas, cross-sheet references, and calculation dependencies', ar: 'الصيغ، المراجع بين الأوراق، وتبعيات الحساب' },
  'logic.openLineage': { en: 'Open Interactive Lineage Graph', ar: 'فتح رسم النسب التفاعلي' },
  'logic.lineageHint': { en: 'Visual graph with draggable nodes, FK relations, and formula flows', ar: 'رسم بصري بعقد قابلة للسحب، علاقات FK، وتدفقات الصيغ' },
  'logic.crossSheet': { en: 'Cross-Sheet Data Flow', ar: 'تدفق البيانات بين الأوراق' },
  'logic.showPipeline': { en: 'Show 7-Step Pipeline Code', ar: 'عرض كود خط الأنابيب من 7 خطوات' },
  'logic.hidePipeline': { en: 'Hide 7-Step Pipeline Code', ar: 'إخفاء كود خط الأنابيب' },
  'logic.pipelineTitle': { en: 'Calculation Pipeline (7 Steps - Topological Sort)', ar: 'خط أنابيب الحساب (7 خطوات - ترتيب طوبولوجي)' },
  'logic.copy': { en: 'Copy', ar: 'نسخ' },

  /* ── SQL Tab ── */
  'sql.title': { en: 'Generated SQL Schema', ar: 'مخطط SQL المُولّد' },
  'sql.copySql': { en: 'Copy SQL', ar: 'نسخ SQL' },
  'sql.notAvailable': { en: 'SQL schema not available. Run Analyze first.', ar: 'مخطط SQL غير متوفر. شغّل التحليل أولاً.' },

  /* ── API Design Tab ── */
  'api.notGenerated': { en: 'API Design Not Generated Yet', ar: 'تصميم API لم يتم توليده بعد' },
  'api.generateHint': { en: 'Click "Architect Blueprint" above to generate the API specifications.', ar: 'اضغط "مخطط البنية" أعلاه لتوليد مواصفات API.' },
  'api.baseUrl': { en: 'Base URL', ar: 'رابط الأساس' },
  'api.requestBody': { en: 'Request Body:', ar: 'هيكل الطلب:' },
  'api.responseBody': { en: 'Response Body:', ar: 'هيكل الاستجابة:' },
  'api.pipelineTrigger': { en: 'Pipeline Trigger', ar: 'مشغّل خط الأنابيب' },
  'api.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'api.entity': { en: 'Entity', ar: 'كيان' },
  'api.note': { en: 'Note', ar: 'ملاحظة' },

  /* ── Architect Tab ── */
  'arch.noBlueprint': { en: 'No Blueprint Generated Yet', ar: 'لم يتم توليد مخطط البنية بعد' },
  'arch.generateHint': { en: 'Click "Architect Blueprint" above to generate the full 5-phase blueprint.', ar: 'اضغط "مخطط البنية" أعلاه لتوليد المخطط الكامل من 5 مراحل.' },
  'arch.phase1': { en: 'Phase 1: Database Schema & Architecture', ar: 'المرحلة 1: مخطط قاعدة البيانات والبنية' },
  'arch.phase2': { en: 'Phase 2: Business Logic & Backend Code Mapping', ar: 'المرحلة 2: المنطق التجاري ورسم الكود الخلفي' },
  'arch.phase3': { en: 'Phase 3: UI/UX & Screen Mapping', ar: 'المرحلة 3: واجهة المستخدم ورسم الشاشات' },
  'arch.phase4': { en: 'Phase 4: Authentication & Access Control', ar: 'المرحلة 4: المصادقة والتحكم بالوصول' },
  'arch.phase5': { en: 'Phase 5: Data Validation & Edge Cases', ar: 'المرحلة 5: التحقق من البيانات والحالات الحدية' },
  'arch.executionFlow': { en: 'Execution Flow (Topological Sort)', ar: 'تدفق التنفيذ (ترتيب طوبولوجي)' },
  'arch.strictRules': { en: 'Strict Engineering Rules', ar: 'قواعد الهندسة الصارمة' },
  'arch.pipelineCode': { en: 'Pipeline Code (7 Steps - Topological Sort)', ar: 'كود خط الأنابيب (7 خطوات)' },
  'arch.aiPrompt': { en: 'AI-Ready System Prompt', ar: 'موجه نظام جاهز للذكاء الاصطناعي' },
  'arch.relationships': { en: 'Relationships', ar: 'العلاقات' },
  'arch.dependencyGraph': { en: 'Dependency Graph', ar: 'رسم التبعيات' },
  'arch.contradictions': { en: 'Resolved Calculation Contradictions', ar: 'تناقضات الحساب المحلولة' },
  'arch.columns': { en: 'Columns', ar: 'الأعمدة' },
  'arch.copyPrompt': { en: 'Copy Prompt', ar: 'نسخ الموجه' },
  'arch.promptHint': { en: 'Copy this prompt and send it to any AI agent to build the full application.', ar: 'انسخ هذا الموجه وأرسله لأي وكيل ذكاء اصطناعي لبناء التطبيق الكامل.' },
  'arch.enrichedSchema': { en: 'Enriched Schema', ar: 'مخطط مُثرى' },

  /* ── AI Report Tab ── */
  'report.noReport': { en: 'No AI Report Yet', ar: 'لا يوجد تقرير AI بعد' },
  'report.generateHint': { en: 'Select an AI provider above and click "Generate AI Report".', ar: 'اختر مزود AI أعلاه واضغط "توليد تقرير AI".' },
  'report.apiKeysHint': { en: 'Requires API keys set in backend environment variables (OPENROUTER_API_KEY or GEMINI_API_KEY).', ar: 'يتطلب مفاتيح API في متغيرات بيئة الخادم (OPENROUTER_API_KEY أو GEMINI_API_KEY).' },
  'report.title': { en: 'AI Implementation Report', ar: 'تقرير تنفيذ AI' },
  'report.copyFull': { en: 'Copy Full Report for AI Agent', ar: 'نسخ التقرير الكامل لوكيل AI' },
  'report.copiedFull': { en: 'Full Report Copied!', ar: 'تم نسخ التقرير الكامل!' },

  /* ── AI Action Bar ── */
  'action.generateAI': { en: 'Generate AI Report', ar: 'توليد تقرير AI' },
  'action.generating': { en: 'Generating...', ar: 'جاري التوليد...' },
  'action.downloadClean': { en: 'Download Clean Excel', ar: 'تحميل Excel نظيف' },
  'action.lineageGraph': { en: 'Data Lineage Graph', ar: 'رسم نسب البيانات' },
  'action.copyReport': { en: 'Copy Full Report', ar: 'نسخ التقرير الكامل' },
  'action.copied': { en: 'Copied!', ar: 'تم النسخ!' },
  'action.printReport': { en: 'Print Master Report', ar: 'طباعة التقرير الرئيسي' },

  /* ── Lineage Graph ── */
  'lineage.back': { en: '← Back', ar: '→ رجوع' },
  'lineage.noData': { en: 'No Schema Data Available', ar: 'لا توجد بيانات مخطط' },
  'lineage.noDataHint': { en: 'Upload and analyze an Excel file first to see the lineage graph.', ar: 'ارفع وحلّل ملف Excel أولاً لرؤية رسم نسب البيانات.' },
  'lineage.searchSheets': { en: 'Search sheets...', ar: 'البحث في الأوراق...' },
  'lineage.allLinks': { en: 'All Links', ar: 'كل الروابط' },
  'lineage.fkOnly': { en: 'FK Only', ar: 'FK فقط' },
  'lineage.formulasOnly': { en: 'Formulas Only', ar: 'الصيغ فقط' },
  'lineage.legend': { en: 'Legend', ar: 'دليل الألوان' },
  'lineage.sheets': { en: 'Sheets', ar: 'أوراق' },
  'lineage.fkLinks': { en: 'FK Links', ar: 'روابط FK' },
  'lineage.formulaLinks': { en: 'Formula Links', ar: 'روابط الصيغ' },
  'lineage.fkRelationship': { en: 'FK Relationship', ar: 'علاقة FK' },
  'lineage.formulaRef': { en: 'Formula Reference', ar: 'مرجع صيغة' },
  'lineage.vlookup': { en: 'VLOOKUP / XLOOKUP', ar: 'VLOOKUP / XLOOKUP' },
  'lineage.aggregation': { en: 'Aggregation (SUM, COUNT)', ar: 'تجميع (SUM, COUNT)' },
  'lineage.conditional': { en: 'Conditional (IF)', ar: 'شرطي (IF)' },
  'lineage.dataFlowDirection': { en: 'Data Flow Direction', ar: 'اتجاه تدفق البيانات' },
  'lineage.dataFetchedFrom': { en: 'Data is fetched from', ar: 'يتم جلب البيانات من' },
  'lineage.into': { en: 'into', ar: 'إلى' },
  'lineage.usesDataFrom': { en: 'uses data from', ar: 'يستخدم بيانات من' },
  'lineage.viaFormula': { en: 'via a formula', ar: 'عبر صيغة' },
  'lineage.relationshipDetail': { en: 'Relationship Detail', ar: 'تفاصيل العلاقة' },
  'lineage.formulaFunction': { en: 'Formula / Function', ar: 'صيغة / دالة' },
  'lineage.noFormula': { en: 'No formula extracted', ar: 'لم يتم استخراج صيغة' },
  'lineage.columns': { en: 'Columns', ar: 'الأعمدة' },
  'lineage.connections': { en: 'Connections', ar: 'الاتصالات' },
  'lineage.flatMatrixNote': { en: 'Flat Calculation Matrix (JSON Dictionary)', ar: 'مصفوفة حساب مسطحة (قاموس JSON)' },
  'lineage.entityNote': { en: 'Entity Table', ar: 'جدول كيان' },
  'lineage.cols': { en: 'cols', ar: 'أعمدة' },
  'lineage.role': { en: 'Role', ar: 'الدور' },

  /* ── License: Stopped Modal ── */
  'license.stopped.title': { en: 'Program Stopped', ar: 'البرنامج موقوف' },
  'license.stopped.desc': {
    en: 'You have used your free analysis. Activate to unlock all features for 30 days.',
    ar: 'لقد استخدمت تحليلك المجاني. فعّل البرنامج لفتح جميع الميزات لمدة 30 يوم.'
  },
  'license.stopped.activate': { en: 'Activate', ar: 'تفعيل' },

  /* ── License: Request Form ── */
  'license.request.title': { en: 'Request Activation', ar: 'طلب تفعيل' },
  'license.request.desc': {
    en: 'Fill in your details to request activation. You will be notified once approved.',
    ar: 'عبّئ بياناتك لطلب التفعيل. سيتم إبلاغك بعد الموافقة.'
  },
  'license.request.name': { en: 'Full Name *', ar: 'الاسم الكامل *' },
  'license.request.email': { en: 'Email Address *', ar: 'البريد الإلكتروني *' },
  'license.request.phone': { en: 'Phone Number', ar: 'رقم الهاتف' },
  'license.request.company': { en: 'Company Name', ar: 'اسم الشركة' },
  'license.request.notes': { en: 'Notes', ar: 'ملاحظات' },
  'license.request.submit': { en: 'Submit Request', ar: 'إرسال الطلب' },

  /* ── License: Check Status ── */
  'license.check.title': { en: 'Check Request Status', ar: 'تحقق من حالة الطلب' },
  'license.check.desc': {
    en: 'Enter your email to check if your request has been approved.',
    ar: 'أدخل بريدك الإلكتروني للتحقق من حالة طلبك.'
  },
  'license.check.placeholder': { en: 'Your email address', ar: 'بريدك الإلكتروني' },
  'license.check.button': { en: 'Check Status', ar: 'تحقق من الحالة' },
  'license.check.pending': {
    en: 'Your request is under review. Please check again later.',
    ar: 'طلبك قيد المراجعة. يرجى المحاولة لاحقاً.'
  },
  'license.check.rejected': { en: 'Your request was rejected.', ar: 'تم رفض طلبك.' },
  'license.check.approved': { en: 'Approved! Activating...', ar: 'تمت الموافقة! جاري التفعيل...' },
  'license.check.notFound': { en: 'No request found for this email.', ar: 'لم يتم العثور على طلب لهذا البريد.' },

  /* ── License: Banner ── */
  'license.banner.active': { en: 'Program is activated', ar: 'البرنامج مفعّل' },

  /* ── License: General ── */
  'license.title': { en: 'Activate Your Plan', ar: 'فعّل خطتك' },
  'license.features': { en: 'Unlock premium features:', ar: 'افتح الميزات المميزة:' },
  'license.feature.1': { en: 'Unlimited Analysis & AI Reports', ar: 'تحليل غير محدود وتقارير AI' },
  'license.feature.2': { en: 'Advanced Architecture Blueprint', ar: 'مخطط بنية معماري متقدم' },
  'license.feature.3': { en: 'Enhanced API Design & Lineage Graph', ar: 'تصميم API متقدم ورسوم النسب' },
  'license.feature.4': { en: '30-day access period after activation', ar: 'وصول لمدة 30 يوم بعد التفعيل' },
  'license.price': { en: '$6.5/month', ar: '$6.5/شهر' },
  'license.activate': { en: 'Activate Now', ar: 'فعّل الآن' },
  'license.codePlaceholder': { en: 'Enter activation code', ar: 'أدخل رمز التفعيل' },
  'license.submit': { en: 'Submit', ar: 'تأكيد' },
  'license.invalidCode': { en: 'Invalid activation code', ar: 'رمز تفعيل غير صحيح' },
  'license.success': { en: 'Activated successfully!', ar: 'تم التفعيل بنجاح!' },
  'license.daysRemaining': { en: '{{days}} days remaining', ar: 'متبقي {{days}} يوم' },
  'license.expired': { en: 'License expired', ar: 'انتهت مدة الترخيص' },
  'license.activation.title': { en: 'Enter Activation Code', ar: 'أدخل رمز التفعيل' },
  'license.activation.desc': {
    en: 'Enter your activation code to unlock full features for 30 days.',
    ar: 'أدخل رمز التفعيل لفتح جميع الميزات لمدة 30 يوم.'
  },
  'license.activation.back': { en: '← Back', ar: '→ رجوع' },
  'license.activation.activating': { en: 'Activating...', ar: 'جاري التفعيل...' },

  /* ── Footer ── */
  'footer.text': {
    en: 'Synapto — System Architect Engine · React + FastAPI + SQLite · AI-Ready Blueprint Generator',
    ar: 'Synapto — محرك هندسة الأنظمة · React + FastAPI + SQLite · مولّد مخططات جاهز للذكاء الاصطناعي'
  },
};

/**
 * Get translated string by key
 * @param {string} key - Translation key
 * @param {'en'|'ar'} lang - Current language
 * @returns {string} Translated text
 */
export function t(key, lang = 'en') {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}

/**
 * Get text direction based on language
 * @param {'en'|'ar'} lang
 * @returns {'ltr'|'rtl'}
 */
export function getDir(lang) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export default translations;