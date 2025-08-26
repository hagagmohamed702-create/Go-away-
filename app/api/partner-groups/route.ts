import { NextRequest, NextResponse } from 'next/server'

// Mock data for partner groups
const mockPartnerGroups = [
  {
    id: 1,
    name: 'المجموعة الأساسية',
    description: 'الشركاء الأساسيون في الشركة',
    totalSharePercentage: 100,
    createdAt: '2024-01-01T10:00:00',
    isActive: true,
    partners: [
      {
        id: 1,
        name: 'أحمد محمد علي',
        sharePercentage: 40,
        joinDate: '2024-01-01',
        role: 'شريك مؤسس'
      },
      {
        id: 2,
        name: 'فاطمة أحمد حسن',
        sharePercentage: 35,
        joinDate: '2024-01-01',
        role: 'شريك مؤسس'
      },
      {
        id: 3,
        name: 'محمد السيد إبراهيم',
        sharePercentage: 25,
        joinDate: '2024-01-01',
        role: 'شريك مؤسس'
      }
    ]
  },
  {
    id: 2,
    name: 'مجموعة التوسعات',
    description: 'شركاء مشاريع التوسعات الجديدة',
    totalSharePercentage: 100,
    createdAt: '2024-01-15T14:30:00',
    isActive: true,
    partners: [
      {
        id: 4,
        name: 'سارة محمد أحمد',
        sharePercentage: 60,
        joinDate: '2024-01-15',
        role: 'شريك رئيسي'
      },
      {
        id: 5,
        name: 'علي حسن محمود',
        sharePercentage: 40,
        joinDate: '2024-01-15',
        role: 'شريك مستثمر'
      }
    ]
  },
  {
    id: 3,
    name: 'مجموعة المقاولات',
    description: 'شركاء متخصصون في أعمال المقاولات',
    totalSharePercentage: 100,
    createdAt: '2024-01-20T09:15:00',
    isActive: false,
    partners: [
      {
        id: 6,
        name: 'خالد عبد الرحمن',
        sharePercentage: 50,
        joinDate: '2024-01-20',
        role: 'مقاول رئيسي'
      },
      {
        id: 7,
        name: 'نورا أحمد علي',
        sharePercentage: 30,
        joinDate: '2024-01-20',
        role: 'مقاول فرعي'
      },
      {
        id: 8,
        name: 'يوسف محمد سالم',
        sharePercentage: 20,
        joinDate: '2024-01-20',
        role: 'مقاول فرعي'
      }
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const isActive = searchParams.get('isActive')
    
    let filteredGroups = [...mockPartnerGroups]
    
    // Filter by specific group
    if (groupId) {
      filteredGroups = filteredGroups.filter(group => group.id === parseInt(groupId))
    }
    
    // Filter by active status
    if (isActive !== null && isActive !== 'all') {
      const activeStatus = isActive === 'true'
      filteredGroups = filteredGroups.filter(group => group.isActive === activeStatus)
    }
    
    // Sort by creation date (newest first)
    filteredGroups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Calculate stats
    const totalGroups = filteredGroups.length
    const activeGroups = filteredGroups.filter(g => g.isActive).length
    const totalPartners = filteredGroups.reduce((sum, g) => sum + g.partners.length, 0)
    const avgPartnersPerGroup = totalGroups > 0 ? Math.round(totalPartners / totalGroups) : 0
    
    return NextResponse.json({
      success: true,
      data: filteredGroups,
      total: filteredGroups.length,
      stats: {
        totalGroups,
        activeGroups,
        totalPartners,
        avgPartnersPerGroup
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب بيانات مجموعات الشركاء' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'create') {
      // Create new partner group
      const newGroup = {
        id: Math.max(...mockPartnerGroups.map(g => g.id)) + 1,
        name: body.name,
        description: body.description || '',
        totalSharePercentage: body.partners?.reduce((sum: number, p: any) => sum + p.sharePercentage, 0) || 0,
        createdAt: new Date().toISOString(),
        isActive: true,
        partners: body.partners || []
      }
      
      // Validate that share percentages don't exceed 100%
      if (newGroup.totalSharePercentage > 100) {
        return NextResponse.json(
          { success: false, error: 'إجمالي نسب المشاركة لا يمكن أن يتجاوز 100%' },
          { status: 400 }
        )
      }
      
      mockPartnerGroups.push(newGroup)
      
      return NextResponse.json({
        success: true,
        data: newGroup,
        message: 'تم إنشاء مجموعة الشركاء بنجاح'
      }, { status: 201 })
    }
    
    if (action === 'update') {
      // Update existing partner group
      const groupId = body.groupId
      const group = mockPartnerGroups.find(g => g.id === groupId)
      
      if (!group) {
        return NextResponse.json(
          { success: false, error: 'مجموعة الشركاء غير موجودة' },
          { status: 404 }
        )
      }
      
      // Update group data
      if (body.name) group.name = body.name
      if (body.description !== undefined) group.description = body.description
      if (body.isActive !== undefined) group.isActive = body.isActive
      if (body.partners) {
        group.partners = body.partners
        group.totalSharePercentage = body.partners.reduce((sum: number, p: any) => sum + p.sharePercentage, 0)
        
        // Validate share percentages
        if (group.totalSharePercentage > 100) {
          return NextResponse.json(
            { success: false, error: 'إجمالي نسب المشاركة لا يمكن أن يتجاوز 100%' },
            { status: 400 }
          )
        }
      }
      
      return NextResponse.json({
        success: true,
        data: group,
        message: 'تم تحديث مجموعة الشركاء بنجاح'
      })
    }
    
    if (action === 'addPartner') {
      // Add partner to group
      const { groupId, partner } = body
      const group = mockPartnerGroups.find(g => g.id === groupId)
      
      if (!group) {
        return NextResponse.json(
          { success: false, error: 'مجموعة الشركاء غير موجودة' },
          { status: 404 }
        )
      }
      
      // Check if adding this partner would exceed 100%
      const newTotal = group.totalSharePercentage + partner.sharePercentage
      if (newTotal > 100) {
        return NextResponse.json(
          { success: false, error: 'إضافة هذا الشريك ستتجاوز 100% من نسب المشاركة' },
          { status: 400 }
        )
      }
      
      // Add partner with new ID
      const newPartner = {
        ...partner,
        id: Math.max(...group.partners.map(p => p.id), 0) + 1,
        joinDate: new Date().toISOString().split('T')[0]
      }
      
      group.partners.push(newPartner)
      group.totalSharePercentage = newTotal
      
      return NextResponse.json({
        success: true,
        data: group,
        message: 'تم إضافة الشريك للمجموعة بنجاح'
      })
    }
    
    if (action === 'removePartner') {
      // Remove partner from group
      const { groupId, partnerId } = body
      const group = mockPartnerGroups.find(g => g.id === groupId)
      
      if (!group) {
        return NextResponse.json(
          { success: false, error: 'مجموعة الشركاء غير موجودة' },
          { status: 404 }
        )
      }
      
      const partnerIndex = group.partners.findIndex(p => p.id === partnerId)
      if (partnerIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'الشريك غير موجود في المجموعة' },
          { status: 404 }
        )
      }
      
      const removedPartner = group.partners.splice(partnerIndex, 1)[0]
      group.totalSharePercentage -= removedPartner.sharePercentage
      
      return NextResponse.json({
        success: true,
        data: group,
        message: 'تم إزالة الشريك من المجموعة بنجاح'
      })
    }
    
    if (action === 'delete') {
      // Delete partner group
      const groupId = body.groupId
      const groupIndex = mockPartnerGroups.findIndex(g => g.id === groupId)
      
      if (groupIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'مجموعة الشركاء غير موجودة' },
          { status: 404 }
        )
      }
      
      mockPartnerGroups.splice(groupIndex, 1)
      
      return NextResponse.json({
        success: true,
        message: 'تم حذف مجموعة الشركاء بنجاح'
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'إجراء غير صحيح' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في معالجة طلب مجموعات الشركاء' },
      { status: 500 }
    )
  }
}