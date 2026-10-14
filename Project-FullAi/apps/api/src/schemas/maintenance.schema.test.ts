import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
} from './maintenance.schema.js'

const validMaintenance = {
  maintenanceType: 'Ganti Oli Mesin',
  intervalKm: 2000,
  intervalDays: 60,
  lastServiceMileage: 10000,
  lastServiceDate: '2026-02-15T08:00:00.000Z',
}

test('accepts valid maintenance schedule data', () => {
  const result = createMaintenanceSchema.safeParse(validMaintenance)
  assert.equal(result.success, true)
  if (result.success) {
    assert.equal(result.data.maintenanceType, 'Ganti Oli Mesin')
    assert.equal(result.data.intervalKm, 2000)
    assert.equal(result.data.intervalDays, 60)
    assert.equal(result.data.lastServiceMileage, 10000)
    assert.ok(result.data.lastServiceDate instanceof Date)
  }
})

test('rejects empty or whitespace-only maintenanceType', () => {
  const result = createMaintenanceSchema.safeParse({
    ...validMaintenance,
    maintenanceType: '   ',
  })
  assert.equal(result.success, false)
})

test('rejects zero or negative intervalKm', () => {
  const resultZero = createMaintenanceSchema.safeParse({
    ...validMaintenance,
    intervalKm: 0,
  })
  assert.equal(resultZero.success, false)

  const resultNegative = createMaintenanceSchema.safeParse({
    ...validMaintenance,
    intervalKm: -2000,
  })
  assert.equal(resultNegative.success, false)
})

test('rejects zero or negative intervalDays', () => {
  const resultZero = createMaintenanceSchema.safeParse({
    ...validMaintenance,
    intervalDays: 0,
  })
  assert.equal(resultZero.success, false)

  const resultNegative = createMaintenanceSchema.safeParse({
    ...validMaintenance,
    intervalDays: -30,
  })
  assert.equal(resultNegative.success, false)
})

test('rejects negative lastServiceMileage', () => {
  const result = createMaintenanceSchema.safeParse({
    ...validMaintenance,
    lastServiceMileage: -100,
  })
  assert.equal(result.success, false)
})

test('rejects invalid lastServiceDate format', () => {
  const result = createMaintenanceSchema.safeParse({
    ...validMaintenance,
    lastServiceDate: 'not-a-date',
  })
  assert.equal(result.success, false)
})

test('accepts valid partial update on maintenance schedule', () => {
  const result = updateMaintenanceSchema.safeParse({
    intervalKm: 3000,
    intervalDays: 90,
  })
  assert.equal(result.success, true)
  if (result.success) {
    assert.equal(result.data.intervalKm, 3000)
    assert.equal(result.data.intervalDays, 90)
  }
})
