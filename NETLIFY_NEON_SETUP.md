# 🚀 دليل النشر على Netlify مع قاعدة بيانات Neon

## 📋 المتطلبات:
1. حساب [Netlify](https://netlify.com)
2. حساب [Neon](https://neon.tech)
3. مستودع GitHub للمشروع

## 🗄️ إعداد قاعدة البيانات (Neon):

### 1. إنشاء قاعدة بيانات جديدة:
1. اذهب إلى [console.neon.tech](https://console.neon.tech)
2. اضغط "Create Project"
3. اختر اسم للمشروع (مثل: `accounting-system`)
4. اختر المنطقة الأقرب إليك
5. انسخ رابط الاتصال (Database URL)

### 2. تشغيل الجداول:
```bash
# في مجلد المشروع
npx prisma generate
npx prisma db push
```

### 3. إضافة بيانات تجريبية (اختياري):
```bash
npx prisma db seed
```

## 🌐 إعداد Netlify:

### 1. ربط المستودع:
1. اذهب إلى [app.netlify.com](https://app.netlify.com)
2. اضغط "New site from Git"
3. اختر GitHub وحدد المستودع
4. فرع النشر: `main`

### 2. إعدادات البناء:
```
Build command: npm run build
Publish directory: .next
```

### 3. إضافة متغيرات البيئة:
في **Site settings → Environment variables**:

```env
DATABASE_URL=postgresql://username:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require
NEXTAUTH_URL=https://your-app-name.netlify.app
NEXTAUTH_SECRET=your-very-secure-secret-key-here
APP_NAME=نظام إدارة محاسبي
```

### 4. إعدادات إضافية:
```env
NODE_VERSION=18
SKIP_ENV_VALIDATION=true
```

## 🔧 الحلول للمشاكل الشائعة:

### ❌ خطأ "Cannot connect to database":
1. تأكد من صحة `DATABASE_URL`
2. تأكد أن قاعدة البيانات نشطة في Neon
3. تحقق من الشبكة والـ SSL

### ❌ خطأ "Build failed":
1. تأكد من تثبيت جميع التبعيات
2. تحقق من متغيرات البيئة
3. راجع سجلات البناء

### ❌ خطأ "API routes not working":
1. تأكد من إعدادات `netlify.toml`
2. تحقق من إعدادات Functions

## 📁 ملف netlify.toml:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  directory = ".netlify/functions"
```

## 🔒 إعدادات الأمان:

### 1. تأمين قاعدة البيانات:
- استخدم كلمات مرور قوية
- فعّل SSL (مفعل افتراضياً في Neon)
- قيّد الوصول للمشروع فقط

### 2. تأمين التطبيق:
```env
NEXTAUTH_SECRET="your-very-long-and-secure-secret"
```

## 🧪 اختبار النشر:

### 1. اختبار الاتصال بقاعدة البيانات:
```bash
curl https://your-app.netlify.app/api/clients
```

### 2. اختبار إضافة بيانات:
```bash
curl -X POST https://your-app.netlify.app/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"عميل تجريبي","phone":"0501234567"}'
```

## 📊 مراقبة الأداء:

### 1. سجلات Netlify:
- Functions logs
- Build logs
- Real-time logs

### 2. مراقبة Neon:
- Monitoring dashboard
- Connection pooling
- Query performance

## 🔄 التحديثات:

### 1. تحديثات الكود:
```bash
git add .
git commit -m "Update: feature description"
git push origin main
```
السيتم النشر تلقائياً.

### 2. تحديثات قاعدة البيانات:
```bash
npx prisma db push
```

## 💡 نصائح للأداء:

1. **استخدم Connection Pooling** في Neon
2. **فعّل Caching** في Netlify
3. **قلل استعلامات قاعدة البيانات**
4. **استخدم ISR** للصفحات الثابتة

## 🆘 الدعم:

### Netlify:
- [Netlify Docs](https://docs.netlify.com)
- [Community Forums](https://community.netlify.com)

### Neon:
- [Neon Docs](https://neon.tech/docs)
- [Discord Community](https://discord.gg/92vNTzKDGp)

---
✅ **النظام جاهز للنشر على Netlify مع Neon!** 🎉

## 🎯 خطوات سريعة:

1. أنشئ قاعدة بيانات في Neon
2. انسخ رابط الاتصال
3. ارفع الكود إلى GitHub
4. أنشئ موقع جديد في Netlify
5. أضف متغيرات البيئة
6. انشر وتمتع! 🚀