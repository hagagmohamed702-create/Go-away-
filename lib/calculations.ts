import { Decimal } from 'decimal.js'
import { prisma } from './prisma'

// حساب قيمة القسط الواحد
export function calculateInstallmentAmount(
  totalPrice: Decimal,
  downPayment: Decimal,
  installmentCount: number
): Decimal {
  const remainingAmount = totalPrice.minus(downPayment)
  return remainingAmount.dividedBy(installmentCount)
}

// حساب المبلغ المتبقي من القسط
export function calculateRemainingAmount(
  installmentAmount: Decimal,
  paidAmount: Decimal
): Decimal {
  return installmentAmount.minus(paidAmount)
}

// توليد جدول الأقساط
export function generateInstallmentSchedule(
  contractData: {
    unitPrice: Decimal
    downPayment: Decimal
    installmentCount: number
    paymentType: string
    startDate?: Date
  }
) {
  const installmentAmount = calculateInstallmentAmount(
    contractData.unitPrice,
    contractData.downPayment,
    contractData.installmentCount
  )

  const startDate = contractData.startDate || new Date()
  const installments = []

  for (let i = 1; i <= contractData.installmentCount; i++) {
    const dueDate = new Date(startDate)
    
    // حساب تاريخ الاستحقاق حسب نوع الدفع
    switch (contractData.paymentType) {
      case 'MONTHLY':
        dueDate.setMonth(startDate.getMonth() + i)
        break
      case 'QUARTERLY':
        dueDate.setMonth(startDate.getMonth() + (i * 3))
        break
      case 'YEARLY':
        dueDate.setFullYear(startDate.getFullYear() + i)
        break
    }

    installments.push({
      installmentNo: i,
      amount: installmentAmount,
      dueDate,
      remainingAmount: installmentAmount,
      status: 'PENDING'
    })
  }

  return installments
}

// حساب توزيع المبلغ على الشركاء حسب النسب
export async function calculatePartnerDistribution(
  unitId: string,
  amount: Decimal
) {
  const unitPartners = await prisma.unitPartner.findMany({
    where: { unitId },
    include: { partner: true }
  })

  return unitPartners.map(unitPartner => ({
    partnerId: unitPartner.partnerId,
    partnerName: unitPartner.partner.name,
    percentage: unitPartner.percentage,
    amount: amount.times(unitPartner.percentage).dividedBy(100)
  }))
}

// حساب التسوية بين الشركاء
export async function calculatePartnerSettlement(partnerIds: string[]) {
  const settlements = []

  // جلب محافظ الشركاء
  const wallets = await prisma.wallet.findMany({
    where: { partnerId: { in: partnerIds } },
    include: { partner: true }
  })

  // حساب المتوسط
  const totalBalance = wallets.reduce((sum, wallet) => 
    sum.plus(wallet.balance), new Decimal(0)
  )
  const averageBalance = totalBalance.dividedBy(wallets.length)

  // حساب التسويات المطلوبة
  for (const wallet of wallets) {
    const difference = wallet.balance.minus(averageBalance)
    
    if (!difference.isZero()) {
      settlements.push({
        partnerId: wallet.partnerId,
        partnerName: wallet.partner.name,
        currentBalance: wallet.balance,
        targetBalance: averageBalance,
        settlementAmount: difference.abs(),
        settlementType: difference.isPositive() ? 'CREDIT' : 'DEBIT'
      })
    }
  }

  return settlements
}

// حساب غرامة التأخير
export async function calculateLateFee(
  installmentId: string,
  currentDate: Date = new Date()
): Promise<Decimal> {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId }
  })

  if (!installment || installment.status === 'PAID') {
    return new Decimal(0)
  }

  const lateFeePercentage = await prisma.systemSetting.findUnique({
    where: { key: 'late_fee_percentage' }
  })

  const percentage = lateFeePercentage ? 
    new Decimal(lateFeePercentage.value) : new Decimal(2)

  const daysDiff = Math.floor(
    (currentDate.getTime() - installment.dueDate.getTime()) / 
    (1000 * 60 * 60 * 24)
  )

  if (daysDiff > 0) {
    return installment.remainingAmount
      .times(percentage)
      .dividedBy(100)
      .times(daysDiff)
      .dividedBy(30) // حساب شهري
  }

  return new Decimal(0)
}

// تحديث رصيد الخزينة
export async function updateCashboxBalance(
  cashboxId: string,
  amount: Decimal,
  operation: 'ADD' | 'SUBTRACT'
) {
  const cashbox = await prisma.cashbox.findUnique({
    where: { id: cashboxId }
  })

  if (!cashbox) {
    throw new Error('الخزينة غير موجودة')
  }

  const newBalance = operation === 'ADD' ? 
    cashbox.balance.plus(amount) : 
    cashbox.balance.minus(amount)

  if (newBalance.isNegative()) {
    throw new Error('الرصيد غير كافي في الخزينة')
  }

  return await prisma.cashbox.update({
    where: { id: cashboxId },
    data: { balance: newBalance }
  })
}

// تحديث رصيد محفظة الشريك
export async function updatePartnerWallet(
  partnerId: string,
  amount: Decimal,
  operation: 'ADD' | 'SUBTRACT'
) {
  const wallet = await prisma.wallet.findUnique({
    where: { partnerId }
  })

  if (!wallet) {
    throw new Error('محفظة الشريك غير موجودة')
  }

  const newBalance = operation === 'ADD' ? 
    wallet.balance.plus(amount) : 
    wallet.balance.minus(amount)

  return await prisma.wallet.update({
    where: { partnerId },
    data: { balance: newBalance }
  })
}

// حساب إجمالي الإيرادات
export async function calculateTotalRevenue(
  startDate?: Date,
  endDate?: Date
): Promise<Decimal> {
  const where: any = {}
  
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }

  const receipts = await prisma.receipt.findMany({ where })
  
  return receipts.reduce((total, receipt) => 
    total.plus(receipt.amount), new Decimal(0)
  )
}

// حساب إجمالي المصروفات
export async function calculateTotalExpenses(
  startDate?: Date,
  endDate?: Date
): Promise<Decimal> {
  const where: any = {}
  
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }

  const expenses = await prisma.expense.findMany({ where })
  
  return expenses.reduce((total, expense) => 
    total.plus(expense.amount), new Decimal(0)
  )
}

// حساب صافي الربح
export async function calculateNetProfit(
  startDate?: Date,
  endDate?: Date
): Promise<Decimal> {
  const totalRevenue = await calculateTotalRevenue(startDate, endDate)
  const totalExpenses = await calculateTotalExpenses(startDate, endDate)
  
  return totalRevenue.minus(totalExpenses)
}