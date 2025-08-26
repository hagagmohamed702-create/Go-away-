import { NextRequest, NextResponse } from 'next/server'

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    type: 'installment_overdue',
    title: 'قسط متأخر',
    message: 'قسط العميل أحمد محمد علي (القسط رقم 3) متأخر لمدة 5 أيام',
    priority: 'high',
    isRead: false,
    createdAt: '2024-01-15T10:30:00',
    data: {
      clientName: 'أحمد محمد علي',
      contractNumber: 'C-2024-001',
      installmentNumber: 3,
      amount: 250000,
      dueDate: '2024-01-10',
      overdueDays: 5
    }
  },
  {
    id: 2,
    type: 'installment_reminder',
    title: 'تذكير قسط قادم',
    message: 'قسط العميل فاطمة أحمد حسن مستحق خلال 3 أيام',
    priority: 'medium',
    isRead: false,
    createdAt: '2024-01-14T14:20:00',
    data: {
      clientName: 'فاطمة أحمد حسن',
      contractNumber: 'C-2024-002',
      installmentNumber: 4,
      amount: 180000,
      dueDate: '2024-01-18',
      daysLeft: 3
    }
  },
  {
    id: 3,
    type: 'low_inventory',
    title: 'مخزون منخفض',
    message: 'مادة أسمنت بورتلاندي أقل من الحد الأدنى (15 طن متبقي)',
    priority: 'medium',
    isRead: false,
    createdAt: '2024-01-14T09:15:00',
    data: {
      materialName: 'أسمنت بورتلاندي',
      currentStock: 15,
      minimumStock: 20,
      unit: 'طن'
    }
  },
  {
    id: 4,
    type: 'project_budget_warning',
    title: 'تحذير ميزانية مشروع',
    message: 'مشروع العمارة الجديدة تجاوز 80% من الميزانية المخصصة',
    priority: 'high',
    isRead: true,
    createdAt: '2024-01-13T16:45:00',
    data: {
      projectName: 'مشروع العمارة الجديدة',
      projectCode: 'PRJ-2024-001',
      budgetUsed: 4000000,
      totalBudget: 5000000,
      percentageUsed: 80
    }
  },
  {
    id: 5,
    type: 'settlement_pending',
    title: 'تسوية معلقة',
    message: 'تسوية SET-2024-002 في انتظار الاعتماد',
    priority: 'medium',
    isRead: true,
    createdAt: '2024-01-12T11:30:00',
    data: {
      settlementNumber: 'SET-2024-002',
      totalAmount: 200000,
      partnersCount: 3
    }
  },
  {
    id: 6,
    type: 'payment_received',
    title: 'دفعة مستلمة',
    message: 'تم استلام دفعة بقيمة 300,000 جنيه من العميل محمد السيد',
    priority: 'low',
    isRead: true,
    createdAt: '2024-01-11T13:20:00',
    data: {
      clientName: 'محمد السيد إبراهيم',
      amount: 300000,
      voucherNumber: 'REC-2024-003'
    }
  },
  {
    id: 7,
    type: 'contract_expiring',
    title: 'عقد ينتهي قريباً',
    message: 'عقد C-2024-003 سينتهي خلال 30 يوم',
    priority: 'medium',
    isRead: true,
    createdAt: '2024-01-10T08:45:00',
    data: {
      contractNumber: 'C-2024-003',
      clientName: 'علي محمد أحمد',
      expiryDate: '2024-02-10',
      daysLeft: 30
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const isRead = searchParams.get('isRead')
    const limit = searchParams.get('limit')
    
    let filteredNotifications = [...mockNotifications]
    
    // Filter by type
    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(notification => notification.type === type)
    }
    
    // Filter by priority
    if (priority && priority !== 'all') {
      filteredNotifications = filteredNotifications.filter(notification => notification.priority === priority)
    }
    
    // Filter by read status
    if (isRead !== null && isRead !== 'all') {
      const readStatus = isRead === 'true'
      filteredNotifications = filteredNotifications.filter(notification => notification.isRead === readStatus)
    }
    
    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Limit results
    if (limit) {
      filteredNotifications = filteredNotifications.slice(0, parseInt(limit))
    }
    
    // Calculate stats
    const totalNotifications = mockNotifications.length
    const unreadCount = mockNotifications.filter(n => !n.isRead).length
    const highPriorityCount = mockNotifications.filter(n => n.priority === 'high' && !n.isRead).length
    const todayCount = mockNotifications.filter(n => 
      new Date(n.createdAt).toDateString() === new Date().toDateString()
    ).length
    
    return NextResponse.json({
      success: true,
      data: filteredNotifications,
      total: filteredNotifications.length,
      stats: {
        totalNotifications,
        unreadCount,
        highPriorityCount,
        todayCount
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب الإشعارات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, notificationId, notificationIds } = body
    
    if (action === 'markAsRead') {
      if (notificationId) {
        // Mark single notification as read
        const notification = mockNotifications.find(n => n.id === notificationId)
        if (notification) {
          notification.isRead = true
        }
      }
      
      if (notificationIds && Array.isArray(notificationIds)) {
        // Mark multiple notifications as read
        notificationIds.forEach(id => {
          const notification = mockNotifications.find(n => n.id === id)
          if (notification) {
            notification.isRead = true
          }
        })
      }
      
      return NextResponse.json({
        success: true,
        message: 'تم تحديث حالة الإشعارات'
      })
    }
    
    if (action === 'markAllAsRead') {
      // Mark all notifications as read
      mockNotifications.forEach(notification => {
        notification.isRead = true
      })
      
      return NextResponse.json({
        success: true,
        message: 'تم تحديد جميع الإشعارات كمقروءة'
      })
    }
    
    if (action === 'delete') {
      if (notificationId) {
        // Delete single notification
        const index = mockNotifications.findIndex(n => n.id === notificationId)
        if (index > -1) {
          mockNotifications.splice(index, 1)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'تم حذف الإشعار'
      })
    }
    
    if (action === 'create') {
      // Create new notification (for system-generated notifications)
      const newNotification = {
        id: Math.max(...mockNotifications.map(n => n.id)) + 1,
        type: body.type,
        title: body.title,
        message: body.message,
        priority: body.priority || 'medium',
        isRead: false,
        createdAt: new Date().toISOString(),
        data: body.data || {}
      }
      
      mockNotifications.unshift(newNotification)
      
      return NextResponse.json({
        success: true,
        data: newNotification,
        message: 'تم إنشاء الإشعار'
      }, { status: 201 })
    }
    
    return NextResponse.json(
      { success: false, error: 'إجراء غير صحيح' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في معالجة الإشعار' },
      { status: 500 }
    )
  }
}

// Function to generate automatic notifications (would be called by other parts of the system)
// This function is not exported as a route handler but can be imported by other modules
function generateAutomaticNotifications() {
  // This would typically be called by cron jobs or other system events
  // Example: Check for overdue installments, low inventory, etc.
  
  // Check overdue installments
  // Check upcoming installments
  // Check low inventory
  // Check project budget warnings
  // Check contract expiry
  // etc.
}