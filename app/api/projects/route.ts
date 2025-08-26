import { NextRequest, NextResponse } from 'next/server'

// Mock data for projects
const mockProjects = [
  {
    id: 1,
    name: 'مشروع العمارة الجديدة',
    code: 'PRJ-2024-001',
    type: 'إنشاء',
    status: 'قيد التنفيذ',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    budget: 5000000,
    spent: 1250000,
    remaining: 3750000,
    progress: 25,
    location: 'القاهرة الجديدة',
    description: 'مشروع إنشاء عمارة سكنية متكاملة',
    contractor: 'شركة المقاولات الحديثة',
    manager: 'أحمد محمد علي'
  },
  {
    id: 2,
    name: 'مشروع الفيلات السكنية',
    code: 'PRJ-2024-002',
    type: 'إنشاء',
    status: 'قيد التنفيذ',
    startDate: '2024-02-15',
    endDate: '2024-11-30',
    budget: 3500000,
    spent: 875000,
    remaining: 2625000,
    progress: 30,
    location: 'الشيخ زايد',
    description: 'مشروع إنشاء مجمع فيلات سكنية فاخرة',
    contractor: 'مؤسسة البناء المتطور',
    manager: 'سارة أحمد حسن'
  },
  {
    id: 3,
    name: 'صيانة المباني القديمة',
    code: 'PRJ-2024-003',
    type: 'صيانة',
    status: 'مكتمل',
    startDate: '2023-11-01',
    endDate: '2024-01-15',
    budget: 800000,
    spent: 750000,
    remaining: 50000,
    progress: 100,
    location: 'وسط البلد',
    description: 'أعمال صيانة وترميم المباني القديمة',
    contractor: 'شركة الصيانة المتخصصة',
    manager: 'محمد السيد إبراهيم'
  },
  {
    id: 4,
    name: 'تجديد الواجهات',
    code: 'PRJ-2024-004',
    type: 'تجديد',
    status: 'معلق',
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    budget: 1200000,
    spent: 0,
    remaining: 1200000,
    progress: 0,
    location: 'مدينة نصر',
    description: 'مشروع تجديد واجهات المباني التجارية',
    contractor: 'شركة التجديد الحديثة',
    manager: 'نورا علي محمد'
  }
]

// Mock data for materials
const mockMaterials = [
  {
    id: 1,
    name: 'أسمنت بورتلاندي',
    unit: 'طن',
    unitPrice: 1500,
    availableQuantity: 150,
    minimumStock: 20,
    supplier: 'شركة الأسمنت المصرية',
    category: 'مواد البناء الأساسية',
    lastPurchaseDate: '2024-01-10'
  },
  {
    id: 2,
    name: 'حديد التسليح',
    unit: 'طن',
    unitPrice: 18000,
    availableQuantity: 75,
    minimumStock: 10,
    supplier: 'مصانع الحديد والصلب',
    category: 'حديد ومعادن',
    lastPurchaseDate: '2024-01-08'
  },
  {
    id: 3,
    name: 'طوب أحمر',
    unit: 'ألف وحدة',
    unitPrice: 800,
    availableQuantity: 50,
    minimumStock: 5,
    supplier: 'مصانع الطوب الحديثة',
    category: 'مواد البناء',
    lastPurchaseDate: '2024-01-12'
  },
  {
    id: 4,
    name: 'رمل',
    unit: 'متر مكعب',
    unitPrice: 120,
    availableQuantity: 200,
    minimumStock: 30,
    supplier: 'محاجر الرمل المتخصصة',
    category: 'مواد خام',
    lastPurchaseDate: '2024-01-05'
  },
  {
    id: 5,
    name: 'بلاط سيراميك',
    unit: 'متر مربع',
    unitPrice: 85,
    availableQuantity: 500,
    minimumStock: 50,
    supplier: 'معارض السيراميك الحديثة',
    category: 'مواد التشطيب',
    lastPurchaseDate: '2024-01-15'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const dataType = searchParams.get('dataType')
    
    if (dataType === 'materials') {
      // Return materials data
      const lowStockMaterials = mockMaterials.filter(m => m.availableQuantity <= m.minimumStock)
      const totalValue = mockMaterials.reduce((sum, m) => sum + (m.availableQuantity * m.unitPrice), 0)
      
      return NextResponse.json({
        success: true,
        data: mockMaterials,
        total: mockMaterials.length,
        stats: {
          totalMaterials: mockMaterials.length,
          lowStockCount: lowStockMaterials.length,
          totalValue: totalValue,
          categories: Array.from(new Set(mockMaterials.map(m => m.category))).length
        }
      })
    }
    
    // Return projects data
    let filteredProjects = [...mockProjects]
    
    if (type && type !== 'all') {
      filteredProjects = filteredProjects.filter(project => project.type === type)
    }
    
    if (status && status !== 'all') {
      filteredProjects = filteredProjects.filter(project => project.status === status)
    }
    
    // Calculate totals
    const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0)
    const totalSpent = filteredProjects.reduce((sum, p) => sum + p.spent, 0)
    const totalRemaining = filteredProjects.reduce((sum, p) => sum + p.remaining, 0)
    const avgProgress = filteredProjects.length > 0 
      ? filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length 
      : 0
    
    return NextResponse.json({
      success: true,
      data: filteredProjects,
      total: filteredProjects.length,
      totals: {
        budget: totalBudget,
        spent: totalSpent,
        remaining: totalRemaining,
        avgProgress: Math.round(avgProgress)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب بيانات المشاريع' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataType } = body
    
    if (dataType === 'material') {
      // Add new material
      const newMaterial = {
        id: Math.max(...mockMaterials.map(m => m.id)) + 1,
        name: body.name,
        unit: body.unit,
        unitPrice: body.unitPrice,
        availableQuantity: body.availableQuantity || 0,
        minimumStock: body.minimumStock || 0,
        supplier: body.supplier,
        category: body.category,
        lastPurchaseDate: new Date().toISOString().split('T')[0]
      }
      
      mockMaterials.push(newMaterial)
      
      return NextResponse.json({
        success: true,
        data: newMaterial,
        message: 'تم إضافة المادة بنجاح'
      }, { status: 201 })
    }
    
    // Add new project
    const newProject = {
      id: Math.max(...mockProjects.map(p => p.id)) + 1,
      name: body.name,
      code: `PRJ-${new Date().getFullYear()}-${String(Math.max(...mockProjects.map(p => p.id)) + 1).padStart(3, '0')}`,
      type: body.type,
      status: 'قيد التنفيذ',
      startDate: body.startDate,
      endDate: body.endDate,
      budget: body.budget,
      spent: 0,
      remaining: body.budget,
      progress: 0,
      location: body.location,
      description: body.description,
      contractor: body.contractor,
      manager: body.manager
    }
    
    mockProjects.push(newProject)
    
    return NextResponse.json({
      success: true,
      data: newProject,
      message: 'تم إضافة المشروع بنجاح'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في إضافة البيانات' },
      { status: 500 }
    )
  }
}