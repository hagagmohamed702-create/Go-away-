# 🚀 نشر النظام المحاسبي

## 🎯 خيارات النشر

### 1. GitHub Repository

```bash
# إنشاء repository جديد على GitHub
# ثم ربطه بالمشروع المحلي

git remote add origin https://github.com/YOUR_USERNAME/accounting-system.git
git branch -M main
git push -u origin main
```

### 2. Vercel (الأسرع والأسهل)

```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر المشروع
vercel

# أو مباشرة من GitHub
# 1. ادفع الكود إلى GitHub
# 2. اذهب إلى vercel.com
# 3. اربط repository
# 4. اضبط متغيرات البيئة
```

### 3. Netlify

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# بناء المشروع
npm run build
npm run export

# نشر
netlify deploy --prod --dir=out
```

### 4. Railway

```bash
# تثبيت Railway CLI
npm install -g @railway/cli

# تسجيل الدخول
railway login

# نشر
railway up
```

## 🗄️ إعداد قاعدة البيانات

### PostgreSQL على Neon (مجاني)

1. اذهب إلى [neon.tech](https://neon.tech)
2. أنشئ حساب جديد
3. أنشئ قاعدة بيانات جديدة
4. انسخ connection string
5. ضعه في متغير البيئة `DATABASE_URL`

### PostgreSQL على Supabase (مجاني)

1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ مشروع جديد
3. اذهب إلى Settings > Database
4. انسخ connection string
5. ضعه في متغير البيئة `DATABASE_URL`

### PostgreSQL على ElephantSQL (مجاني)

1. اذهب إلى [elephantsql.com](https://elephantsql.com)
2. أنشئ instance جديد (Tiny Turtle - مجاني)
3. انسخ URL
4. ضعه في متغير البيئة `DATABASE_URL`

## 🔧 متغيرات البيئة المطلوبة

```env
# قاعدة البيانات (مطلوب)
DATABASE_URL="postgresql://username:password@host:5432/database"

# Next.js (اختياري)
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# إعدادات التطبيق (اختياري)
APP_NAME="نظام إدارة محاسبي"
APP_VERSION="1.0.0"
```

## 📝 خطوات النشر التفصيلية

### Vercel (الموصى به)

1. **ادفع الكود إلى GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/accounting-system.git
   git push -u origin main
   ```

2. **اذهب إلى Vercel:**
   - زر [vercel.com](https://vercel.com)
   - سجل دخول بـ GitHub
   - اضغط "New Project"
   - اختر repository
   - اضغط "Deploy"

3. **أضف متغيرات البيئة:**
   - اذهب إلى Project Settings
   - اختر Environment Variables
   - أضف `DATABASE_URL`

4. **قم بـ redeploy:**
   - اذهب إلى Deployments
   - اضغط "Redeploy"

### Railway

1. **أنشئ حساب على Railway:**
   - اذهب إلى [railway.app](https://railway.app)
   - سجل دخول بـ GitHub

2. **أنشئ مشروع جديد:**
   - اضغط "New Project"
   - اختر "Deploy from GitHub repo"
   - اختر repository

3. **أضف قاعدة بيانات:**
   - اضغط "Add Service"
   - اختر PostgreSQL
   - انسخ connection string

4. **أضف متغيرات البيئة:**
   - اذهب إلى Variables
   - أضف `DATABASE_URL`

## 🔄 بعد النشر

1. **قم بإعداد قاعدة البيانات:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

2. **تأكد من عمل النظام:**
   - افتح الموقع
   - تحقق من لوحة التحكم
   - جرب إنشاء عميل جديد

3. **اضبط domain مخصص (اختياري):**
   - اذهب إلى Project Settings
   - اختر Domains
   - أضف domain الخاص بك

## 🛡️ الأمان

- غير `NEXTAUTH_SECRET` إلى قيمة عشوائية قوية
- تأكد من أن قاعدة البيانات محمية بكلمة مرور قوية
- استخدم SSL للـ database connection
- اضبط CORS إذا كنت ستستخدم API خارجياً

## 📊 المراقبة

- تابع logs في Vercel/Railway
- استخدم Prisma Studio لمراقبة قاعدة البيانات
- اضبط تنبيهات للأخطاء

## 🆘 حل المشاكل

### خطأ في قاعدة البيانات:
```bash
# تحقق من connection string
echo $DATABASE_URL

# جرب الاتصال
npx prisma db push --accept-data-loss
```

### خطأ في البناء:
```bash
# امحي node_modules وأعد التثبيت
rm -rf node_modules package-lock.json
npm install

# أعد البناء
npm run build
```

### صفحة 404:
- تأكد من أن build مكتمل
- تحقق من أن الـ routes موجودة
- راجع Vercel logs