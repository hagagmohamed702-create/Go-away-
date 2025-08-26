'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit2, Trash2, Building, Home, DollarSign } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'

interface Unit {
  id: string
  code: string
  name: string
  buildingNo: string
  unitType: string
  totalPrice: number
  groupType: string
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED'
  createdAt: string
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    buildingNo: '',
    unitType: 'سكني',
    totalPrice: '',
    groupType: 'سكنية',
    status: 'AVAILABLE' as 'AVAILABLE' | 'SOLD' | 'RESERVED'
  })

  // Load units
  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units')
      const data = await response.json()
      setUnits(data.units || [])
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الوحدات",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingUnit ? 'PUT' : 'POST'
      const url = editingUnit ? `/api/units/${editingUnit.id}` : '/api/units'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalPrice: parseFloat(formData.totalPrice)
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "نجح",
          description: editingUnit ? "تم تحديث الوحدة بنجاح" : "تم إضافة الوحدة بنجاح"
        })
        fetchUnits()
        resetForm()
        setIsDialogOpen(false)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ بيانات الوحدة",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormData({
      code: unit.code,
      name: unit.name,
      buildingNo: unit.buildingNo,
      unitType: unit.unitType,
      totalPrice: unit.totalPrice.toString(),
      groupType: unit.groupType,
      status: unit.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (unitId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوحدة؟')) return

    try {
      const response = await fetch(`/api/units/${unitId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "نجح",
          description: "تم حذف الوحدة بنجاح"
        })
        fetchUnits()
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الوحدة",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      buildingNo: '',
      unitType: 'سكني',
      totalPrice: '',
      groupType: 'سكنية',
      status: 'AVAILABLE'
    })
    setEditingUnit(null)
  }

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.buildingNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'SOLD': return 'bg-red-100 text-red-800'
      case 'RESERVED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'متاحة'
      case 'SOLD': return 'مباعة'
      case 'RESERVED': return 'محجوزة'
      default: return status
    }
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
          <h1 className="text-3xl font-bold">إدارة الوحدات</h1>
          <p className="text-muted-foreground">إدارة الوحدات السكنية والتجارية</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة وحدة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingUnit ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}</DialogTitle>
              <DialogDescription>
                {editingUnit ? 'تعديل بيانات الوحدة' : 'إدخال بيانات الوحدة الجديدة'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">رقم الوحدة</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="A101"
                    required
                    disabled={!!editingUnit}
                  />
                </div>
                <div>
                  <Label htmlFor="buildingNo">رقم العمارة</Label>
                  <Input
                    id="buildingNo"
                    value={formData.buildingNo}
                    onChange={(e) => setFormData({ ...formData, buildingNo: e.target.value })}
                    placeholder="أ"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="name">اسم الوحدة</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="شقة 101 - عمارة أ"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitType">نوع الوحدة</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.unitType}
                    onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                  >
                    <option value="سكني">سكني</option>
                    <option value="تجاري">تجاري</option>
                    <option value="إداري">إداري</option>
                    <option value="مخزن">مخزن</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="groupType">المجموعة</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.groupType}
                    onChange={(e) => setFormData({ ...formData, groupType: e.target.value })}
                  >
                    <option value="سكنية">سكنية</option>
                    <option value="تجارية">تجارية</option>
                    <option value="إدارية">إدارية</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalPrice">السعر الإجمالي</Label>
                  <Input
                    id="totalPrice"
                    type="number"
                    value={formData.totalPrice}
                    onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                    placeholder="500000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'AVAILABLE' | 'SOLD' | 'RESERVED' })}
                  >
                    <option value="AVAILABLE">متاحة</option>
                    <option value="RESERVED">محجوزة</option>
                    <option value="SOLD">مباعة</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingUnit ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث بالاسم أو رقم الوحدة أو العمارة..."
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
            <CardTitle className="text-sm font-medium">إجمالي الوحدات</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{units.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوحدات المتاحة</CardTitle>
            <Home className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {units.filter(u => u.status === 'AVAILABLE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوحدات المباعة</CardTitle>
            <Home className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {units.filter(u => u.status === 'SOLD').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي القيمة</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(units.reduce((sum, unit) => sum + unit.totalPrice, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Units Grid */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الوحدات</CardTitle>
          <CardDescription>
            عرض جميع الوحدات مع إمكانية التعديل والحذف
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUnits.length === 0 ? (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد وحدات</h3>
              <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة أول وحدة</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUnits.map((unit) => (
                <div key={unit.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{unit.name}</h3>
                        <p className="text-sm text-muted-foreground">#{unit.code}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(unit.status)}>
                      {getStatusText(unit.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">العمارة:</span>
                      <span>{unit.buildingNo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">النوع:</span>
                      <span>{unit.unitType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">المجموعة:</span>
                      <span>{unit.groupType}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-muted-foreground">السعر:</span>
                      <span className="text-blue-600">{formatCurrency(unit.totalPrice)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(unit)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(unit.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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