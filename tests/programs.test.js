import { describe, it, expect, beforeEach } from 'vitest'
import { FiTrackApp } from '../app.js'
import { WORKOUT_PROGRAMS } from '../programs.js'

describe('Workout Programs', () => {
  let app

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    app = new FiTrackApp()
  })

  describe('Program Data Structure', () => {
    it('should have 4 predefined programs', () => {
      expect(WORKOUT_PROGRAMS).toHaveLength(4)
    })

    it('should have properly structured programs', () => {
      WORKOUT_PROGRAMS.forEach(program => {
        expect(program).toHaveProperty('id')
        expect(program).toHaveProperty('name')
        expect(program).toHaveProperty('description')
        expect(program).toHaveProperty('duration')
        expect(program).toHaveProperty('daysPerWeek')
        expect(program).toHaveProperty('difficulty')
        expect(program).toHaveProperty('goal')
        expect(program).toHaveProperty('weeks')
        expect(program.weeks).toHaveLength(4)
      })
    })

    it('should have valid weeks and days structure', () => {
      const program = WORKOUT_PROGRAMS[0]
      program.weeks.forEach((week, index) => {
        expect(week.week).toBe(index + 1)
        expect(week.days).toBeDefined()
        expect(week.days.length).toBeGreaterThan(0)
        
        week.days.forEach((day, dayIndex) => {
          expect(day.day).toBe(dayIndex + 1)
          expect(day.name).toBeDefined()
          expect(day.exercises).toBeDefined()
          expect(day.exercises.length).toBeGreaterThan(0)
        })
      })
    })

    it('should have valid exercise structure', () => {
      const program = WORKOUT_PROGRAMS[0]
      const exercise = program.weeks[0].days[0].exercises[0]
      
      expect(exercise).toHaveProperty('name')
      expect(exercise).toHaveProperty('sets')
      expect(exercise).toHaveProperty('restSeconds')
      expect(exercise.sets).toBeGreaterThan(0)
      expect(exercise.restSeconds).toBeGreaterThan(0)
    })
  })

  describe('Program Management', () => {
    it('should start with no active program', () => {
      expect(app.activeProgram).toBeNull()
    })

    it('should start a program', () => {
      app.startProgram('beginner-strength')
      
      expect(app.activeProgram).toBeDefined()
      expect(app.activeProgram.programId).toBe('beginner-strength')
      expect(app.activeProgram.currentWeek).toBe(1)
      expect(app.activeProgram.currentDay).toBe(1)
      expect(app.activeProgram.startedAt).toBeDefined()
      expect(app.activeProgram.completedDays).toEqual([])
    })

    it('should load program workout when starting', async () => {
      await app.startProgram('beginner-strength')
      
      expect(app.currentWorkout.length).toBeGreaterThan(0)
      // First day of Beginner Strength Builder has 5 exercises
      expect(app.currentWorkout.length).toBe(5)
      expect(app.currentWorkout[0].name).toBe('Bench Press')
    })

    it('should create correct sets for exercises', async () => {
      await app.startProgram('beginner-strength')
      
      const firstExercise = app.currentWorkout[0]
      expect(firstExercise.sets).toHaveLength(3) // Week 1 Day 1 has 3 sets
      
      // Check sets are properly structured
      firstExercise.sets.forEach(set => {
        expect(set).toHaveProperty('reps')
        expect(set).toHaveProperty('weight')
        expect(set).toHaveProperty('completed')
        expect(set.completed).toBe(false)
      })
    })

    it('should get program by id', () => {
      const program = app.getProgramById('beginner-strength')
      expect(program).toBeDefined()
      expect(program.name).toBe('Beginner Strength Builder')
    })

    it('should return undefined for invalid program id', () => {
      const program = app.getProgramById('non-existent')
      expect(program).toBeUndefined()
    })
  })

  describe('Program Navigation', () => {
    beforeEach(() => {
      app.startProgram('beginner-strength')
    })

    it('should navigate to next day', () => {
      app.navigateProgram(1)
      
      expect(app.activeProgram.currentWeek).toBe(1)
      expect(app.activeProgram.currentDay).toBe(2)
      expect(app.currentWorkout[0].name).toBe('Squat') // Day 2 starts with Squat
    })

    it('should navigate to previous day', () => {
      app.navigateProgram(1) // Go to day 2
      app.navigateProgram(-1) // Go back to day 1
      
      expect(app.activeProgram.currentWeek).toBe(1)
      expect(app.activeProgram.currentDay).toBe(1)
      expect(app.currentWorkout[0].name).toBe('Bench Press')
    })

    it('should move to next week when reaching end of current week', () => {
      // Beginner Strength has 3 days per week
      app.navigateProgram(1) // Day 2
      app.navigateProgram(1) // Day 3
      app.navigateProgram(1) // Should move to Week 2, Day 1
      
      expect(app.activeProgram.currentWeek).toBe(2)
      expect(app.activeProgram.currentDay).toBe(1)
    })

    it('should move to previous week when at first day', () => {
      app.navigateProgram(1) // Week 1, Day 2
      app.navigateProgram(1) // Week 1, Day 3
      app.navigateProgram(1) // Week 2, Day 1
      app.navigateProgram(-1) // Should move back to Week 1, Day 3
      
      expect(app.activeProgram.currentWeek).toBe(1)
      expect(app.activeProgram.currentDay).toBe(3)
    })

    it('should not navigate before first day', () => {
      const initialWeek = app.activeProgram.currentWeek
      const initialDay = app.activeProgram.currentDay
      
      app.navigateProgram(-1) // Try to go before start
      
      expect(app.activeProgram.currentWeek).toBe(initialWeek)
      expect(app.activeProgram.currentDay).toBe(initialDay)
    })

    it('should mark days as completed when navigating forward', () => {
      app.navigateProgram(1)
      
      expect(app.activeProgram.completedDays).toContain('w1d1')
    })
  })

  describe('Program Persistence', () => {
    it('should save active program to localStorage', async () => {
      await app.startProgram('beginner-strength')
      app.saveData()
      
      const saved = localStorage.getItem('fitrack_data')
      const data = JSON.parse(saved)
      
      expect(data.activeProgram).toBeDefined()
      expect(data.activeProgram.programId).toBe('beginner-strength')
    })

    it('should load active program from localStorage', () => {
      const testData = {
        history: [],
        activeProgram: {
          programId: 'beginner-strength',
          currentWeek: 2,
          currentDay: 3,
          startedAt: new Date().toISOString(),
          completedDays: ['w1d1', 'w1d2']
        }
      }
      localStorage.setItem('fitrack_data', JSON.stringify(testData))
      
      const newApp = new FiTrackApp()
      
      expect(newApp.activeProgram).toBeDefined()
      expect(newApp.activeProgram.programId).toBe('beginner-strength')
      expect(newApp.activeProgram.currentWeek).toBe(2)
      expect(newApp.activeProgram.currentDay).toBe(3)
      expect(newApp.activeProgram.completedDays).toHaveLength(2)
    })

    it('should clear program when quitting', async () => {
      app.startProgram('beginner-strength')
      
      // Mock the confirmation dialog to return true
      app.showConfirm = async () => true
      
      await app.quitProgram()
      
      expect(app.activeProgram).toBeNull()
      expect(app.currentWorkout).toEqual([])
    })

    it('should not clear program when canceling quit', async () => {
      app.startProgram('beginner-strength')
      
      // Mock the confirmation dialog to return false
      app.showConfirm = async () => false
      
      await app.quitProgram()
      
      expect(app.activeProgram).toBeDefined()
      expect(app.currentWorkout.length).toBeGreaterThan(0)
    })
  })

  describe('Program Integration', () => {
    it('should have all programs available in app', () => {
      expect(app.programs).toEqual(WORKOUT_PROGRAMS)
      expect(app.programs).toHaveLength(4)
    })

    it('should load different programs correctly', async () => {
      await app.startProgram('hypertrophy-gains')
      expect(app.currentWorkout.length).toBe(6) // Hypertrophy Day 1 has 6 exercises
      expect(app.currentWorkout[0].name).toBe('Bench Press')
      
      // Mock the confirmation dialog for switching programs
      app.showConfirm = async () => true
      
      // Switch to different program
      await app.startProgram('powerlifting-peak')
      expect(app.currentWorkout.length).toBe(5) // Powerlifting Day 1 has 5 exercises
      expect(app.currentWorkout[0].name).toBe('Squat')
    })

    it('should handle time-based exercises', async () => {
      await app.startProgram('hypertrophy-gains')
      app.navigateProgram(1) // Go to day 2
      app.navigateProgram(1) // Go to day 3
      app.navigateProgram(1) // Go to day 4 (Shoulders & Abs)
      
      // Find Plank exercise (has time instead of reps)
      const plankExercise = app.currentWorkout.find(ex => ex.name === 'Plank')
      expect(plankExercise).toBeDefined()
      expect(plankExercise.sets[0].useTime).toBe(true)
      expect(plankExercise.sets[0].time).toBe('60s')
    })
  })
})
