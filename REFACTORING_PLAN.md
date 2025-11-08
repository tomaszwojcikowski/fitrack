# FiTrack Refactoring Plan

## Current State
- app.js is 1399 lines and contains all application logic
- Needs to be split into modular, maintainable components

## Proposed Module Structure

### 1. src/storage.js ✅ CREATED
**Responsibility:** Data persistence layer
- loadData()
- saveData()
- clearData()
- hasSeenWelcome()
- markWelcomeSeen()

### 2. src/timer.js ✅ CREATED  
**Responsibility:** Rest timer functionality
- startRestTimer()
- stopRestTimer()
- addRestTime()
- updateTimerDisplay()
- playTimerSound()

### 3. src/workoutManager.js (TODO)
**Responsibility:** Workout and exercise operations
- addExercise()
- removeExercise()
- addSet()
- deleteSet()
- swapSet()
- toggleSetInputType()
- updateSet()
- toggleSetComplete()
- createEmptySet()
- saveCurrentWorkout()
- finishWorkout()

### 4. src/programManager.js (TODO)
**Responsibility:** Program-specific logic
- startProgram()
- quitProgram()
- loadProgramWorkout()
- navigateProgram()
- getProgramById()
- renderPrograms()
- showProgramDetails()

### 5. src/navigation.js (TODO)
**Responsibility:** View navigation and routing
- showHistory()
- showWorkout()
- showPrograms()
- handleInitialView()
- handleHashChange()

### 6. src/ui.js (TODO)
**Responsibility:** UI rendering and updates
- renderCurrentExercises()
- renderHistory()
- updateUI()
- updateQuickRestButton()
- updateProgramIndicator()
- showWelcomeSection()
- showWelcomeWithProgram()
- hideWelcomeSection()

### 7. src/notifications.js (TODO)
**Responsibility:** User notifications
- showToast()
- removeToast()
- showConfirm()
- showSaveIndicator()
- showWelcomeTooltip()

### 8. src/search.js (TODO)
**Responsibility:** Exercise search functionality
- handleSearch()
- clearSearch()
- setupSearchListeners()

### 9. app.js (REFACTOR)
**Responsibility:** Main orchestration
- Initialize all managers
- Coordinate between modules
- Setup event listeners
- Maintain application state

## Implementation Steps

1. ✅ Create src directory structure
2. ✅ Extract storage module
3. ✅ Extract timer module
4. Extract workout manager
5. Extract program manager
6. Extract navigation module
7. Extract UI module
8. Extract notifications module
9. Extract search module
10. Refactor main app.js
11. Update imports in index.html
12. Run all tests to ensure no regressions
13. Update documentation

## Benefits

- **Maintainability:** Each module has a single responsibility
- **Testability:** Easier to write unit tests for isolated modules
- **Reusability:** Modules can be reused or replaced independently
- **Readability:** Smaller files are easier to understand
- **Collaboration:** Multiple developers can work on different modules

## Notes

- Keep backward compatibility during refactoring
- Ensure all 89 tests continue to pass
- Use ES6 modules with proper imports/exports
- Consider dependency injection for better testability
