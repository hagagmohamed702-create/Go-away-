'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit2, Eye, FileText, Calendar, DollarSign, User } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Contract {
  id: string
  contractNumber: string
  client: {
    id: string
    name: string
    code: string
  }
  unit: {
    id: string
    name: string
    code: string
    totalPrice: number
  }
  unitValue: number
  downPayment: number
  installmentCount: number
  installmentType: string
  installmentAmount: number
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  installments: Array<{
    id: string
    amount: number
    dueDate: string
    status: string
  }>
}

interface Client {
  id: string
  code: string
  name: string
}

interface Unit {
  id: string
  code: string
  name: string
  totalPrice: number
  status: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    clientId: '',
    unitId: '',
    downPayment: '',
    installmentCount: '12',
    installmentType: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchContracts()
    fetchClients()
    fetchUnits()
  }, [])

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/contracts')
      const data = await response.json()
      setContracts(data.contracts || [])
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات العقود",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units')
      const data = await response.json()
      setUnits(data.units?.filter((unit: Unit) => unit.status === 'AVAILABLE') || [])
    } catch (error) {
      console.error('Error fetching units:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          downPayment: parseFloat(formData.downPayment),
          installmentCount: parseInt(formData.installmentCount)
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "نجح",
          description: "تم إنشاء العقد بنجاح"
        })
        fetchContracts()
        fetchUnits() // Refresh units to update availability
        resetForm()
        setIsDialogOpen(false)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء العقد",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      clientId: '',
      unitId: '',
      downPayment: '',
      installmentCount: '12',
      installmentType: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0]
    })
  }

  const viewContract = (contract: Contract) => {
    setSelectedContract(contract)
    setIsViewMode(true)
    setIsDialogOpen(true)
  }

  const filteredContracts = contracts.filter(contract =>
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'نشط'
      case 'COMPLETED': return 'مكتمل'
      case 'CANCELLED': return 'ملغي'
      default: return status
    }
  }

  const getInstallmentTypeText = (type: string) => {
    switch (type) {
      case 'MONTHLY': return 'شهري'
      case 'QUARTERLY': return 'ربع سنوي'
      case 'SEMI_ANNUAL': return 'نصف سنوي'
      case 'ANNUAL': return 'سنوي'
      default: return type
    }
  }

  const selectedUnit = units.find(unit => unit.id === formData.unitId)
  const calculatedInstallmentAmount = selectedUnit && formData.downPayment && formData.installmentCount 
    ? (selectedUnit.totalPrice - parseFloat(formData.downPayment)) / parseInt(formData.installmentCount)
    : 0

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
          <h1 className="text-3xl font-bold">إدارة العقود</h1>
          <p className="text-muted-foreground">إنشاء ومتابعة عقود البيع والأقساط</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsViewMode(false) }}>
              <Plus className="ml-2 h-4 w-4" />
              إنشاء عقد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {isViewMode ? 'تفاصيل العقد' : 'إنشاء عقد جديد'}
              </DialogTitle>
              <DialogDescription>
                {isViewMode ? 'عرض تفاصيل العقد والأقساط' : 'إدخال بيانات العقد الجديد'}
              </DialogDescription>
            </DialogHeader>

            {isViewMode && selectedContract ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>رقم العقد</Label>
                    <p className="font-medium">{selectedContract.contractNumber}</p>
                  </div>
                  <div>
                    <Label>الحالة</Label>
                    <Badge className={getStatusColor(selectedContract.status)}>
                      {getStatusText(selectedContract.status)}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>العميل</Label>
                    <p className="font-medium">{selectedContract.client.name}</p>
                  </div>
                  <div>
                    <Label>الوحدة</Label>
                    <p className="font-medium">{selectedContract.unit.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>قيمة الوحدة</Label>
                    <p className="font-medium text-blue-600">{formatCurrency(selectedContract.unitValue)}</p>
                  </div>
                  <div>
                    <Label>المقدم</Label>
                    <p className="font-medium text-green-600">{formatCurrency(selectedContract.downPayment)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>عدد الأقساط</Label>
                    <p className="font-medium">{selectedContract.installmentCount}</p>
                  </div>
                  <div>
                    <Label>نوع القسط</Label>
                    <p className="font-medium">{getInstallmentTypeText(selectedContract.installmentType)}</p>
                  </div>
                  <div>
                    <Label>قيمة القسط</Label>
                    <p className="font-medium text-orange-600">{formatCurrency(selectedContract.installmentAmount)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>تاريخ البداية</Label>
                    <p className="font-medium">{formatDate(selectedContract.startDate)}</p>
                  </div>
                  <div>
                    <Label>تاريخ الانتهاء</Label>
                    <p className="font-medium">{formatDate(selectedContract.endDate)}</p>
                  </div>
                </div>
                
                {selectedContract.installments.length > 0 && (
                  <div>
                    <Label>الأقساط ({selectedContract.installments.length})</Label>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                      {selectedContract.installments.slice(0, 5).map((installment, index) => (
                        <div key={installment.id} className="flex justify-between text-sm">
                          <span>القسط {index + 1}</span>
                          <span>{formatCurrency(installment.amount)}</span>
                          <span>{formatDate(installment.dueDate)}</span>
                        </div>
                      ))}
                      {selectedContract.installments.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center">
                          و {selectedContract.installments.length - 5} أقساط أخرى...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientId">العميل</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      required
                    >
                      <option value="">اختر العميل</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name} - {client.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="unitId">الوحدة</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.unitId}
                      onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                      required
                    >
                      <option value="">اختر الوحدة</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} - {formatCurrency(unit.totalPrice)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedUnit && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium">قيمة الوحدة: {formatCurrency(selectedUnit.totalPrice)}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="downPayment">المقدم</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={formData.downPayment}
                      onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                      placeholder="50000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="installmentCount">عدد الأقساط</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.installmentCount}
                      onChange={(e) => setFormData({ ...formData, installmentCount: e.target.value })}
                    >
                      <option value="6">6 أقساط</option>
                      <option value="12">12 قسط</option>
                      <option value="18">18 قسط</option>
                      <option value="24">24 قسط</option>
                      <option value="36">36 قسط</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="installmentType">نوع الدفع</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.installmentType}
                      onChange={(e) => setFormData({ ...formData, installmentType: e.target.value })}
                    >
                      <option value="MONTHLY">شهري</option>
                      <option value="QUARTERLY">ربع سنوي</option>
                      <option value="SEMI_ANNUAL">نصف سنوي</option>
                      <option value="ANNUAL">سنوي</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">تاريخ البداية</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {calculatedInstallmentAmount > 0 && (
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                      قيمة القسط الواحد: {formatCurrency(calculatedInstallmentAmount)}
                    </p>
                    <p className="text-xs text-green-600">
                      المبلغ المتبقي: {formatCurrency(selectedUnit!.totalPrice - parseFloat(formData.downPayment))}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    إنشاء العقد
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث برقم العقد أو اسم العميل أو الوحدة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العقود</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العقود النشطة</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(contracts.reduce((sum, contract) => sum + contract.unitValue, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المقدمات</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(contracts.reduce((sum, contract) => sum + contract.downPayment, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العقود</CardTitle>
          <CardDescription>
            عرض جميع العقود مع إمكانية عرض التفاصيل
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContracts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد عقود</h3>
              <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء أول عقد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <h3 className="font-medium">{contract.contractNumber}</h3>
                          <Badge className={getStatusColor(contract.status)}>
                            {getStatusText(contract.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <User className="h-3 w-3" />
                            <span>{contract.client.name}</span>
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(contract.startDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{contract.unit.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(contract.unitValue)} | {contract.installmentCount} قسط
                      </p>
                      <div className="flex space-x-2 space-x-reverse mt-2">
                        <Button variant="outline" size="sm" onClick={() => viewContract(contract)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
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