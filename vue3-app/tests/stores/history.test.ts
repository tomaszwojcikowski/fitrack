import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHistoryStore } from '@/stores/history';
import type { Workout } from '@/types';

describe('History Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with empty workout history', () => {
      const store = useHistoryStore();
      expect(store.workouts).toEqual([]);
      expect(store.workoutCount).toBe(0);
    });

    it('should have default stats for empty history', () => {
      const store = useHistoryStore();
      expect(store.stats.totalWorkouts).toBe(0);
      expect(store.stats.currentStreak).toBe(0);
      expect(store.stats.longestStreak).toBe(0);
      expect(store.stats.totalVolume).toBe(0);
      expect(store.stats.averageDuration).toBe(0);
      expect(store.stats.favoriteExercises).toEqual([]);
    });
  });

  describe('Save Workout', () => {
    it('should save a workout to history', () => {
      const store = useHistoryStore();
      
      const workout = store.saveWorkout({
        date: '2024-01-01',
        exercises: [
          {
            id: 'ex1',
            exercise: {
              id: '1',
              name: 'Bench Press',
              category: 'chest',
              equipment: 'barbell',
              muscleGroups: ['chest'],
            },
            sets: [
              { id: 'set1', weight: 100, reps: 10, completed: true },
            ],
          },
        ],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
      });

      expect(workout.id).toBeDefined();
      expect(store.workouts.length).toBe(1);
      expect(store.workoutCount).toBe(1);
    });

    it('should generate unique IDs for each workout', () => {
      const store = useHistoryStore();
      
      const workout1 = store.saveWorkout({
        date: '2024-01-01',
        exercises: [],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
      });

      const workout2 = store.saveWorkout({
        date: '2024-01-02',
        exercises: [],
        startTime: '2024-01-02T10:00:00Z',
        endTime: '2024-01-02T11:00:00Z',
      });

      expect(workout1.id).not.toBe(workout2.id);
    });
  });

  describe('Delete Workout', () => {
    it('should delete a workout by ID', () => {
      const store = useHistoryStore();
      
      const workout = store.saveWorkout({
        date: '2024-01-01',
        exercises: [],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
      });

      expect(store.workouts.length).toBe(1);
      
      store.deleteWorkout(workout.id);
      
      expect(store.workouts.length).toBe(0);
    });

    it('should not error when deleting non-existent workout', () => {
      const store = useHistoryStore();
      
      expect(() => {
        store.deleteWorkout('non-existent-id');
      }).not.toThrow();
    });
  });

  describe('Get Workout', () => {
    it('should retrieve a workout by ID', () => {
      const store = useHistoryStore();
      
      const savedWorkout = store.saveWorkout({
        date: '2024-01-01',
        exercises: [],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
      });

      const retrievedWorkout = store.getWorkout(savedWorkout.id);
      
      expect(retrievedWorkout).toBeDefined();
      expect(retrievedWorkout?.id).toBe(savedWorkout.id);
    });

    it('should return undefined for non-existent ID', () => {
      const store = useHistoryStore();
      
      const workout = store.getWorkout('non-existent-id');
      
      expect(workout).toBeUndefined();
    });
  });

  describe('Sorted Workouts', () => {
    it('should sort workouts by date (newest first)', () => {
      const store = useHistoryStore();
      
      store.saveWorkout({
        date: '2024-01-01',
        exercises: [],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
      });

      store.saveWorkout({
        date: '2024-01-03',
        exercises: [],
        startTime: '2024-01-03T10:00:00Z',
        endTime: '2024-01-03T11:00:00Z',
      });

      store.saveWorkout({
        date: '2024-01-02',
        exercises: [],
        startTime: '2024-01-02T10:00:00Z',
        endTime: '2024-01-02T11:00:00Z',
      });

      const sorted = store.sortedWorkouts;
      
      expect(sorted[0].date).toBe('2024-01-03');
      expect(sorted[1].date).toBe('2024-01-02');
      expect(sorted[2].date).toBe('2024-01-01');
    });
  });

  describe('Search Workouts', () => {
    it('should find workouts by exercise name', () => {
      const store = useHistoryStore();
      
      store.saveWorkout({
        date: '2024-01-01',
        exercises: [
          {
            id: 'ex1',
            exercise: {
              id: '1',
              name: 'Bench Press',
              category: 'chest',
              equipment: 'barbell',
              muscleGroups: ['chest'],
            },
            sets: [],
          },
        ],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
      });

      store.saveWorkout({
        date: '2024-01-02',
        exercises: [
          {
            id: 'ex2',
            exercise: {
              id: '2',
              name: 'Squat',
              category: 'legs',
              equipment: 'barbell',
              muscleGroups: ['legs'],
            },
            sets: [],
          },
        ],
        startTime: '2024-01-02T10:00:00Z',
        endTime: '2024-01-02T11:00:00Z',
      });

      const results = store.searchWorkouts('bench');
      
      expect(results.length).toBe(1);
      expect(results[0].exercises[0].exercise.name).toBe('Bench Press');
    });

    it('should search case-insensitively', () => {
      const store = useHistoryStore();
      
      store.saveWorkout({
        date: '2024-01-01',
        exercises: [
          {
            id: 'ex1',
            exercise: {
              id: '1',
              name: 'Bench Press',
              category: 'chest',
              equipment: 'barbell',
              muscleGroups: ['chest'],
            },
            sets: [],
          },
        ],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
      });

      const results = store.searchWorkouts('BENCH');
      
      expect(results.length).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should calculate total volume correctly', () => {
      const store = useHistoryStore();
      
      store.saveWorkout({
        date: '2024-01-01',
        exercises: [
          {
            id: 'ex1',
            exercise: {
              id: '1',
              name: 'Bench Press',
              category: 'chest',
              equipment: 'barbell',
              muscleGroups: ['chest'],
            },
            sets: [
              { id: 'set1', weight: 100, reps: 10, completed: true }, // 1000
              { id: 'set2', weight: 100, reps: 8, completed: true },  // 800
            ],
          },
        ],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
      });

      expect(store.stats.totalVolume).toBe(1800);
    });

    it('should calculate average duration correctly', () => {
      const store = useHistoryStore();
      
      // 1 hour workout
      store.saveWorkout({
        date: '2024-01-01',
        exercises: [],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
      });

      // 30 minute workout
      store.saveWorkout({
        date: '2024-01-02',
        exercises: [],
        startTime: '2024-01-02T10:00:00Z',
        endTime: '2024-01-02T10:30:00Z',
      });

      // Average: (3600 + 1800) / 2 = 2700
      expect(store.stats.averageDuration).toBe(2700);
    });

    it('should identify favorite exercises', () => {
      const store = useHistoryStore();
      
      // Bench Press appears 3 times
      for (let i = 0; i < 3; i++) {
        store.saveWorkout({
          date: `2024-01-0${i + 1}`,
          exercises: [
            {
              id: `ex${i}`,
              exercise: {
                id: '1',
                name: 'Bench Press',
                category: 'chest',
                equipment: 'barbell',
                muscleGroups: ['chest'],
              },
              sets: [],
            },
          ],
          startTime: `2024-01-0${i + 1}T10:00:00Z`,
          endTime: `2024-01-0${i + 1}T11:00:00Z`,
        });
      }

      // Squat appears 2 times
      for (let i = 0; i < 2; i++) {
        store.saveWorkout({
          date: `2024-01-0${i + 4}`,
          exercises: [
            {
              id: `ex${i + 3}`,
              exercise: {
                id: '2',
                name: 'Squat',
                category: 'legs',
                equipment: 'barbell',
                muscleGroups: ['legs'],
              },
              sets: [],
            },
          ],
          startTime: `2024-01-0${i + 4}T10:00:00Z`,
          endTime: `2024-01-0${i + 4}T11:00:00Z`,
        });
      }

      const favorites = store.stats.favoriteExercises;
      
      expect(favorites[0]).toBe('Bench Press');
      expect(favorites[1]).toBe('Squat');
    });
  });

  describe('Clear History', () => {
    it('should clear all workouts', () => {
      const store = useHistoryStore();
      
      store.saveWorkout({
        date: '2024-01-01',
        exercises: [],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
      });

      expect(store.workouts.length).toBe(1);
      
      store.clearHistory();
      
      expect(store.workouts.length).toBe(0);
    });
  });
});
