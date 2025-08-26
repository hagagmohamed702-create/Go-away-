import { NextRequest, NextResponse } from 'next/server'

// Mock data for advanced reports
const mockFinancialData = {
  monthlyRevenue: [
    { month: 'يناير', revenue: 250000, expenses: 180000, profit: 70000 },
    { month: 'فبراير', revenue: 320000, expenses: 220000, profit: 100000 },
    { month: 'مارس', revenue: 280000, expenses: 200000, profit: 80000 },
    { month: 'أبريل', revenue: 390000, expenses: 240000, profit: 150000 },
    { month: 'مايو', revenue: 450000, expenses: 280000, profit: 170000 },
    { month: 'يونيو', revenue: 520000, expenses: 310000, profit: 210000 },
    { month: 'يوليو', revenue: 480000, expenses: 290000, profit: 190000 },
    { month: 'أغسطس', revenue: 550000, expenses: 330000, profit: 220000 },
    { month: 'سبتمبر', revenue: 510000, expenses: 320000, profit: 190000 },
    { month: 'أكتوبر', revenue: 590000, expenses: 350000, profit: 240000 },
    { month: 'نوفمبر', revenue: 620000, expenses: 380000, profit: 240000 },
    { month: 'ديسمبر', revenue: 680000, expenses: 400000, profit: 280000 }
  ],
  
  projectsAnalysis: [
    { name: 'مشروع الأبراج السكنية', budget: 2000000, spent: 1500000, completion: 75, profit: 300000 },
    { name: 'مجمع تجاري الواحة', budget: 1500000, spent: 800000, completion: 53, profit: 150000 },
    { name: 'فيلا الرياض الحديثة', budget: 800000, spent: 720000, completion: 90, profit: 80000 },
    { name: 'مكاتب الأعمال المركزية', budget: 1200000, spent: 400000, completion: 33, profit: 0 },
    { name: 'مشروع المارينا', budget: 3000000, spent: 2100000, completion: 70, profit: 400000 }
  ],
  
  partnersPerformance: [
    { name: 'أحمد محمد علي', investment: 500000, returns: 125000, roi: 25, projects: 3 },
    { name: 'فاطمة أحمد حسن', investment: 400000, returns: 120000, roi: 30, projects: 2 },
    { name: 'محمد السيد إبراهيم', investment: 300000, returns: 75000, roi: 25, projects: 2 },
    { name: 'سارة محمد أحمد', investment: 600000, returns: 180000, roi: 30, projects: 4 },
    { name: 'علي حسن محمود', investment: 450000, returns: 112500, roi: 25, projects: 3 }
  ],
  
  cashflowAnalysis: [
    { date: '2024-01-01', incoming: 150000, outgoing: 120000, balance: 30000 },
    { date: '2024-01-15', incoming: 200000, outgoing: 180000, balance: 50000 },
    { date: '2024-02-01', incoming: 180000, outgoing: 160000, balance: 70000 },
    { date: '2024-02-15', incoming: 220000, outgoing: 200000, balance: 90000 },
    { date: '2024-03-01', incoming: 190000, outgoing: 170000, balance: 110000 },
    { date: '2024-03-15', incoming: 240000, outgoing: 210000, balance: 140000 },
    { date: '2024-04-01', incoming: 260000, outgoing: 230000, balance: 170000 },
    { date: '2024-04-15', incoming: 280000, outgoing: 250000, balance: 200000 }
  ],
  
  expenseCategories: [
    { category: 'مواد البناء', amount: 1200000, percentage: 40, trend: 'increasing' },
    { category: 'العمالة', amount: 900000, percentage: 30, trend: 'stable' },
    { category: 'المعدات', amount: 450000, percentage: 15, trend: 'decreasing' },
    { category: 'النقل والمواصلات', amount: 300000, percentage: 10, trend: 'stable' },
    { category: 'مصاريف إدارية', amount: 150000, percentage: 5, trend: 'increasing' }
  ],
  
  clientsAnalysis: [
    { segment: 'عملاء مميزون', count: 25, revenue: 2500000, avgDeal: 100000 },
    { segment: 'عملاء منتظمون', count: 80, revenue: 1600000, avgDeal: 20000 },
    { segment: 'عملاء جدد', count: 120, revenue: 600000, avgDeal: 5000 }
  ],
  
  performanceKPIs: {
    totalRevenue: 5650000,
    totalExpenses: 3580000,
    netProfit: 2070000,
    profitMargin: 36.6,
    roi: 41.4,
    activeProjects: 8,
    completedProjects: 12,
    totalClients: 225,
    avgProjectCompletion: 68,
    cashOnHand: 850000,
    growthRate: 22.5
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'financial'
    const period = searchParams.get('period') || 'year'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let reportData = {}
    
    switch (reportType) {
      case 'financial':
        reportData = {
          monthlyData: mockFinancialData.monthlyRevenue,
          kpis: mockFinancialData.performanceKPIs,
          cashflow: mockFinancialData.cashflowAnalysis,
          expenses: mockFinancialData.expenseCategories
        }
        break
        
      case 'projects':
        reportData = {
          projects: mockFinancialData.projectsAnalysis,
          summary: {
            totalProjects: mockFinancialData.projectsAnalysis.length,
            totalBudget: mockFinancialData.projectsAnalysis.reduce((sum, p) => sum + p.budget, 0),
            totalSpent: mockFinancialData.projectsAnalysis.reduce((sum, p) => sum + p.spent, 0),
            avgCompletion: Math.round(
              mockFinancialData.projectsAnalysis.reduce((sum, p) => sum + p.completion, 0) / 
              mockFinancialData.projectsAnalysis.length
            ),
            totalProfit: mockFinancialData.projectsAnalysis.reduce((sum, p) => sum + p.profit, 0)
          }
        }
        break
        
      case 'partners':
        reportData = {
          partners: mockFinancialData.partnersPerformance,
          summary: {
            totalPartners: mockFinancialData.partnersPerformance.length,
            totalInvestment: mockFinancialData.partnersPerformance.reduce((sum, p) => sum + p.investment, 0),
            totalReturns: mockFinancialData.partnersPerformance.reduce((sum, p) => sum + p.returns, 0),
            avgROI: Math.round(
              mockFinancialData.partnersPerformance.reduce((sum, p) => sum + p.roi, 0) / 
              mockFinancialData.partnersPerformance.length
            ),
            totalProjects: mockFinancialData.partnersPerformance.reduce((sum, p) => sum + p.projects, 0)
          }
        }
        break
        
      case 'clients':
        reportData = {
          segments: mockFinancialData.clientsAnalysis,
          summary: {
            totalClients: mockFinancialData.clientsAnalysis.reduce((sum, s) => sum + s.count, 0),
            totalRevenue: mockFinancialData.clientsAnalysis.reduce((sum, s) => sum + s.revenue, 0),
            avgDealSize: Math.round(
              mockFinancialData.clientsAnalysis.reduce((sum, s) => sum + s.avgDeal * s.count, 0) /
              mockFinancialData.clientsAnalysis.reduce((sum, s) => sum + s.count, 0)
            )
          }
        }
        break
        
      case 'dashboard':
        reportData = {
          kpis: mockFinancialData.performanceKPIs,
          monthlyTrend: mockFinancialData.monthlyRevenue.slice(-6), // Last 6 months
          topProjects: mockFinancialData.projectsAnalysis
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 5),
          topPartners: mockFinancialData.partnersPerformance
            .sort((a, b) => b.returns - a.returns)
            .slice(0, 5),
          expenseBreakdown: mockFinancialData.expenseCategories,
          recentCashflow: mockFinancialData.cashflowAnalysis.slice(-4)
        }
        break
        
      default:
        reportData = { error: 'نوع التقرير غير مدعوم' }
    }
    
    // Add metadata
    const metadata = {
      generatedAt: new Date().toISOString(),
      period,
      reportType,
      filters: {
        startDate,
        endDate
      }
    }
    
    return NextResponse.json({
      success: true,
      data: reportData,
      metadata
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في إنشاء التقرير' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, reportConfig } = body
    
    if (action === 'generate') {
      // Generate custom report based on configuration
      const customReport = {
        id: Math.random().toString(36).substr(2, 9),
        name: reportConfig.name || 'تقرير مخصص',
        type: reportConfig.type,
        config: reportConfig,
        generatedAt: new Date().toISOString(),
        status: 'completed'
      }
      
      return NextResponse.json({
        success: true,
        data: customReport,
        message: 'تم إنشاء التقرير المخصص بنجاح'
      })
    }
    
    if (action === 'export') {
      // Simulate export functionality
      const exportJob = {
        id: Math.random().toString(36).substr(2, 9),
        format: body.format || 'pdf',
        status: 'processing',
        createdAt: new Date().toISOString(),
        downloadUrl: `/api/reports/download/${Math.random().toString(36).substr(2, 9)}`
      }
      
      return NextResponse.json({
        success: true,
        data: exportJob,
        message: 'تم بدء عملية التصدير'
      })
    }
    
    if (action === 'compare') {
      // Generate comparison data
      const { period1, period2 } = body
      
      const comparison = {
        period1: {
          label: period1,
          revenue: 2500000,
          expenses: 1800000,
          profit: 700000
        },
        period2: {
          label: period2,
          revenue: 3200000,
          expenses: 2200000,
          profit: 1000000
        },
        changes: {
          revenue: 28,
          expenses: 22.2,
          profit: 42.9
        }
      }
      
      return NextResponse.json({
        success: true,
        data: comparison,
        message: 'تم إنشاء المقارنة بنجاح'
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'إجراء غير صحيح' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في معالجة طلب التقرير' },
      { status: 500 }
    )
  }
}