import { NextRequest, NextResponse } from 'next/server'

// Mock data for brokers and their commissions
const mockBrokers = [
  {
    id: 1,
    name: 'أحمد سالم العتيبي',
    phone: '0551234567',
    email: 'ahmed.salem@broker.com',
    licenseNumber: 'BRK-2024-001',
    commissionRate: 2.5, // نسبة العمولة الافتراضية
    totalSales: 15,
    totalCommissions: 187500,
    status: 'active',
    joinDate: '2024-01-15',
    specialization: 'شقق سكنية'
  },
  {
    id: 2,
    name: 'فاطمة محمد القحطاني',
    phone: '0559876543',
    email: 'fatma.mohammed@broker.com',
    licenseNumber: 'BRK-2024-002',
    commissionRate: 3.0,
    totalSales: 22,
    totalCommissions: 310000,
    status: 'active',
    joinDate: '2024-01-20',
    specialization: 'فلل وقصور'
  },
  {
    id: 3,
    name: 'محمد عبد العزيز الشمري',
    phone: '0556543210',
    email: 'mohammed.abdulaziz@broker.com',
    licenseNumber: 'BRK-2024-003',
    commissionRate: 2.0,
    totalSales: 8,
    totalCommissions: 96000,
    status: 'active',
    joinDate: '2024-02-01',
    specialization: 'شقق تجارية'
  }
]

const mockCommissions = [
  {
    id: 1,
    brokerId: 1,
    brokerName: 'أحمد سالم العتيبي',
    unitId: 101,
    unitNumber: 'A-101',
    projectName: 'مشروع الأبراج السكنية',
    clientName: 'سارة أحمد الخالد',
    salePrice: 850000,
    commissionRate: 2.5,
    commissionAmount: 21250,
    saleDate: '2024-03-15',
    paymentStatus: 'paid',
    paymentDate: '2024-03-20',
    notes: 'بيع مباشر - عميل جديد'
  },
  {
    id: 2,
    brokerId: 1,
    brokerName: 'أحمد سالم العتيبي',
    unitId: 102,
    unitNumber: 'A-102',
    projectName: 'مشروع الأبراج السكنية',
    clientName: 'خالد محمد العبدلي',
    salePrice: 920000,
    commissionRate: 2.5,
    commissionAmount: 23000,
    saleDate: '2024-03-22',
    paymentStatus: 'pending',
    paymentDate: null,
    notes: 'في انتظار استكمال الأوراق'
  },
  {
    id: 3,
    brokerId: 2,
    brokerName: 'فاطمة محمد القحطاني',
    unitId: 201,
    unitNumber: 'B-201',
    projectName: 'مجمع الواحة السكني',
    clientName: 'عبد الله سعد الدوسري',
    salePrice: 1200000,
    commissionRate: 3.0,
    commissionAmount: 36000,
    saleDate: '2024-03-18',
    paymentStatus: 'paid',
    paymentDate: '2024-03-25',
    notes: 'عميل VIP - خصم خاص'
  },
  {
    id: 4,
    brokerId: 2,
    brokerName: 'فاطمة محمد القحطاني',
    unitId: 202,
    unitNumber: 'B-202',
    projectName: 'مجمع الواحة السكني',
    clientName: 'نورا فهد المطيري',
    salePrice: 1150000,
    commissionRate: 3.0,
    commissionAmount: 34500,
    saleDate: '2024-03-25',
    paymentStatus: 'pending',
    paymentDate: null,
    notes: 'تحويل بنكي قيد المعالجة'
  },
  {
    id: 5,
    brokerId: 3,
    brokerName: 'محمد عبد العزيز الشمري',
    unitId: 301,
    unitNumber: 'C-301',
    projectName: 'مركز الأعمال التجاري',
    clientName: 'شركة الرياض للاستثمار',
    salePrice: 2400000,
    commissionRate: 2.0,
    commissionAmount: 48000,
    saleDate: '2024-03-10',
    paymentStatus: 'paid',
    paymentDate: '2024-03-15',
    notes: 'صفقة تجارية كبيرة'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'commissions'
    const brokerId = searchParams.get('brokerId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    if (type === 'brokers') {
      // Return brokers list
      let filteredBrokers = [...mockBrokers]
      
      if (status && status !== 'all') {
        filteredBrokers = filteredBrokers.filter(broker => broker.status === status)
      }
      
      // Calculate additional stats for each broker
      const brokersWithStats = filteredBrokers.map(broker => {
        const brokerCommissions = mockCommissions.filter(c => c.brokerId === broker.id)
        const paidCommissions = brokerCommissions.filter(c => c.paymentStatus === 'paid')
        const pendingCommissions = brokerCommissions.filter(c => c.paymentStatus === 'pending')
        
        return {
          ...broker,
          paidCommissions: paidCommissions.reduce((sum, c) => sum + c.commissionAmount, 0),
          pendingCommissions: pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0),
          salesThisMonth: brokerCommissions.filter(c => 
            new Date(c.saleDate).getMonth() === new Date().getMonth()
          ).length
        }
      })
      
      return NextResponse.json({
        success: true,
        data: brokersWithStats,
        total: brokersWithStats.length
      })
    }
    
    if (type === 'commissions') {
      // Return commissions list
      let filteredCommissions = [...mockCommissions]
      
      if (brokerId) {
        filteredCommissions = filteredCommissions.filter(c => c.brokerId === parseInt(brokerId))
      }
      
      if (status && status !== 'all') {
        filteredCommissions = filteredCommissions.filter(c => c.paymentStatus === status)
      }
      
      if (startDate) {
        filteredCommissions = filteredCommissions.filter(c => 
          new Date(c.saleDate) >= new Date(startDate)
        )
      }
      
      if (endDate) {
        filteredCommissions = filteredCommissions.filter(c => 
          new Date(c.saleDate) <= new Date(endDate)
        )
      }
      
      // Sort by sale date (newest first)
      filteredCommissions.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
      
      // Calculate summary stats
      const totalCommissions = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
      const paidCommissions = filteredCommissions
        .filter(c => c.paymentStatus === 'paid')
        .reduce((sum, c) => sum + c.commissionAmount, 0)
      const pendingCommissions = filteredCommissions
        .filter(c => c.paymentStatus === 'pending')
        .reduce((sum, c) => sum + c.commissionAmount, 0)
      const totalSales = filteredCommissions.reduce((sum, c) => sum + c.salePrice, 0)
      
      return NextResponse.json({
        success: true,
        data: filteredCommissions,
        total: filteredCommissions.length,
        summary: {
          totalCommissions,
          paidCommissions,
          pendingCommissions,
          totalSales,
          averageCommissionRate: filteredCommissions.length > 0 
            ? filteredCommissions.reduce((sum, c) => sum + c.commissionRate, 0) / filteredCommissions.length 
            : 0
        }
      })
    }
    
    if (type === 'stats') {
      // Return dashboard statistics
      const totalBrokers = mockBrokers.length
      const activeBrokers = mockBrokers.filter(b => b.status === 'active').length
      const totalCommissionsValue = mockCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
      const paidCommissionsValue = mockCommissions
        .filter(c => c.paymentStatus === 'paid')
        .reduce((sum, c) => sum + c.commissionAmount, 0)
      const pendingCommissionsValue = mockCommissions
        .filter(c => c.paymentStatus === 'pending')
        .reduce((sum, c) => sum + c.commissionAmount, 0)
      const totalSalesValue = mockCommissions.reduce((sum, c) => sum + c.salePrice, 0)
      const totalUnits = mockCommissions.length
      
      // Monthly performance
      const monthlyData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthName = date.toLocaleDateString('ar-SA', { month: 'long' })
        const monthCommissions = mockCommissions.filter(c => {
          const commissionDate = new Date(c.saleDate)
          return commissionDate.getMonth() === date.getMonth() &&
                 commissionDate.getFullYear() === date.getFullYear()
        })
        
        monthlyData.push({
          month: monthName,
          sales: monthCommissions.length,
          commissions: monthCommissions.reduce((sum, c) => sum + c.commissionAmount, 0),
          volume: monthCommissions.reduce((sum, c) => sum + c.salePrice, 0)
        })
      }
      
      // Top performers
      const brokerPerformance = mockBrokers.map(broker => {
        const brokerCommissions = mockCommissions.filter(c => c.brokerId === broker.id)
        return {
          ...broker,
          totalCommissions: brokerCommissions.reduce((sum, c) => sum + c.commissionAmount, 0),
          totalSales: brokerCommissions.length,
          totalVolume: brokerCommissions.reduce((sum, c) => sum + c.salePrice, 0)
        }
      }).sort((a, b) => b.totalCommissions - a.totalCommissions)
      
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalBrokers,
            activeBrokers,
            totalCommissionsValue,
            paidCommissionsValue,
            pendingCommissionsValue,
            totalSalesValue,
            totalUnits,
            averageCommissionRate: mockCommissions.reduce((sum, c) => sum + c.commissionRate, 0) / mockCommissions.length
          },
          monthlyData,
          topPerformers: brokerPerformance.slice(0, 5)
        }
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'نوع الطلب غير صحيح' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب بيانات العمولات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'createBroker') {
      // Create new broker
      const newBroker = {
        id: Math.max(...mockBrokers.map(b => b.id)) + 1,
        name: body.name,
        phone: body.phone,
        email: body.email,
        licenseNumber: body.licenseNumber,
        commissionRate: body.commissionRate || 2.5,
        totalSales: 0,
        totalCommissions: 0,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        specialization: body.specialization || 'شقق سكنية'
      }
      
      mockBrokers.push(newBroker)
      
      return NextResponse.json({
        success: true,
        data: newBroker,
        message: 'تم إضافة الوسيط بنجاح'
      }, { status: 201 })
    }
    
    if (action === 'updateBroker') {
      // Update broker
      const brokerId = body.brokerId
      const broker = mockBrokers.find(b => b.id === brokerId)
      
      if (!broker) {
        return NextResponse.json(
          { success: false, error: 'الوسيط غير موجود' },
          { status: 404 }
        )
      }
      
      // Update broker data
      if (body.name) broker.name = body.name
      if (body.phone) broker.phone = body.phone
      if (body.email) broker.email = body.email
      if (body.licenseNumber) broker.licenseNumber = body.licenseNumber
      if (body.commissionRate !== undefined) broker.commissionRate = body.commissionRate
      if (body.specialization) broker.specialization = body.specialization
      if (body.status) broker.status = body.status
      
      return NextResponse.json({
        success: true,
        data: broker,
        message: 'تم تحديث بيانات الوسيط بنجاح'
      })
    }
    
    if (action === 'createCommission') {
      // Create new commission record
      const newCommission = {
        id: Math.max(...mockCommissions.map(c => c.id)) + 1,
        brokerId: body.brokerId,
        brokerName: mockBrokers.find(b => b.id === body.brokerId)?.name || '',
        unitId: body.unitId,
        unitNumber: body.unitNumber,
        projectName: body.projectName,
        clientName: body.clientName,
        salePrice: body.salePrice,
        commissionRate: body.commissionRate,
        commissionAmount: (body.salePrice * body.commissionRate) / 100,
        saleDate: body.saleDate,
        paymentStatus: 'pending',
        paymentDate: null,
        notes: body.notes || ''
      }
      
      mockCommissions.push(newCommission)
      
      // Update broker stats
      const broker = mockBrokers.find(b => b.id === body.brokerId)
      if (broker) {
        broker.totalSales += 1
        broker.totalCommissions += newCommission.commissionAmount
      }
      
      return NextResponse.json({
        success: true,
        data: newCommission,
        message: 'تم إضافة العمولة بنجاح'
      }, { status: 201 })
    }
    
    if (action === 'updateCommissionStatus') {
      // Update commission payment status
      const commissionId = body.commissionId
      const commission = mockCommissions.find(c => c.id === commissionId)
      
      if (!commission) {
        return NextResponse.json(
          { success: false, error: 'العمولة غير موجودة' },
          { status: 404 }
        )
      }
      
      commission.paymentStatus = body.paymentStatus
      if (body.paymentStatus === 'paid') {
        commission.paymentDate = new Date().toISOString().split('T')[0]
      } else {
        commission.paymentDate = null
      }
      
      return NextResponse.json({
        success: true,
        data: commission,
        message: 'تم تحديث حالة الدفع بنجاح'
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'إجراء غير صحيح' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في معالجة طلب العمولات' },
      { status: 500 }
    )
  }
}