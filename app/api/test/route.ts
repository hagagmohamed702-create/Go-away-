import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const testData = {
      success: true,
      message: 'API يعمل بنجاح على Netlify!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }
    
    console.log('Test API called:', testData)
    
    return NextResponse.json(testData)
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في اختبار API' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'تم استقبال البيانات بنجاح',
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test POST API error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في معالجة البيانات' },
      { status: 500 }
    )
  }
}