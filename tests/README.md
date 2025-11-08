# FiTrack Test Suite

This directory contains a comprehensive test suite for the FiTrack application, designed to run in less than 10 seconds.

## Overview

The test suite uses [Vitest](https://vitest.dev/) for fast, modern testing with:
- **Happy DOM** for lightweight DOM simulation
- **Mocked localStorage** for data persistence testing
- **Comprehensive coverage** of all core features

## Running Tests

```bash
# Run all tests (single run)
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Test Files

### `exercises.test.js`
Tests the exercise database:
- Exercise structure validation
- Database completeness (100+ exercises)
- Alphabetical sorting
- Category and equipment coverage

### `app.test.js`
Tests the FiTrackApp class with comprehensive coverage of:

#### Initialization
- Empty workout state
- Empty history state
- Rest timer initialization

#### Data Management
- LocalStorage save/load operations
- Corrupted data handling
- Data persistence

#### Exercise Management
- Adding exercises to workout
- Duplicate exercise prevention
- Removing exercises
- Creating and adding sets

#### Set Operations
- Updating set values (reps, weight, time)
- Toggling set completion
- Switching between reps/time mode
- Auto-starting rest timer on completion

#### Rest Timer
- Starting timer with custom duration
- Stopping timer
- Adding time
- Display formatting (MM:SS)

#### Search and Filtering
- Exercise search by name
- Search by category
- Search by equipment

#### Workout History
- Saving workouts to history
- Filtering empty sets
- Updating existing workouts
- Finishing and clearing workouts

#### UI State Management
- Button visibility updates
- Date initialization
- View switching

#### Navigation
- History view
- Workout view
- View transitions

#### Edge Cases
- Invalid operations
- Error handling
- Sound playback failures

## Test Setup

The `setup.js` file provides:
- LocalStorage mocking
- Audio API mocking
- DOM structure setup
- Global function mocking (alert, confirm, prompt)

## Performance

The entire test suite is designed to run in **less than 10 seconds** to enable:
- Fast feedback during development
- Quick CI/CD pipeline execution
- Efficient pre-commit hooks

Current performance: ~700-800ms for 43 tests

## Coverage

Run tests with coverage:
```bash
npm test -- --coverage
```

Coverage includes:
- `app.js` - Core application logic
- `exercises.js` - Exercise database
