import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.maintenanceSchedule.deleteMany()
  await prisma.serviceHistory.deleteMany()
  await prisma.mileageRecord.deleteMany()
  await prisma.motorcycle.deleteMany()

  // Create demo motorcycle
  const motorcycle = await prisma.motorcycle.create({
    data: {
      brand: 'Honda',
      model: 'Vario 160',
      year: 2023,
      currentMileage: 18500,
    },
  })

  console.log(`Created motorcycle: ${motorcycle.brand} ${motorcycle.model} (ID: ${motorcycle.id})`)

  const now = new Date()
  const daysAgo = (days: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() - days)
    return d
  }

  // Mileage records
  await prisma.mileageRecord.createMany({
    data: [
      {
        motorcycleId: motorcycle.id,
        mileage: 10000,
        recordedAt: daysAgo(180),
      },
      {
        motorcycleId: motorcycle.id,
        mileage: 12000,
        recordedAt: daysAgo(120),
      },
      {
        motorcycleId: motorcycle.id,
        mileage: 15000,
        recordedAt: daysAgo(60),
      },
      {
        motorcycleId: motorcycle.id,
        mileage: 18500,
        recordedAt: daysAgo(3),
      },
    ],
  })

  // Service histories
  await prisma.serviceHistory.createMany({
    data: [
      {
        motorcycleId: motorcycle.id,
        serviceType: 'Ganti Busi',
        serviceDate: daysAgo(190),
        mileage: 10000,
        cost: 35000,
        notes: 'Penggantian busi standar NGK CPR9EA-9 di AHASS',
      },
      {
        motorcycleId: motorcycle.id,
        serviceType: 'Servis CVT',
        serviceDate: daysAgo(120),
        mileage: 12000,
        cost: 150000,
        notes: 'Pembersihan mangkok CVT dan penggantian satu set roller',
      },
      {
        motorcycleId: motorcycle.id,
        serviceType: 'Ganti Oli Mesin',
        serviceDate: daysAgo(40),
        mileage: 17000,
        cost: 65000,
        notes: 'Ganti oli MPX2 0.8L dan cek filter udara',
      },
    ],
  })

  // Maintenance schedules
  await prisma.maintenanceSchedule.createMany({
    data: [
      {
        motorcycleId: motorcycle.id,
        maintenanceType: 'Ganti Oli Mesin',
        intervalKm: 2000,
        intervalDays: 60,
        lastServiceMileage: 17000,
        lastServiceDate: daysAgo(40),
      },
      {
        motorcycleId: motorcycle.id,
        maintenanceType: 'Ganti Busi',
        intervalKm: 8000,
        intervalDays: 180,
        lastServiceMileage: 10000,
        lastServiceDate: daysAgo(190),
      },
      {
        motorcycleId: motorcycle.id,
        maintenanceType: 'Servis CVT',
        intervalKm: 8000,
        intervalDays: 180,
        lastServiceMileage: 12000,
        lastServiceDate: daysAgo(120),
      },
      {
        motorcycleId: motorcycle.id,
        maintenanceType: 'Cek Kampas Rem',
        intervalKm: 6000,
        intervalDays: 120,
        lastServiceMileage: 15000,
        lastServiceDate: daysAgo(60),
      },
    ],
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
