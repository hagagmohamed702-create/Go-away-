import { PrismaClient } from '@prisma/client'
import { Decimal } from 'decimal.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء زراعة قاعدة البيانات...')

  // إنشاء خزائن
  const mainCashbox = await prisma.cashbox.create({
    data: {
      code: 'MAIN-001',
      name: 'الخزينة الرئيسية',
      type: 'MAIN',
      balance: new Decimal(100000),
    },
  })

  const partnersCashbox = await prisma.cashbox.create({
    data: {
      code: 'PARTNERS-001',
      name: 'خزينة الشركاء',
      type: 'PARTNERS',
      balance: new Decimal(0),
    },
  })

  // إنشاء شركاء
  const partner1 = await prisma.partner.create({
    data: {
      code: 'P001',
      name: 'أحمد محمد',
      phone: '01234567890',
      email: 'ahmed@example.com',
    },
  })

  const partner2 = await prisma.partner.create({
    data: {
      code: 'P002',
      name: 'محمد علي',
      phone: '01234567891',
      email: 'mohamed@example.com',
    },
  })

  // إنشاء محافظ للشركاء
  await prisma.wallet.createMany({
    data: [
      { partnerId: partner1.id, balance: new Decimal(0) },
      { partnerId: partner2.id, balance: new Decimal(0) },
    ],
  })

  // إنشاء وحدات سكنية
  const units = await prisma.unit.createMany({
    data: [
      {
        code: 'A101',
        name: 'شقة 101 - عمارة أ',
        buildingNo: 'أ',
        unitType: 'سكني',
        totalPrice: new Decimal(500000),
        groupType: 'سكنية',
      },
      {
        code: 'A102',
        name: 'شقة 102 - عمارة أ',
        buildingNo: 'أ',
        unitType: 'سكني',
        totalPrice: new Decimal(450000),
        groupType: 'سكنية',
      },
      {
        code: 'B201',
        name: 'محل 201 - عمارة ب',
        buildingNo: 'ب',
        unitType: 'تجاري',
        totalPrice: new Decimal(300000),
        groupType: 'تجارية',
      },
    ],
  })

  // إنشاء عملاء
  const clients = await prisma.client.createMany({
    data: [
      {
        code: 'C001',
        name: 'سارة أحمد',
        phone: '01111111111',
        email: 'sara@example.com',
        address: 'القاهرة، مصر الجديدة',
      },
      {
        code: 'C002',
        name: 'محمد حسن',
        phone: '01222222222',
        email: 'mohamed.hassan@example.com',
        address: 'الجيزة، المهندسين',
      },
    ],
  })

  // إنشاء موردين
  await prisma.supplier.createMany({
    data: [
      {
        code: 'S001',
        name: 'شركة الحديد والصلب',
        phone: '02123456789',
        email: 'steel@company.com',
        address: 'القاهرة، شبرا الخيمة',
      },
      {
        code: 'S002',
        name: 'مؤسسة الأسمنت المصري',
        phone: '02987654321',
        email: 'cement@company.com',
        address: 'الجيزة، أكتوبر',
      },
    ],
  })

  // إنشاء مواد
  await prisma.material.createMany({
    data: [
      {
        code: 'M001',
        name: 'أسمنت',
        unit: 'طن',
        unitPrice: new Decimal(1200),
        currentQty: new Decimal(50),
        minQty: new Decimal(10),
      },
      {
        code: 'M002',
        name: 'حديد تسليح',
        unit: 'طن',
        unitPrice: new Decimal(15000),
        currentQty: new Decimal(20),
        minQty: new Decimal(5),
      },
      {
        code: 'M003',
        name: 'طوب أحمر',
        unit: 'ألف',
        unitPrice: new Decimal(800),
        currentQty: new Decimal(100),
        minQty: new Decimal(20),
      },
    ],
  })

  // إنشاء إعدادات النظام
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'company_name',
        value: 'شركة العقارات المتطورة',
        description: 'اسم الشركة',
      },
      {
        key: 'company_phone',
        value: '02123456789',
        description: 'هاتف الشركة',
      },
      {
        key: 'company_address',
        value: 'القاهرة، مصر',
        description: 'عنوان الشركة',
      },
      {
        key: 'late_fee_percentage',
        value: '2',
        description: 'نسبة غرامة التأخير (%)',
      },
      {
        key: 'notification_days_before_due',
        value: '7',
        description: 'عدد أيام التنبيه قبل موعد الاستحقاق',
      },
    ],
  })

  console.log('✅ تم زراعة قاعدة البيانات بنجاح!')
}

main()
  .catch((e) => {
    console.error('❌ خطأ في زراعة قاعدة البيانات:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })