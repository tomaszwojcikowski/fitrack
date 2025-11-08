// Test setup file
import { beforeEach, vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null
  },
  setItem(key, value) {
    this.store[key] = value.toString()
  },
  removeItem(key) {
    delete this.store[key]
  },
  clear() {
    this.store = {}
  }
}

// Mock Audio
global.Audio = class {
  play() {
    return Promise.resolve()
  }
  pause() {}
}

// Setup global mocks before each test
beforeEach(() => {
  // Reset localStorage
  localStorageMock.clear()
  global.localStorage = localStorageMock
  
  // Mock DOM elements that the app expects
  if (typeof document !== 'undefined') {
    // Create basic DOM structure
    document.body.innerHTML = `
      <div id="app">
        <div id="exerciseSearch"></div>
        <div id="clearSearch"></div>
        <div id="addExerciseBtn"></div>
        <div id="historyBtn"></div>
        <div id="backToWorkout"></div>
        <div id="quickRestBtn"></div>
        <div id="timerStop"></div>
        <div id="timerAddTime"></div>
        <input id="workoutDate" type="date" />
        <div id="finishWorkoutBtn"></div>
        <div id="exerciseList"></div>
        <div id="currentExercises"></div>
        <div class="exercise-selection"></div>
        <div id="finishWorkoutContainer"></div>
        <div id="restTimer"></div>
        <div id="timerDisplay"></div>
        <div id="workoutView"></div>
        <div id="historyView"></div>
        <div id="historyContent"></div>
        <div id="programsBtn"></div>
        <div id="backToWorkoutFromPrograms"></div>
        <div id="prevDayBtn"></div>
        <div id="nextDayBtn"></div>
        <div id="programIndicator"></div>
        <div id="programNav"></div>
        <div id="programsView"></div>
        <div id="programsContent"></div>
        <div id="toastContainer"></div>
        <div id="confirmDialog" class="hidden">
          <div id="confirmTitle"></div>
          <div id="confirmMessage"></div>
          <button id="confirmOk"></button>
          <button id="confirmCancel"></button>
        </div>
        <audio id="timerSound"></audio>
        <svg class="timer-svg">
          <circle class="timer-progress"></circle>
        </svg>
      </div>
    `
  }
  
  // Mock alert, confirm, prompt
  global.alert = vi.fn()
  global.confirm = vi.fn(() => false)
  global.prompt = vi.fn(() => null)
})
