import assert from 'node:assert/strict'
import { test } from 'node:test'

import { calculateHealthScore } from './healthScore.service.js'
import type { CalculatedMaintenanceSchedule } from './maintenanceCalculation.service.js'

function createMockSchedule(
  id: number,
  maintenanceType: string,
  status: 'UPCOMING' | 'DUE SOON' | 'DUE' | 'OVERDUE'
): CalculatedMaintenanceSchedule {
  return {
    id,
    motorcycleId: 1,
    maintenanceType,
    intervalKm: 2000,
    intervalDays: 60,
    lastServiceMileage: 10000,
    lastServiceDate: new Date(),
    createdAt: new Date(),
    nextMileage: 12000,
    nextDate: new Date().toISOString(),
    remainingKm: 1000,
    remainingDays: 30,
    progressPercent: 50,
    status,
  }
}

test('returns INSUFFICIENT_DATA when schedule list is empty', () => {
  const result = calculateHealthScore([])

  assert.equal(result.score, null)
  assert.equal(result.status, 'INSUFFICIENT_DATA')
  assert.equal(result.details.totalSchedules, 0)
  assert.ok(result.reasons.length > 0)
})

test('returns score 100 and GOOD status when all schedules are UPCOMING', () => {
  const schedules = [
    createMockSchedule(1, 'Oli Mesin', 'UPCOMING'),
    createMockSchedule(2, 'Busi', 'UPCOMING'),
    createMockSchedule(3, 'Kampas Rem', 'UPCOMING'),
  ]

  const result = calculateHealthScore(schedules)

  assert.equal(result.score, 100)
  assert.equal(result.status, 'GOOD')
  assert.equal(result.details.upcomingCount, 3)
  assert.equal(result.details.overdueCount, 0)
  assert.equal(result.details.dueCount, 0)
  assert.equal(result.details.dueSoonCount, 0)
})

test('deducts 10 points for each DUE SOON item and evaluates status', () => {
  // 1 DUE SOON item: 100 - 10 = 90 => GOOD (>= 80)
  const schedules1 = [
    createMockSchedule(1, 'Oli Mesin', 'DUE SOON'),
    createMockSchedule(2, 'Busi', 'UPCOMING'),
  ]
  const result1 = calculateHealthScore(schedules1)
  assert.equal(result1.score, 90)
  assert.equal(result1.status, 'GOOD')

  // 3 DUE SOON items: 100 - 30 = 70 => FAIR (60-79)
  const schedules3 = [
    createMockSchedule(1, 'Oli Mesin', 'DUE SOON'),
    createMockSchedule(2, 'Busi', 'DUE SOON'),
    createMockSchedule(3, 'Kampas Rem', 'DUE SOON'),
  ]
  const result3 = calculateHealthScore(schedules3)
  assert.equal(result3.score, 70)
  assert.equal(result3.status, 'FAIR')
})

test('deducts 25 points for each OVERDUE or DUE item and evaluates status', () => {
  // 1 OVERDUE item: 100 - 25 = 75 => FAIR (60-79)
  const schedulesOverdue = [
    createMockSchedule(1, 'Oli Mesin', 'OVERDUE'),
    createMockSchedule(2, 'Busi', 'UPCOMING'),
  ]
  const resultOverdue = calculateHealthScore(schedulesOverdue)
  assert.equal(resultOverdue.score, 75)
  assert.equal(resultOverdue.status, 'FAIR')

  // 2 OVERDUE items: 100 - 50 = 50 => NEEDS_ATTENTION (< 60)
  const schedulesMultiple = [
    createMockSchedule(1, 'Oli Mesin', 'OVERDUE'),
    createMockSchedule(2, 'CVT', 'OVERDUE'),
  ]
  const resultMultiple = calculateHealthScore(schedulesMultiple)
  assert.equal(resultMultiple.score, 50)
  assert.equal(resultMultiple.status, 'NEEDS_ATTENTION')
})

test('clamps score to 0 when deductions exceed 100', () => {
  const schedules5Overdue = [
    createMockSchedule(1, 'Oli Mesin', 'OVERDUE'),
    createMockSchedule(2, 'Busi', 'OVERDUE'),
    createMockSchedule(3, 'Kampas Rem', 'OVERDUE'),
    createMockSchedule(4, 'Air Radiator', 'OVERDUE'),
    createMockSchedule(5, 'Filter Udara', 'OVERDUE'),
  ]

  // 100 - (5 * 25) = -25 => clamped to 0
  const result = calculateHealthScore(schedules5Overdue)
  assert.equal(result.score, 0)
  assert.equal(result.status, 'NEEDS_ATTENTION')
})
