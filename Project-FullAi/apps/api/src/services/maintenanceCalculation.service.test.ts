import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  calculateMaintenanceStatus,
  type RawMaintenanceSchedule,
} from './maintenanceCalculation.service.js'

const baseSchedule: RawMaintenanceSchedule = {
  id: 1,
  motorcycleId: 10,
  maintenanceType: 'Ganti Oli Mesin',
  intervalKm: 2000,
  intervalDays: 60,
  lastServiceMileage: 10000,
  lastServiceDate: new Date('2026-01-01T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
}

// Fixed reference date: 2026-01-20 (19 days elapsed since last service)
const refDate = new Date('2026-01-20T00:00:00.000Z')

test('calculates UPCOMING status when far from interval limit', () => {
  // Current mileage: 10500 km (next is 12000 km, remaining is 1500 km > 10% of 2000 => > 200)
  // Remaining days: 60 - 19 = 41 days > 7
  const result = calculateMaintenanceStatus(baseSchedule, 10500, refDate)

  assert.equal(result.status, 'UPCOMING')
  assert.equal(result.nextMileage, 12000)
  assert.equal(result.remainingKm, 1500)
  assert.equal(result.remainingDays, 41)
  assert.equal(result.progressPercent, 25)
})

test('calculates DUE SOON status when remaining km is within 10% of interval', () => {
  // Current mileage: 11850 km (remaining 150 km <= 200 km (10% of 2000))
  const result = calculateMaintenanceStatus(baseSchedule, 11850, refDate)

  assert.equal(result.status, 'DUE SOON')
  assert.equal(result.remainingKm, 150)
})

test('calculates DUE SOON status when remaining days is within 7 days', () => {
  // Reference date: 2026-02-25 (55 days elapsed, remaining 5 days <= 7 days)
  const lateRefDate = new Date('2026-02-25T00:00:00.000Z')
  const result = calculateMaintenanceStatus(baseSchedule, 10500, lateRefDate)

  assert.equal(result.status, 'DUE SOON')
  assert.equal(result.remainingDays, 5)
})

test('calculates DUE status when remaining km is within 5% of interval', () => {
  // Current mileage: 11950 km (remaining 50 km <= 100 km (5% of 2000))
  const result = calculateMaintenanceStatus(baseSchedule, 11950, refDate)

  assert.equal(result.status, 'DUE')
  assert.equal(result.remainingKm, 50)
})

test('calculates DUE status when remaining days is within 3 days', () => {
  // Reference date: 2026-02-28 (58 days elapsed, remaining 2 days <= 3 days)
  const lateRefDate = new Date('2026-02-28T00:00:00.000Z')
  const result = calculateMaintenanceStatus(baseSchedule, 10500, lateRefDate)

  assert.equal(result.status, 'DUE')
  assert.equal(result.remainingDays, 2)
})

test('calculates OVERDUE status when current mileage reaches or exceeds nextMileage', () => {
  // Current mileage: 12000 km (remaining 0 km)
  const resultZero = calculateMaintenanceStatus(baseSchedule, 12000, refDate)
  assert.equal(resultZero.status, 'OVERDUE')
  assert.equal(resultZero.remainingKm, 0)
  assert.equal(resultZero.progressPercent, 100)

  // Current mileage: 12500 km (remaining -500 km)
  const resultExceeded = calculateMaintenanceStatus(baseSchedule, 12500, refDate)
  assert.equal(resultExceeded.status, 'OVERDUE')
  assert.equal(resultExceeded.remainingKm, -500)
  assert.equal(resultExceeded.progressPercent, 100)
})

test('calculates OVERDUE status when remaining days is zero or negative', () => {
  // Reference date: 2026-03-05 (63 days elapsed, remaining -3 days)
  const overdueDate = new Date('2026-03-05T00:00:00.000Z')
  const result = calculateMaintenanceStatus(baseSchedule, 10500, overdueDate)

  assert.equal(result.status, 'OVERDUE')
  assert.ok(result.remainingDays <= 0)
})
