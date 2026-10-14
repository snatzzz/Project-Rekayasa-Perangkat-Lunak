import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createMileageSchema } from './mileage.schema.js'

test('accepts valid mileage as number', () => {
  const result = createMileageSchema.safeParse({
    mileage: 15000,
  })

  assert.equal(result.success, true)
  if (result.success) {
    assert.equal(result.data.mileage, 15000)
    assert.equal(result.data.recordedAt, undefined)
  }
})

test('accepts valid numeric string and coerces it to number', () => {
  const result = createMileageSchema.safeParse({
    mileage: '25000',
  })

  assert.equal(result.success, true)
  if (result.success) {
    assert.equal(result.data.mileage, 25000)
  }
})

test('rejects negative mileage', () => {
  const result = createMileageSchema.safeParse({
    mileage: -100,
  })

  assert.equal(result.success, false)
})

test('rejects empty mileage string instead of treating it as zero', () => {
  const result = createMileageSchema.safeParse({
    mileage: '',
  })

  assert.equal(result.success, false)
})

test('rejects whitespace-only mileage string', () => {
  const result = createMileageSchema.safeParse({
    mileage: '   ',
  })

  assert.equal(result.success, false)
})

test('rejects float / decimal mileage', () => {
  const result = createMileageSchema.safeParse({
    mileage: 1200.5,
  })

  assert.equal(result.success, false)
})

test('rejects invalid types such as boolean, null, or array', () => {
  const resultBool = createMileageSchema.safeParse({
    mileage: true,
  })
  assert.equal(resultBool.success, false)

  const resultNull = createMileageSchema.safeParse({
    mileage: null,
  })
  assert.equal(resultNull.success, false)

  const resultArray = createMileageSchema.safeParse({
    mileage: [12000],
  })
  assert.equal(resultArray.success, false)
})

test('accepts valid optional recordedAt date string', () => {
  const dateStr = '2026-03-15T10:00:00.000Z'
  const result = createMileageSchema.safeParse({
    mileage: 15000,
    recordedAt: dateStr,
  })

  assert.equal(result.success, true)
  if (result.success) {
    assert.ok(result.data.recordedAt instanceof Date)
    assert.equal(result.data.recordedAt.toISOString(), dateStr)
  }
})

test('handles missing, null, or empty recordedAt as undefined', () => {
  const resultEmpty = createMileageSchema.safeParse({
    mileage: 15000,
    recordedAt: '',
  })
  assert.equal(resultEmpty.success, true)
  if (resultEmpty.success) {
    assert.equal(resultEmpty.data.recordedAt, undefined)
  }

  const resultNull = createMileageSchema.safeParse({
    mileage: 15000,
    recordedAt: null,
  })
  assert.equal(resultNull.success, true)
  if (resultNull.success) {
    assert.equal(resultNull.data.recordedAt, undefined)
  }
})

test('rejects invalid recordedAt date format', () => {
  const result = createMileageSchema.safeParse({
    mileage: 15000,
    recordedAt: 'invalid-date-string',
  })

  assert.equal(result.success, false)
})
