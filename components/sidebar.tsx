'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building,
  FileText,
  Calendar,
  HandCoins,
  Wallet,
  TrendingUp,
  Settings,
  BarChart3,
  Package,
  Truck,
  UserCheck,
} from 'lucide-react'

const navigation = [
  {
    name: 'لوحة التحكم',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'العملاء',
    href: '/clients',
    icon: Users,
  },
  {
    name: 'الوحدات',
    href: '/units',
    icon: Building,
  },
  {
    name: 'العقود',
    href: '/contracts',
    icon: FileText,
  },
  {
    name: 'الأقساط',
    href: '/installments',
    icon: Calendar,
  },
  {
    name: 'الشركاء',
    href: '/partners',
    icon: UserCheck,
  },
  {
    name: 'سندات القبض',
    href: '/receipts',
    icon: HandCoins,
  },
  {
    name: 'المصروفات',
    href: '/expenses',
    icon: TrendingUp,
  },
  {
    name: 'الخزائن',
    href: '/cashboxes',
    icon: Wallet,
  },
  {
    name: 'المواد',
    href: '/materials',
    icon: Package,
  },
  {
    name: 'المشاريع',
    href: '/projects',
    icon: Truck,
  },
  {
    name: 'التقارير',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'الإعدادات',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-l border-border">
      <div className="flex h-16 items-center justify-center border-b border-border px-6">
        <h1 className="text-xl font-bold text-primary">نظام المحاسبة</h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          نظام إدارة محاسبي حديث v1.0
        </div>
      </div>
    </div>
  )
}