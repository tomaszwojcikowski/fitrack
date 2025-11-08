import { describe, it, expect } from 'vitest'
import { EXERCISES } from '../exercises.js'

describe('EXERCISES Database', () => {
  it('should have exercises defined', () => {
    expect(EXERCISES).toBeDefined()
    expect(Array.isArray(EXERCISES)).toBe(true)
  })

  it('should have at least 100 exercises', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(100)
  })

  it('should have valid exercise structure', () => {
    EXERCISES.forEach(exercise => {
      expect(exercise).toHaveProperty('name')
      expect(exercise).toHaveProperty('category')
      expect(exercise).toHaveProperty('equipment')
      expect(typeof exercise.name).toBe('string')
      expect(typeof exercise.category).toBe('string')
      expect(typeof exercise.equipment).toBe('string')
    })
  })

  it('should be sorted alphabetically by name', () => {
    for (let i = 1; i < EXERCISES.length; i++) {
      expect(EXERCISES[i].name.localeCompare(EXERCISES[i - 1].name)).toBeGreaterThanOrEqual(0)
    }
  })

  it('should have mostly unique exercise names', () => {
    const names = EXERCISES.map(ex => ex.name)
    const uniqueNames = new Set(names)
    // Allow a small number of duplicates (e.g., "Dips" appears in both Chest and Triceps)
    expect(uniqueNames.size).toBeGreaterThan(names.length * 0.95)
  })

  it('should include common categories', () => {
    const categories = new Set(EXERCISES.map(ex => ex.category))
    expect(categories.has('Chest')).toBe(true)
    expect(categories.has('Back')).toBe(true)
    expect(categories.has('Shoulders')).toBe(true)
    expect(categories.has('Biceps')).toBe(true)
    expect(categories.has('Triceps')).toBe(true)
    expect(categories.has('Quads')).toBe(true)
    expect(categories.has('Core')).toBe(true)
  })

  it('should include common equipment types', () => {
    const equipment = new Set(EXERCISES.map(ex => ex.equipment))
    expect(equipment.has('Barbell')).toBe(true)
    expect(equipment.has('Dumbbell')).toBe(true)
    expect(equipment.has('Bodyweight')).toBe(true)
    expect(equipment.has('Cable')).toBe(true)
    expect(equipment.has('Machine')).toBe(true)
  })
})
