'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, User } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

interface Client {
  id: string
  code: string
  name: string
  phone: string
  email?: string
  address?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  })

  // Load clients
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات العملاء",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingClient ? 'PUT' : 'POST'
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "نجح",
          description: editingClient ? "تم تحديث العميل بنجاح" : "تم إضافة العميل بنجاح"
        })
        fetchClients()
        resetForm()
        setIsDialogOpen(false)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ بيانات العميل",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      code: client.code,
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      status: client.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "نجح",
          description: "تم حذف العميل بنجاح"
        })
        fetchClients()
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف العميل",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      status: 'ACTIVE'
    })
    setEditingClient(null)
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

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
          <h1 className="text-3xl font-bold">إدارة العملاء</h1>
          <p className="text-muted-foreground">إدارة قاعدة بيانات العملاء</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'تعديل العميل' : 'إضافة عميل جديد'}</DialogTitle>
              <DialogDescription>
                {editingClient ? 'تعديل بيانات العميل' : 'إدخال بيانات العميل الجديد'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">رقم العميل</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="C001"
                    required
                    disabled={!!editingClient}
                  />
                </div>
                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  >
                    <option value="ACTIVE">نشط</option>
                    <option value="INACTIVE">غير نشط</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="name">اسم العميل</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم العميل الكامل"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01234567890"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="العنوان الكامل"
                />
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingClient ? 'تحديث' : 'إضافة'}
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
            placeholder="البحث بالاسم أو رقم العميل أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء النشطون</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clients.filter(c => c.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء غير النشطين</CardTitle>
            <User className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {clients.filter(c => c.status === 'INACTIVE').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
          <CardDescription>
            عرض جميع العملاء مع إمكانية التعديل والحذف
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد عملاء</h3>
              <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة أول عميل</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <h3 className="font-medium">{client.name}</h3>
                        <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {client.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">#{client.code}</p>
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground mt-1">
                        {client.phone && (
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Phone className="h-3 w-3" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Mail className="h-3 w-3" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <MapPin className="h-3 w-3" />
                            <span>{client.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(client.id)}>
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