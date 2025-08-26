'use client'

import { useState, useEffect } from 'react'

interface Partner {
  id: number
  name: string
  sharePercentage: number
  joinDate: string
  role: string
}

interface PartnerGroup {
  id: number
  name: string
  description: string
  totalSharePercentage: number
  createdAt: string
  isActive: boolean
  partners: Partner[]
}

interface GroupStats {
  totalGroups: number
  activeGroups: number
  totalPartners: number
  avgPartnersPerGroup: number
}

export default function PartnerGroupsPage() {
  const [groups, setGroups] = useState<PartnerGroup[]>([])
  const [stats, setStats] = useState<GroupStats>({
    totalGroups: 0,
    activeGroups: 0,
    totalPartners: 0,
    avgPartnersPerGroup: 0
  })
  const [selectedGroup, setSelectedGroup] = useState<PartnerGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    partners: [] as Partner[]
  })
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    sharePercentage: 0,
    role: ''
  })
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch groups
  const fetchGroups = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('isActive', statusFilter)
      }
      
      const response = await fetch(`/api/partner-groups?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setGroups(data.data)
        setStats(data.stats)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في جلب البيانات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [statusFilter])

  // Create new group
  const handleCreateGroup = async () => {
    try {
      if (!formData.name.trim()) {
        setError('يرجى إدخال اسم المجموعة')
        return
      }

      const response = await fetch('/api/partner-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: formData.name,
          description: formData.description,
          partners: formData.partners
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowCreateModal(false)
        setFormData({ name: '', description: '', partners: [] })
        fetchGroups()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في إنشاء المجموعة')
    }
  }

  // Toggle group status
  const toggleGroupStatus = async (groupId: number, isActive: boolean) => {
    try {
      const response = await fetch('/api/partner-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          groupId,
          isActive: !isActive
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchGroups()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في تحديث حالة المجموعة')
    }
  }

  // Add partner to group
  const handleAddPartner = async () => {
    if (!selectedGroup) return
    
    try {
      if (!partnerForm.name.trim() || partnerForm.sharePercentage <= 0) {
        setError('يرجى إدخال بيانات الشريك بشكل صحيح')
        return
      }

      const response = await fetch('/api/partner-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addPartner',
          groupId: selectedGroup.id,
          partner: partnerForm
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowPartnerModal(false)
        setPartnerForm({ name: '', sharePercentage: 0, role: '' })
        fetchGroups()
        // Update selected group
        setSelectedGroup(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في إضافة الشريك')
    }
  }

  // Remove partner from group
  const removePartner = async (partnerId: number) => {
    if (!selectedGroup) return
    
    try {
      const response = await fetch('/api/partner-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removePartner',
          groupId: selectedGroup.id,
          partnerId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchGroups()
        setSelectedGroup(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في إزالة الشريك')
    }
  }

  // Delete group
  const deleteGroup = async (groupId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟')) return
    
    try {
      const response = await fetch('/api/partner-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          groupId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchGroups()
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(null)
        }
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في حذف المجموعة')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">مجموعات الشركاء</h1>
        <p className="text-gray-600">إدارة وتنظيم الشركاء في مجموعات مختلفة</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-left text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-500">إجمالي المجموعات</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-500">المجموعات النشطة</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.activeGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-purple-600 text-xl">👤</span>
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-500">إجمالي الشركاء</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPartners}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-orange-600 text-xl">📊</span>
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-500">متوسط الشركاء</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.avgPartnersPerGroup}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Groups List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">قائمة المجموعات</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  إضافة مجموعة جديدة
                </button>
              </div>
              
              {/* Filters */}
              <div className="mt-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">جميع المجموعات</option>
                  <option value="true">المجموعات النشطة</option>
                  <option value="false">المجموعات غير النشطة</option>
                </select>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">جاري التحميل...</p>
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">لا توجد مجموعات</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedGroup?.id === group.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              group.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {group.isActive ? 'نشط' : 'غير نشط'}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{group.description}</p>
                          <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                            <span>الشركاء: {group.partners.length}</span>
                            <span>نسبة المشاركة: {group.totalSharePercentage}%</span>
                            <span>تاريخ الإنشاء: {new Date(group.createdAt).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleGroupStatus(group.id, group.isActive)
                            }}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              group.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {group.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteGroup(group.id)
                            }}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Group Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">تفاصيل المجموعة</h2>
            </div>

            <div className="p-6">
              {selectedGroup ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedGroup.name}</h3>
                    <p className="text-gray-600 mb-4">{selectedGroup.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">إجمالي نسبة المشاركة:</span>
                        <span className="font-semibold">{selectedGroup.totalSharePercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">عدد الشركاء:</span>
                        <span className="font-semibold">{selectedGroup.partners.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">الحالة:</span>
                        <span className={selectedGroup.isActive ? 'text-green-600' : 'text-red-600'}>
                          {selectedGroup.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">شركاء المجموعة</h4>
                      <button
                        onClick={() => setShowPartnerModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded transition-colors"
                      >
                        إضافة شريك
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedGroup.partners.map((partner) => (
                        <div key={partner.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold text-gray-900">{partner.name}</h5>
                              <p className="text-sm text-gray-600">{partner.role}</p>
                              <p className="text-sm text-gray-500">نسبة المشاركة: {partner.sharePercentage}%</p>
                              <p className="text-sm text-gray-500">تاريخ الانضمام: {partner.joinDate}</p>
                            </div>
                            <button
                              onClick={() => removePartner(partner.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              إزالة
                            </button>
                          </div>
                        </div>
                      ))}
                      {selectedGroup.partners.length === 0 && (
                        <p className="text-gray-500 text-center py-4">لا يوجد شركاء في هذه المجموعة</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">اختر مجموعة لعرض التفاصيل</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">إضافة مجموعة جديدة</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المجموعة *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل اسم المجموعة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="أدخل وصف المجموعة"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إنشاء المجموعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">إضافة شريك للمجموعة</h3>
              <button
                onClick={() => setShowPartnerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الشريك *
                </label>
                <input
                  type="text"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل اسم الشريك"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نسبة المشاركة (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={partnerForm.sharePercentage}
                  onChange={(e) => setPartnerForm({ ...partnerForm, sharePercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الدور
                </label>
                <input
                  type="text"
                  value={partnerForm.role}
                  onChange={(e) => setPartnerForm({ ...partnerForm, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="مثل: شريك مؤسس، شريك مستثمر"
                />
              </div>

              {selectedGroup && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    نسبة المشاركة الحالية: {selectedGroup.totalSharePercentage}%
                  </p>
                  <p className="text-sm text-gray-600">
                    النسبة المتبقية: {100 - selectedGroup.totalSharePercentage}%
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPartnerModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddPartner}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                إضافة الشريك
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}