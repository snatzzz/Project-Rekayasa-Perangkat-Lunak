import assert from 'node:assert/strict'
import { test } from 'node:test'
import { recommendationSchema } from './recommendation.schema.js'

test('accepts valid complaint', () => {
  const result = recommendationSchema.safeParse({
    complaint: 'motor terasa bergetar parah',
  })
  assert.equal(result.success, true)
})

test('rejects complaint shorter than 3 characters after trimming', () => {
  const result = recommendationSchema.safeParse({
    complaint: '   ab   ',
  })
  assert.equal(result.success, false)
})

test('rejects complaint longer than 500 characters', () => {
  const longText = 'a'.repeat(501)
  const result = recommendationSchema.safeParse({
    complaint: longText,
  })
  assert.equal(result.success, false)
})
