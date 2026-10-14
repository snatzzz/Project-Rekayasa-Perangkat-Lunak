import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  createMotorcycleSchema,
  updateMotorcycleSchema,
} from './motorcycle.schema.js'

const validMotorcycle = {
  brand: 'Honda',
  model: 'Vario 160',
  year: 2023,
  currentMileage: 18500,
}

test('accepts valid motorcycle data', () => {
  const result = createMotorcycleSchema.safeParse(validMotorcycle)

  assert.equal(result.success, true)
})

test('rejects an empty motorcycle brand', () => {
  const result = createMotorcycleSchema.safeParse({
    ...validMotorcycle,
    brand: '   ',
  })

  assert.equal(result.success, false)
})

test('rejects negative mileage', () => {
  const result = createMotorcycleSchema.safeParse({
    ...validMotorcycle,
    currentMileage: -1,
  })

  assert.equal(result.success, false)
})

test('rejects empty mileage instead of treating it as zero', () => {
  const result = createMotorcycleSchema.safeParse({
    ...validMotorcycle,
    currentMileage: '',
  })

  assert.equal(result.success, false)
})

test('rejects updates with no fields', () => {
  const result = updateMotorcycleSchema.safeParse({})

  assert.equal(result.success, false)
})

test('accepts a valid partial update', () => {
  const result = updateMotorcycleSchema.safeParse({
    currentMileage: 19000,
  })

  assert.equal(result.success, true)
})