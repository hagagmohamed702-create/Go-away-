'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, DollarSign, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Installment {
  id: string
  installmentNumber: number
  amount: number
  dueDate: string
  paidAmount: number
  remainingAmount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL'
  paymentDate?: string
  contract: {
    id: string
    contractNumber: string
    client: {
      name: string
      phone: string
    }
    unit: {
      name: string
    }
  }
}

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const { toast } = useToast()

  useEffect(() => {
    fetchInstallments()
  }, [])

  const fetchInstallments = async () => {
    try {
      // Mock data for now - will be replaced with actual API
      const mockInstallments: Installment[] = [
        {
          id: '1',
          installmentNumber: 1,
          amount: 5000,
          dueDate: '2024-01-15',
          paidAmount: 5000,
          remainingAmount: 0,
          status: 'PAID',
          paymentDate: '2024-01-10',
          contract: {
            id: '1',
            contractNumber: 'C-2024-001',
            client: { name: 'أحمد محمد', phone: '01234567890' },
            unit: { name: 'شقة 101 - عمارة أ' }
          }
        },
        {
          id: '2',
          installmentNumber: 2,
          amount: 5000,
          dueDate: '2024-02-15',
          paidAmount: 3000,
          remainingAmount: 2000,
          status: 'PARTIAL',
          contract: {
            id: '1',
            contractNumber: 'C-2024-001',
            client: { name: 'أحمد محمد', phone: '01234567890' },
            unit: { name: 'شقة 101 - عمارة أ' }
          }
        },
        {
          id: '3',
          installmentNumber: 3,
          amount: 5000,
          dueDate: '2024-03-15',
          paidAmount: 0,
          remainingAmount: 5000,
          status: 'OVERDUE',
          contract: {
            id: '1',
            contractNumber: 'C-2024-001',
            client: { name: 'أحمد محمد', phone: '01234567890' },
            unit: { name: 'شقة 101 - عمارة أ' }
          }
        }
      ]
      setInstallments(mockInstallments)
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الأقساط",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredInstallments = installments.filter(installment => {
    const matchesSearch = 
      installment.contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.contract.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.contract.unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || installment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'مدفوع'
      case 'PARTIAL': return 'مدفوع جزئياً'
      case 'OVERDUE': return 'متأخر'
      case 'PENDING': return 'في الانتظار'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'OVERDUE': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Calendar className="h-4 w-4 text-blue-600" />
    }
  }

  const stats = {
    total: installments.length,
    paid: installments.filter(i => i.status === 'PAID').length,
    overdue: installments.filter(i => i.status === 'OVERDUE').length,
    totalAmount: installments.reduce((sum, i) => sum + i.amount, 0),
    paidAmount: installments.reduce((sum, i) => sum + i.paidAmount, 0),
    remainingAmount: installments.reduce((sum, i) => sum + i.remainingAmount, 0)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأقساط</h1>
          <p className="text-muted-foreground">متابعة المدفوعات والأقساط المستحقة</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث برقم العقد أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
        </div>
        <select
          className="px-3 py-2 border rounded-md"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">جميع الحالات</option>
          <option value="PENDING">في الانتظار</option>
          <option value="PAID">مدفوع</option>
          <option value="PARTIAL">مدفوع جزئياً</option>
          <option value="OVERDUE">متأخر</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأقساط</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدفوعة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متأخرة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبلغ</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوع</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.paidAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتبقي</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.remainingAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Installments List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الأقساط</CardTitle>
          <CardDescription>
            عرض جميع الأقساط مع حالات الدفع
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInstallments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد أقساط</h3>
              <p className="mt-1 text-sm text-gray-500">لا توجد أقساط تطابق معايير البحث</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInstallments.map((installment) => (
                <div key={installment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(installment.status)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <h3 className="font-medium">
                            {installment.contract.contractNumber} - القسط {installment.installmentNumber}
                          </h3>
                          <Badge className={getStatusColor(installment.status)}>
                            {getStatusText(installment.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground mt-1">
                          <span>{installment.contract.client.name}</span>
                          <span>{installment.contract.unit.name}</span>
                          <span>استحقاق: {formatDate(installment.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">{formatCurrency(installment.amount)}</p>
                      {installment.paidAmount > 0 && (
                        <p className="text-sm text-green-600">
                          مدفوع: {formatCurrency(installment.paidAmount)}
                        </p>
                      )}
                      {installment.remainingAmount > 0 && (
                        <p className="text-sm text-red-600">
                          متبقي: {formatCurrency(installment.remainingAmount)}
                        </p>
                      )}
                      {installment.paymentDate && (
                        <p className="text-xs text-muted-foreground">
                          تاريخ الدفع: {formatDate(installment.paymentDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}