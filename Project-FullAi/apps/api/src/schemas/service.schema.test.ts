import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  createServiceSchema,
  updateServiceSchema,
} from './service.schema.js'

const validService = {
  serviceType: 'Ganti Oli Mesin',
  serviceDate: '2026-03-20T10:00:00.000Z',
  mileage: 12000,
  cost: 75000,
  notes: 'Menggunakan oli MPX2',
}

test('accepts valid service data', () => {
  const result = createServiceSchema.safeParse(validService)
  assert.equal(result.success, true)
  if (result.success) {
    assert.equal(result.data.serviceType, 'Ganti Oli Mesin')
    assert.equal(result.data.mileage, 12000)
    assert.equal(result.data.cost, 75000)
    assert.equal(result.data.notes, 'Menggunakan oli MPX2')
    assert.ok(result.data.serviceDate instanceof Date)
  }
})

test('accepts valid service data with optional notes omitted or null', () => {
  const resultOmitted = createServiceSchema.safeParse({
    serviceType: 'Servis Ringan',
    serviceDate: '2026-03-20',
    mileage: 15000,
    cost: 50000,
  })
  assert.equal(resultOmitted.success, true)

  const resultNull = createServiceSchema.safeParse({
    serviceType: 'Servis Ringan',
    serviceDate: '2026-03-20',
    mileage: 15000,
    cost: 50000,
    notes: null,
  })
  assert.equal(resultNull.success, true)
})

test('rejects empty or whitespace-only serviceType', () => {
  const result = createServiceSchema.safeParse({
    ...validService,
    serviceType: '   ',
  })
  assert.equal(result.success, false)
})

test('rejects negative mileage in service', () => {
  const result = createServiceSchema.safeParse({
    ...validService,
    mileage: -500,
  })
  assert.equal(result.success, false)
})

test('rejects negative cost in service', () => {
  const result = createServiceSchema.safeParse({
    ...validService,
    cost: -10000,
  })
  assert.equal(result.success, false)
})

test('rejects invalid service date format', () => {
  const result = createServiceSchema.safeParse({
    ...validService,
    serviceDate: 'invalid-date',
  })
  assert.equal(result.success, false)
})

test('accepts valid partial update on service', () => {
  const result = updateServiceSchema.safeParse({
    cost: 85000,
    notes: 'Pembersihan filter udara tambahan',
  })
  assert.equal(result.success, true)
  if (result.success) {
    assert.equal(result.data.cost, 85000)
  }
})
