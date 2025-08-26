import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'نظام إدارة محاسبي',
  description: 'نظام إدارة محاسبي حديث شامل',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Simple Sidebar */}
          <div className="fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg">
            <div className="flex h-16 items-center justify-center border-b">
              <h1 className="text-xl font-bold text-blue-600">نظام الحسابات</h1>
            </div>
            <nav className="mt-8 space-y-2 px-4">
              <a href="/" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                لوحة التحكم
              </a>
              <a href="/clients" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                العملاء
              </a>
              <a href="/units" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                الوحدات
              </a>
              <a href="/contracts" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                العقود
              </a>
              <a href="/installments" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                الأقساط
              </a>
              <a href="/partners" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                الشركاء
              </a>
              <a href="/partner-groups" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                مجموعات الشركاء
              </a>
              <a href="/cashboxes" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                الخزائن
              </a>
              <a href="/receipts" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                السندات
              </a>
              <a href="/projects" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                المشاريع
              </a>
              <a href="/reports" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                التقارير
              </a>
              <a href="/advanced-reports" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                التقارير المتقدمة
              </a>
              <a href="/settlements" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                التسويات
              </a>
              <a href="/notifications" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                الإشعارات
              </a>
              <a href="/broker-commissions" className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                عمولات الوسطاء
              </a>
            </nav>
          </div>

          {/* Main Content */}
          <div className="mr-64">
            {/* Simple Header */}
            <header className="bg-white shadow-sm border-b">
              <div className="flex h-16 items-center justify-between px-6">
                <h2 className="text-lg font-semibold text-gray-900">مرحباً بك في النظام</h2>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span className="text-sm text-gray-500">المستخدم: المدير</span>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}