#!/bin/bash

echo "🚀 بدء تشغيل نظام المحاسبة..."
echo "=================================="

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً"
    exit 1
fi

# التحقق من وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت. يرجى تثبيت npm أولاً"
    exit 1
fi

# الانتقال إلى مجلد المشروع
cd "$(dirname "$0")"

echo "📦 تثبيت المتطلبات..."
npm install

echo "🧹 تنظيف الملفات المؤقتة..."
rm -rf .next

echo "🔄 بناء المشروع..."
npm run build

echo "🌐 تشغيل الخادم..."
echo "=================================="
echo "✅ النظام متاح على: http://localhost:3000"
echo "🛑 لإيقاف الخادم: اضغط Ctrl+C"
echo "=================================="

npm run dev