import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FiTrackApp } from '../app.js'
import { EXERCISES } from '../exercises.js'

describe('FiTrackApp', () => {
  let app

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Create a fresh instance for each test
    app = new FiTrackApp()
  })

  describe('Initialization', () => {
    it('should initialize with empty workout', () => {
      expect(app.currentWorkout).toEqual([])
    })

    it('should initialize with empty history', () => {
      expect(app.workoutHistory).toEqual([])
    })

    it('should have rest timer at 0', () => {
      expect(app.restTimerSeconds).toBe(0)
    })
  })

  describe('Data Management', () => {
    it('should save data to localStorage', () => {
      app.workoutHistory = [
        {
          date: '2024-01-01',
          exercises: [{ name: 'Bench Press', sets: [] }]
        }
      ]
      app.saveData()
      
      const saved = localStorage.getItem('fitrack_data')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved)
      expect(parsed.history).toHaveLength(1)
    })

    it('should load data from localStorage', () => {
      const testData = {
        history: [
          {
            date: '2024-01-01',
            exercises: [{ name: 'Squat', sets: [] }]
          }
        ]
      }
      localStorage.setItem('fitrack_data', JSON.stringify(testData))
      
      const newApp = new FiTrackApp()
      expect(newApp.workoutHistory).toHaveLength(1)
      expect(newApp.workoutHistory[0].exercises[0].name).toBe('Squat')
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('fitrack_data', 'invalid json')
      const newApp = new FiTrackApp()
      expect(newApp.workoutHistory).toEqual([])
    })
  })

  describe('Exercise Management', () => {
    it('should add exercise to workout', () => {
      const exercise = EXERCISES[0]
      app.addExercise(exercise)
      
      expect(app.currentWorkout).toHaveLength(1)
      expect(app.currentWorkout[0].name).toBe(exercise.name)
      expect(app.currentWorkout[0].sets).toHaveLength(1)
    })

    it('should not add duplicate exercises', () => {
      const exercise = EXERCISES[0]
      app.addExercise(exercise)
      app.addExercise(exercise)
      
      expect(app.currentWorkout).toHaveLength(1)
    })

    it('should remove exercise from workout', async () => {
      app.addExercise(EXERCISES[0])
      app.addExercise(EXERCISES[1])
      
      // Mock showConfirm to auto-confirm
      app.showConfirm = async () => true
      
      await app.removeExercise(0)
      expect(app.currentWorkout).toHaveLength(1)
      expect(app.currentWorkout[0].name).toBe(EXERCISES[1].name)
    })

    it('should create empty set with correct structure', () => {
      const set = app.createEmptySet()
      expect(set).toHaveProperty('reps')
      expect(set).toHaveProperty('weight')
      expect(set).toHaveProperty('time')
      expect(set).toHaveProperty('completed')
      expect(set.completed).toBe(false)
    })

    it('should add set to exercise', () => {
      app.addExercise(EXERCISES[0])
      app.addSet(0)
      
      expect(app.currentWorkout[0].sets).toHaveLength(2)
    })
  })

  describe('Set Operations', () => {
    beforeEach(() => {
      app.addExercise(EXERCISES[0])
    })

    it('should update set values', () => {
      app.updateSet(0, 0, 'reps', '10')
      expect(app.currentWorkout[0].sets[0].reps).toBe('10')
      
      app.updateSet(0, 0, 'weight', '100')
      expect(app.currentWorkout[0].sets[0].weight).toBe('100')
    })

    it('should toggle set completion', () => {
      expect(app.currentWorkout[0].sets[0].completed).toBe(false)
      
      app.toggleSetComplete(0, 0)
      expect(app.currentWorkout[0].sets[0].completed).toBe(true)
      
      app.toggleSetComplete(0, 0)
      expect(app.currentWorkout[0].sets[0].completed).toBe(false)
    })

    it('should toggle set input type', () => {
      const initialType = app.currentWorkout[0].sets[0].useTime
      app.toggleSetInputType(0, 0)
      expect(app.currentWorkout[0].sets[0].useTime).toBe(!initialType)
    })

    it('should start rest timer when completing a set', () => {
      app.toggleSetComplete(0, 0)
      expect(app.restTimerSeconds).toBe(90)
    })
  })

  describe('Rest Timer', () => {
    it('should start rest timer with specified seconds', () => {
      app.startRestTimer(60)
      expect(app.restTimerSeconds).toBe(60)
      expect(app.restTimerInterval).toBeTruthy()
    })

    it('should stop rest timer', () => {
      app.startRestTimer(60)
      app.stopRestTimer()
      expect(app.restTimerInterval).toBe(null)
    })

    it('should add time to rest timer', () => {
      app.startRestTimer(60)
      app.addRestTime(30)
      expect(app.restTimerSeconds).toBe(90)
    })

    it('should update timer display correctly', () => {
      app.restTimerSeconds = 125
      app.updateTimerDisplay()
      const display = document.getElementById('timerDisplay')
      expect(display.textContent).toBe('02:05')
    })

    it('should format timer display with leading zeros', () => {
      app.restTimerSeconds = 9
      app.updateTimerDisplay()
      const display = document.getElementById('timerDisplay')
      expect(display.textContent).toBe('00:09')
    })
  })

  describe('Search and Filtering', () => {
    it('should filter exercises by name', () => {
      const query = 'bench'
      const filtered = EXERCISES.filter(ex =>
        ex.name.toLowerCase().includes(query.toLowerCase())
      )
      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered.every(ex => 
        ex.name.toLowerCase().includes(query)
      )).toBe(true)
    })

    it('should filter exercises by category', () => {
      const query = 'chest'
      const filtered = EXERCISES.filter(ex =>
        ex.category.toLowerCase().includes(query.toLowerCase())
      )
      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered.every(ex => 
        ex.category.toLowerCase().includes(query)
      )).toBe(true)
    })

    it('should filter exercises by equipment', () => {
      const query = 'dumbbell'
      const filtered = EXERCISES.filter(ex =>
        ex.equipment.toLowerCase().includes(query.toLowerCase())
      )
      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered.every(ex => 
        ex.equipment.toLowerCase().includes(query)
      )).toBe(true)
    })
  })

  describe('Workout History', () => {
    it('should save current workout to history', () => {
      // Set date before adding exercises to avoid duplicate saves
      const dateInput = document.getElementById('workoutDate')
      dateInput.value = '2024-01-01'
      
      // Clear any existing history
      app.workoutHistory = []
      
      app.addExercise(EXERCISES[0])
      app.currentWorkout[0].sets[0].reps = '10'
      app.currentWorkout[0].sets[0].weight = '100'
      
      // The workout is automatically saved when we add/update exercises
      // Just verify it was saved correctly
      expect(app.workoutHistory).toHaveLength(1)
      expect(app.workoutHistory[0].date).toBe('2024-01-01')
      expect(app.workoutHistory[0].exercises).toHaveLength(1)
    })

    it('should not save empty sets to history', () => {
      app.addExercise(EXERCISES[0])
      app.addSet(0) // Add empty set
      
      const dateInput = document.getElementById('workoutDate')
      dateInput.value = '2024-01-01'
      
      app.saveCurrentWorkout()
      
      // Should only have 1 empty set, which shouldn't be saved
      expect(app.workoutHistory[0].exercises[0].sets).toHaveLength(0)
    })

    it('should update existing workout for same date', () => {
      const dateInput = document.getElementById('workoutDate')
      dateInput.value = '2024-01-01'
      
      app.addExercise(EXERCISES[0])
      app.currentWorkout[0].sets[0].reps = '10'
      app.saveCurrentWorkout()
      
      app.addExercise(EXERCISES[1])
      app.currentWorkout[1].sets[0].reps = '12'
      app.saveCurrentWorkout()
      
      expect(app.workoutHistory).toHaveLength(1)
      expect(app.workoutHistory[0].exercises).toHaveLength(2)
    })

    it('should finish workout and optionally clear', async () => {
      app.addExercise(EXERCISES[0])
      // Mock showConfirm to return true (user wants to clear)
      app.showConfirm = async () => true
      
      await app.finishWorkout()
      
      expect(app.currentWorkout).toHaveLength(0)
      expect(app.workoutHistory).toHaveLength(1)
    })

    it('should not clear workout if user declines', () => {
      app.addExercise(EXERCISES[0])
      global.confirm = vi.fn(() => false)
      global.alert = vi.fn()
      
      app.finishWorkout()
      
      expect(app.currentWorkout).toHaveLength(1)
    })
  })

  describe('UI State Management', () => {
    it('should update quick rest button visibility', () => {
      app.updateQuickRestButton()
      const btn = document.getElementById('quickRestBtn')
      const container = document.getElementById('finishWorkoutContainer')
      expect(btn.classList.contains('hidden')).toBe(true)
      expect(container.classList.contains('hidden')).toBe(true)
      
      app.addExercise(EXERCISES[0])
      app.updateQuickRestButton()
      expect(btn.classList.contains('hidden')).toBe(false)
      expect(container.classList.contains('hidden')).toBe(false)
    })

    it('should set today date on initialization', () => {
      const dateInput = document.getElementById('workoutDate')
      const today = new Date().toISOString().split('T')[0]
      expect(dateInput.value).toBe(today)
    })
  })

  describe('Navigation', () => {
    it('should switch to history view', () => {
      const workoutView = document.getElementById('workoutView')
      const historyView = document.getElementById('historyView')
      
      app.showHistory()
      
      expect(workoutView.classList.contains('active')).toBe(false)
      expect(historyView.classList.contains('active')).toBe(true)
    })

    it('should switch back to workout view', () => {
      const workoutView = document.getElementById('workoutView')
      const historyView = document.getElementById('historyView')
      
      app.showHistory()
      app.showWorkout()
      
      expect(workoutView.classList.contains('active')).toBe(true)
      expect(historyView.classList.contains('active')).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle removing non-existent exercise', async () => {
      // Mock showConfirm
      app.showConfirm = async () => true
      
      // Should not throw even with empty workout
      await expect(app.removeExercise(0)).resolves.not.toThrow()
    })

    it('should handle adding set to non-existent exercise', () => {
      expect(() => app.addSet(999)).toThrow()
    })

    it('should handle empty workout finish', async () => {
      // Mock showToast to track calls
      const showToastSpy = vi.fn()
      app.showToast = showToastSpy
      
      await app.finishWorkout()
      expect(showToastSpy).toHaveBeenCalledWith('No exercises to save!', 'warning')
    })

    it('should handle timer sound play failure', async () => {
      app.timerSound = {
        play: vi.fn(() => Promise.reject(new Error('Play failed')))
      }
      // Should not throw synchronously
      expect(() => app.playTimerSound()).not.toThrow()
      // Wait a bit for promise to settle
      await new Promise(resolve => setTimeout(resolve, 10))
    })
  })

  describe('Set Management', () => {
    beforeEach(() => {
      // Add an exercise with multiple sets
      app.currentWorkout = [
        {
          name: 'Bench Press',
          category: 'Chest',
          equipment: 'Barbell',
          sets: [
            { reps: '10', weight: '100', time: '', useTime: false, completed: false },
            { reps: '10', weight: '100', time: '', useTime: false, completed: false },
            { reps: '10', weight: '100', time: '', useTime: false, completed: false }
          ]
        }
      ]
    })

    it('should swap sets up', () => {
      const firstSet = app.currentWorkout[0].sets[0]
      const secondSet = app.currentWorkout[0].sets[1]
      
      app.swapSet(0, 0, 1)
      
      expect(app.currentWorkout[0].sets[0]).toBe(secondSet)
      expect(app.currentWorkout[0].sets[1]).toBe(firstSet)
    })

    it('should swap sets down', () => {
      const secondSet = app.currentWorkout[0].sets[1]
      const thirdSet = app.currentWorkout[0].sets[2]
      
      app.swapSet(0, 1, 2)
      
      expect(app.currentWorkout[0].sets[1]).toBe(thirdSet)
      expect(app.currentWorkout[0].sets[2]).toBe(secondSet)
    })

    it('should not swap invalid set indices', () => {
      const originalSets = [...app.currentWorkout[0].sets]
      
      app.swapSet(0, -1, 0)
      expect(app.currentWorkout[0].sets).toEqual(originalSets)
      
      app.swapSet(0, 0, 999)
      expect(app.currentWorkout[0].sets).toEqual(originalSets)
    })

    it('should delete a set', async () => {
      app.showConfirm = vi.fn(() => Promise.resolve(true))
      
      await app.deleteSet(0, 1)
      
      expect(app.currentWorkout[0].sets).toHaveLength(2)
    })

    it('should not delete set if user cancels', async () => {
      app.showConfirm = vi.fn(() => Promise.resolve(false))
      
      await app.deleteSet(0, 1)
      
      expect(app.currentWorkout[0].sets).toHaveLength(3)
    })

    it('should keep at least one set after deletion', async () => {
      app.currentWorkout[0].sets = [{ reps: '10', weight: '100', time: '', useTime: false, completed: false }]
      app.showConfirm = vi.fn(() => Promise.resolve(true))
      
      await app.deleteSet(0, 0)
      
      expect(app.currentWorkout[0].sets).toHaveLength(1)
    })

    it('should delete empty set without confirmation', async () => {
      app.currentWorkout[0].sets[1] = { reps: '', weight: '', time: '', useTime: false, completed: false }
      app.showConfirm = vi.fn()
      
      await app.deleteSet(0, 1)
      
      expect(app.showConfirm).not.toHaveBeenCalled()
      expect(app.currentWorkout[0].sets).toHaveLength(2)
    })
  })

  describe('URL Navigation', () => {
    it('should update hash when showing history', () => {
      app.showHistory()
      expect(window.location.hash).toBe('#history')
    })

    it('should update hash when showing programs', () => {
      app.showPrograms()
      expect(window.location.hash).toBe('#programs')
    })

    it('should update hash when showing workout', () => {
      app.showWorkout()
      expect(window.location.hash).toBe('#workout')
    })

    it('should handle initial view based on hash', () => {
      window.location.hash = '#history'
      const newApp = new FiTrackApp()
      
      expect(document.getElementById('historyView').classList.contains('active')).toBe(true)
      expect(document.getElementById('workoutView').classList.contains('active')).toBe(false)
    })

    it('should default to workout view with no hash', () => {
      window.location.hash = ''
      const newApp = new FiTrackApp()
      
      expect(document.getElementById('workoutView').classList.contains('active')).toBe(true)
    })
  })

  describe('Time Input Parsing', () => {
    it('should strip "s" suffix from time values', () => {
      const program = app.getProgramById('hypertrophy-gains')
      app.activeProgram = {
        programId: 'hypertrophy-gains',
        currentWeek: 1,
        currentDay: 4
      }
      
      app.loadProgramWorkout()
      
      // Find Plank exercise which has time: '60s'
      const plankExercise = app.currentWorkout.find(ex => ex.name === 'Plank')
      if (plankExercise) {
        expect(plankExercise.sets[0].time).toBe('60')
        expect(plankExercise.sets[0].useTime).toBe(true)
      }
    })

    it('should handle time values without suffix', () => {
      const program = app.getProgramById('beginner-strength')
      app.activeProgram = {
        programId: 'beginner-strength',
        currentWeek: 1,
        currentDay: 1
      }
      
      app.loadProgramWorkout()
      
      // Exercises should load normally
      expect(app.currentWorkout.length).toBeGreaterThan(0)
    })
  })

  describe('Active Program Indicator', () => {
    it('should identify active program in renderPrograms', () => {
      app.activeProgram = {
        programId: 'beginner-strength',
        currentWeek: 1,
        currentDay: 1
      }
      
      app.renderPrograms()
      
      const programsContent = document.getElementById('programsContent').innerHTML
      expect(programsContent).toContain('Active Program')
      expect(programsContent).toContain('program-card-active')
    })

    it('should not show active indicator when no program is active', () => {
      app.activeProgram = null
      
      app.renderPrograms()
      
      const programsContent = document.getElementById('programsContent').innerHTML
      expect(programsContent).not.toContain('Active Program')
    })
  })

  describe('Workout Progress Tracking', () => {
    it('should track completed workout days', () => {
      app.activeProgram = {
        programId: 'beginner-strength',
        currentWeek: 1,
        currentDay: 1,
        completedDays: []
      }
      
      app.navigateProgram(1)
      
      expect(app.activeProgram.completedDays).toContain('w1d1')
    })

    it('should save workout before navigating to next day', () => {
      app.activeProgram = {
        programId: 'beginner-strength',
        currentWeek: 1,
        currentDay: 1,
        completedDays: []
      }
      app.currentWorkout = [
        {
          name: 'Bench Press',
          category: 'Chest',
          equipment: 'Barbell',
          sets: [{ reps: '10', weight: '100', time: '', useTime: false, completed: true }]
        }
      ]
      
      app.navigateProgram(1)
      
      expect(app.workoutHistory.length).toBeGreaterThan(0)
    })
  })
})
