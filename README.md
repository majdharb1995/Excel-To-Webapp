# SYNAPTO V7 — Excel Reverse Engineering System

## نظرة عامة
SYNAPTO هو نظام هندسة عكسية لملفات Excel يقوم بتحويل أي ملف Excel إلى تطبيق WebApp جاهز للإنتاج. يحلل الملف ويستخرج:

1. **هيكل قاعدة البيانات (Database Schema)** — جرد جميع أوراق العمل، تحديد أنواع البيانات، والعلاقات بين الجداول
2. **منطق العمل (Business Logic)** — استخراج المعادلات والصيغ الحسابية والشرطية وتحويلها إلى خوارزميات برمجية
3. **نقاط الإدخال والإخراج (Inputs & Outputs)** — تصنيف الأعمدة إلى مدخلات المستخدم ومخرجات محسوبة
4. **تصميم واجهات البرمجة (API Design)** — تحويل كل ورقة عمل إلى نقاط اتصال REST API مع هيكل JSON للطلب والاستجابة

## البنية المعمارية

```
synapto-final/
├── backend/
│   ├── main.py              # FastAPI server — نقاط الاتصال الرئيسية
│   ├── excel_analyzer.py    # محرك التحليل الأساسي (V7)
│   ├── system_architect.py  # مولد التقرير الشامل (V7)
│   ├── clean.py             # أداة تنظيف Excel
│   └── requirements.txt     # متطلبات Python
├── frontend/
│   ├── package.json         # متطلبات Node.js
│   ├── vite.config.js       # إعدادات Vite
│   ├── index.html           # نقطة الدخول
│   └── src/
│       ├── main.jsx         # React entry
│       ├── App.jsx          # الواجهة الرئيسية
│       ├── App.css          # الأنماط
│       ├── LineageGraph.jsx # رسم بياني لتدفق البيانات
│       └── Lineage.css      # أنماط الرسم البياني
└── README.md
```

## التثبيت والتشغيل

### المتطلبات
- Python 3.10+
- Node.js 18+
- npm أو yarn

### 1. تشغيل الخادم الخلفي (Backend)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

الخادم سيعمل على: `http://localhost:8000`

### 2. تشغيل الواجهة الأمامية (Frontend)

```bash
cd frontend
npm install
npm run dev
```

الواجهة ستعمل على: `http://localhost:3000`

### 3. متغيرات البيئة (اختياري)

لتفعيل تقارير AI، أضف المفاتيح التالية:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
export OPENROUTER_API_KEY="your-openrouter-api-key"
```

## نقاط الاتصال (API Endpoints)

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| POST | `/analyze` | تحليل ملف Excel |
| POST | `/architect-report` | توليد التقرير الشامل (6 مراحل) |
| POST | `/ai-report` | توليد تقرير AI |
| POST | `/download-clean-excel` | تحميل Excel نظيف + SQLite |
| GET | `/health` | فحص حالة الخادم |

## الميزات الجديدة في V7

### 1. تصنيف الإدخال/الإخراج (I/O Classification)
كل عمود يُصنف تلقائياً إلى:
- **USER_INPUT**: أعمدة يدخلها المستخدم (تُرسل في POST/PUT)
- **COMPUTED_OUTPUT**: أعمدة محسوبة بالخادم (تُستبعد من الطلب)
- **CONFIG**: أعمدة التهيئة (جداول البحث)

### 2. تصميم واجهات البرمجة (API Design - Phase 6)
توليد تلقائي لمواصفات REST API لكل كيان:
- **GET** `/api/{entity}` — عرض كل السجلات
- **GET** `/api/{entity}/{id}` — عرض سجل واحد
- **POST** `/api/{entity}` — إنشاء سجل (Request Body = USER_INPUT فقط)
- **PUT** `/api/{entity}/{id}` — تحديث سجل
- **DELETE** `/api/{entity}/{id}` — حذف سجل
- **POST** `/api/{entity}/{id}/recalculate` — إعادة حساب الأعمدة المحسوبة
- **POST** `/api/calculate` — تشغيل خط الأنابيب الكامل
- **GET** `/api/dashboard` — عرض لوحة القيادة

### 3. تحسين استنتاج أنواع البيانات
- الأعمدة الحسابية (total, tax, net_amount) → FLOAT تلقائياً
- أعمدة التاريخ (start_date, end_date) → DATE تلقائياً
- كشف التواريخ المسلسلة في Excel (مثل 44927 → DATE)
