YNAPTO — System Architect Engine — التوثيق الكامل للمشروع
📌 نبذة عن المشروع
مشروع SYNAPTO هو أداة SaaS لتحويل ملفات Excel إلى تطبيقات ويب عبر الهندسة العكسية. يقوم المستخدم برفع ملف Excel، فيقوم النظام بتحليله واستخراج:

Metadata — بيانات وصفية عن الجداول والأعمدة
Logic — المنطق والصيغ المستخدمة (IF, VLOOKUP, SUM...)
SQL — اقتراحات جداول SQL مع FK constraints
API Design — تصميم واجهات REST API كاملة
Architect Blueprint — مخطط معماري من 6 مراحل
AI Report — تقرير ذكي يُرسل لمزودي AI
Lineage Graph — رسم بياني تفاعلي للعلاقات (ReactFlow)
Pipeline Code — كود بايثون جاهز لخط أنابيب الحساب
🏗️ البنية التقنية
Frontend
React 18 + Vite 5 + ReactFlow 11
إدارة الحالة: Context API (AppContext.jsx)
الترجمة: نظام i18n مخصص (utils/i18n.js) — يدعم EN / AR مع RTL
المنفذ: 3000
الوكيل: /api → http://localhost:8000
Backend
Python + FastAPI + Uvicorn
مكتبات: pandas, openpyxl, numpy, sqlalchemy
المنفذ: 8000
التوكنات: HMAC-SHA256 مع صلاحية 30 يوم
قاعدة البيانات
SQLite (للأرشيف والتنزيل النظيف)
قاعدة تراخيص منفصلة (للآدمن والطلبات)
📂 هيكل الملفات
Excel-To-Webapp - DEMO/
│
├── backend/
│ ├── main.py # FastAPI app — جميع الـ endpoints
│ ├── excel_analyzer.py # محرك التحليل الرئيسي (ExcelAnalyzer class)
│ ├── clean.py # تنظيف ملفات Excel
│ ├── system_architect.py # توليد الـ AI-Ready System Prompt
│ ├── admin.db # قاعدة بيانات التراخيص والطلبات (SQLite)
│ ├── admin/ # مجلد قوالب لوحة التحكم (Jinja2)
│ │ ├── base.html # القالب الأساسي
│ │ ├── login.html # صفحة تسجيل دخول الآدمن
│ │ ├── dashboard.html # لوحة الإحصائيات
│ │ ├── requests.html # إدارة طلبات التفعيل
│ │ ├── licenses.html # إدارة التراخيص النشطة
│ │ └── add_license.html # إضافة حساب يدوي
│ └── pycache/
│
└── frontend/
├── index.html
├── vite.config.js # إعدادات Vite + proxy
├── package.json
├── node_modules/
└── src/
├── main.jsx # نقطة الدخول
├── App.jsx # المكون الرئيسي + التوجيه
│
├── context/
│ └── AppContext.jsx # إدارة الحالة العامة + الترخيص
│
├── hooks/
│ ├── useAnalysis.js # منطق رفع وتحليل الملف + التحقق من الترخيص
│ └── useLicense.js # إدارة حالة الترخيص (localStorage)
│
├── utils/
│ └── i18n.js # قاموس الترجمة EN/AR
│
├── components/
│ ├── layout/
│ │ ├── Navbar.jsx # شريط التنقل + تبديل اللغة
│ │ ├── Hero.jsx # رفع الملف + أزرار التحليل
│ │ └── Footer.jsx # التذييل
│ │
│ ├── ui/
│ │ ├── NeonButton.jsx # زر بستايل النيون
│ │ ├── ErrorBoundary.jsx # معالجة الأخطاء
│ │ ├── LicenseModal.jsx # نافذة "البرنامج موقوف"
│ │ └── ActivationModal.jsx # نافذة طلب/إدخال التفعيل
│ │
│ ├── sidebar/
│ │ └── OverviewSidebar.jsx # ملخص التحليل الجانبي
│ │
│ ├── actions/
│ │ └── AIActionBar.jsx # شريط أدوات AI (تقرير، تنزيل، رسم)
│ │
│ ├── tabs/
│ │ ├── TabBar.jsx # شريط التبويبات
│ │ ├── MetadataTab.jsx # تبويب البيانات الوصفية
│ │ ├── LogicTab.jsx # تبويب المنطق والصيغ
│ │ ├── SQLTab.jsx # تبويب SQL
│ │ ├── ApiDesignTab.jsx # تبويب تصميم API
│ │ ├── ArchitectTab.jsx # تبويب المخطط المعماري
│ │ └── AIReportTab.jsx # تبويب تقرير AI
│ │
│ └── lineage/
│ └── LineageGraph.jsx # رسم ReactFlow التفاعلي
│
└── styles/
├── variables.css # متغيرات الألوان والخطوط
├── navbar.css
├── buttons.css # ستايل أزرار النيون
├── glassmorphism.css # تأثير الزجاج
├── layout.css
├── tabs.css
├── tables.css
├── architect.css
├── lineage.css
└── license.css # ستايل نوافذ الترخيص

text


---

## 🔌 الـ API Endpoints

### واجهات المستخدم
| الطريقة | المسار | الوصف | التحقق |
|--------|--------|-------|---------|
| POST | `/analyze` | تحليل ملف Excel واستخراج المخطط | Free-Trial أو Token |
| POST | `/architect-report` | توليد المخطط المعماري الكامل (6 مراحل) | Token |
| POST | `/ai-report` | توليد تقرير AI عبر OpenRouter/Gemini | Token |
| POST | `/download-clean-excel` | تنزيل ملف نظيف + قاعدة SQLite في ZIP | Token |

### واجهات الترخيص
| الطريقة | المسار | الوصف |
|--------|--------|-------|
| POST | `/api/request-activation` | إرسال طلب تفعيل (اسم، بريد، شركة) |
| POST | `/api/check-request-status` | التحقق من حالة الطلب بالبريد الإلكتروني |
| POST | `/api/activate` | تفعيل بالكود (قديم — يمكن إزالته لاحقاً) |

### واجهات الآدمن (لوحة التحكم)
| الطريقة | المسار | الوصف |
|--------|--------|-------|
| GET | `/admin` | لوحة التحكم الرئيسية |
| POST | `/admin/login` | تسجيل دخول الآدمن |
| GET | `/admin/requests` | قائمة طلبات التفعيل |
| POST | `/admin/requests/{id}/approve` | موافقة على طلب |
| POST | `/admin/requests/{id}/reject` | رفض طلب |
| GET | `/admin/licenses` | قائمة التراخيص النشطة |
| POST | `/admin/licenses/{id}/deactivate` | إلغاء تفعيل حساب |
| POST | `/admin/licenses/add` | إضافة حساب يدوي |

---

## 🔐 آلية الترخيص الحالية

### سيناريو التجربة المجانية
1. المستخدم يرفع ملف ويضغط "تحليل"
2. الفرونت يتحقق من `localStorage('synapto-free-used')`
3. إذا لم يُستخدم بعد → يُرسل header `X-Free-Trial: true`
4. الباكند يرى الـ header → يتجاوز التحقق وُنفّذ التحليل
5. الفرونت يُعلّم التجربة كمستخدمة

### سيناريو طلب التفعيل (الجديد)
1. المستخدم يحاول التحليل مرة ثانية
2. تظهر نافذة "البرنامج موقوف" → ينتقل لنموذج طلب التفعيل
3. يعبئ معلوماته ويرسلها → تُخزّن في SQLite بحالة `pending`
4. يضغط "تحقق من حالة الطلب" بشكل دوري
5. عندما يوافق الآدمن → الباكند يُنشئ توكن ويُرجعه
6. الفرونت يخزن التوكن → يعمل لمدة 30 يوم

### بنية التوكن
الصيغة: synapto|<ISO_Expiry_Date>|<HMAC_SHA256_Signature>
مثال: synapto|2025-08-15T10:30:00Z|a1b2c3d4e5f6...

text

- الفاصل `|` بدلاً من `:` لتجنب التعارض مع صيغة التاريخ ISO
- التوقيع يُحسب باستخدام HMAC مع secret من متغير البيئة
- الباكند يتحقق من التوقيع والصلاحية عند كل طلب

---

## 🧠 محرك التحليل (ExcelAnalyzer)

### ما يفعله عند تحليل ملف:
1. يقرأ الملف بـ `openpyxl` (للصيغ) و `pandas` (للبيانات)
2. يستخرج أعمدة كل ورقة ويستنتج أنواع SQL
3. يصنف الأعمدة إلى `USER_INPUT` أو `COMPUTED_OUTPUT`
4. يكتشف الـ Foreign Keys بالتزامن مع أسماء الأوراق
5. يستخرج الصيغ (IF, VLOOKUP, SUM) ويبني رسم العلاقات
6. يُميّز بين `Relational_Entity` و `Flat_Calculation_Matrix`
7. يولّد SQL Schema مع constraints
8. يحسب عينات بيانات حقيقية (يُنفّذ الحسابات فعلياً)

### قواعد الهندسة الصارمة:
- مصفوفات الحساب المسطحة لا تتحول لجداول SQL (تُخزّن كـ JSON)
- الأعمدة المحسوبة لا تُرسل في Request Body (READ ONLY)
- الـ Pipeline ينفذ بترتيب طوبولوجي (Topological Sort)
- روابط VLOOKUP تتحول لـ Dictionary Lookup في الباكند

---

## 🎨 التصميم

- ثيم **Cyberpunk / Neon** على خلفية داكنة
- تأثير **Glassmorphism** للبطاقات
- أزرار **Neon** بتوهج أزرق/أخضر/بنفسجي
- دعم كامل لـ **RTL** (العربية) و **LTR** (الإنجليزية)
- المتغيرات في `variables.css` (ألوان، ظلال، تدرجات)

---

## 🚀 التشغيل

### Backend
```bash
cd backend
pip install fastapi uvicorn pandas openpyxl numpy sqlalchemy jinja2
python main.py
# يشتغل على http://localhost:8000
Frontend
bash

cd frontend
npm install
npm run dev
# يشتغل على http://localhost:3000
📝 ملاحظات للوكيل الذكاء الاصطناعي
لا تستخدم zustand — المشروع يستخدم Context API فقط
لا تستخدم react-router — التبويبات تُدار بحالة activeTab
التطبيق يدعم RTL — أي مكون جديد يجب أن يدعم الاتجاهين
لا تضف ملفات .tsx — المشروع يستخدم .jsx فقط
الـ proxy في vite.config.js يُحوّل /api إلى localhost:8000
التوكن يُخزّن في localStorage كمفتاح synapto-license-v1 بصيغة Base64
التجربة المجانية تُخزّن كمفتاح synapto-free-used منفصل
لوحة التحكم تُبنى بـ Jinja2 في الباكند (منفصلة عن React)
قاعدة التراخيص ملف SQLite منفصل (admin.db) في مجلد الباكند
رمز التفعيل القديم synapto988 يمكن إزالته بعد تطبيق النظام الجديد
text

