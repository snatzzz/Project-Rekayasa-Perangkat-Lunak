import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getRecommendations } from './recommendation.service.js'
import { recommendationSchema } from '../schemas/recommendation.schema.js'

test('validates complaint input schema requiring minimum 3 characters', () => {
  const resultValid = recommendationSchema.safeParse({ complaint: 'rem blong' })
  assert.equal(resultValid.success, true)

  const resultShort = recommendationSchema.safeParse({ complaint: 'hi' })
  assert.equal(resultShort.success, false)

  const resultEmpty = recommendationSchema.safeParse({ complaint: '   ' })
  assert.equal(resultEmpty.success, false)
})

test('matches hard_start rule keywords and returns TINGGI urgency', () => {
  const result = getRecommendations('motor susah starter pagi hari aki ngedrop')

  assert.equal(result.isRecognized, true)
  assert.equal(result.matchedTopic, 'Motor Susah Dinyalakan / Starter Berat')
  assert.equal(result.urgency, 'TINGGI')
  assert.ok(result.recommendations.length > 0)
  assert.ok(result.disclaimer.length > 0)
})

test('matches vibration rule keywords and returns SEDANG urgency', () => {
  const result = getRecommendations('motor bergetar dan gredek saat tarikan awal')

  assert.equal(result.isRecognized, true)
  assert.equal(result.matchedTopic, 'Motor Bergetar / Gredek di Kecepatan Rendah')
  assert.equal(result.urgency, 'SEDANG')
  assert.ok(result.recommendations.some((r) => r.toLowerCase().includes('cvt')))
})

test('matches brake_issue rule keywords', () => {
  const result = getRecommendations('rem belakang berdecit dan kurang pakem')

  assert.equal(result.isRecognized, true)
  assert.equal(result.matchedTopic, 'Rem Kurang Pakem / Berdecit')
  assert.equal(result.urgency, 'TINGGI')
  assert.ok(result.recommendations.some((r) => r.toLowerCase().includes('kampas rem')))
})

test('matches overheating rule keywords', () => {
  const result = getRecommendations('suhu radiator panas dan mendidih coolant bocor')

  assert.equal(result.isRecognized, true)
  assert.equal(result.matchedTopic, 'Mesin Cepat Panas / Indikator Overheat Menyala')
  assert.equal(result.urgency, 'TINGGI')
  assert.ok(result.recommendations.some((r) => r.toLowerCase().includes('radiator')))
})

test('returns safe fallback recommendations for unrecognized complaints', () => {
  const result = getRecommendations('cat body motor lecet tergores kunci')

  assert.equal(result.isRecognized, false)
  assert.equal(result.matchedTopic, null)
  assert.equal(result.urgency, null)
  assert.ok(result.recommendations.length > 0)
  assert.ok(result.recommendations[0].includes('belum dapat dikenali'))
})
