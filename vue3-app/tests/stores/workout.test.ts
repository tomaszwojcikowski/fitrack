import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useWorkoutStore } from '../../src/stores/workout';
import type { Exercise } from '../../src/types';

describe('Workout Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with empty workout', () => {
      const store = useWorkoutStore();
      expect(store.currentWorkout).toEqual([]);
      expect(store.hasExercises).toBe(false);
      expect(store.totalSets).toBe(0);
      expect(store.completedSets).toBe(0);
    });

    it('should set today as workout date', () => {
      const store = useWorkoutStore();
      const today = new Date().toISOString().split('T')[0];
      expect(store.workoutDate).toBe(today);
    });

    it('should not have workout start time initially', () => {
      const store = useWorkoutStore();
      expect(store.workoutStartTime).toBeNull();
    });
  });

  describe('Adding Exercises', () => {
    it('should add exercise to workout', () => {
      const store = useWorkoutStore();
      const exercise: Exercise = {
        id: 'bench-press',
        name: 'Bench Press',
        category: 'chest',
        equipment: 'barbell',
        muscleGroups: ['chest', 'triceps'],
      };

      store.addExercise(exercise);

      expect(store.currentWorkout.length).toBe(1);
      expect(store.currentWorkout[0].exercise.name).toBe('Bench Press');
      expect(store.currentWorkout[0].sets.length).toBe(1);
      expect(store.hasExercises).toBe(true);
    });

    it('should start workout timer when adding first exercise', () => {
      const store = useWorkoutStore();
      const exercise: Exercise = {
        id: 'squat',
        name: 'Squat',
        category: 'quads',
        equipment: 'barbell',
      };

      expect(store.workoutStartTime).toBeNull();
      store.addExercise(exercise);
      expect(store.workoutStartTime).not.toBeNull();
    });

    it('should add exercise with empty set', () => {
      const store = useWorkoutStore();
      const exercise: Exercise = {
        id: 'deadlift',
        name: 'Deadlift',
        category: 'back',
        equipment: 'barbell',
      };

      store.addExercise(exercise);
      const addedExercise = store.currentWorkout[0];

      expect(addedExercise.sets.length).toBe(1);
      expect(addedExercise.sets[0].reps).toBe('');
      expect(addedExercise.sets[0].weight).toBe('');
      expect(addedExercise.sets[0].completed).toBe(false);
    });
  });

  describe('Managing Sets', () => {
    beforeEach(() => {
      const store = useWorkoutStore();
      const exercise: Exercise = {
        id: 'bench-press',
        name: 'Bench Press',
        category: 'chest',
        equipment: 'barbell',
      };
      store.addExercise(exercise);
    });

    it('should add set to exercise', () => {
      const store = useWorkoutStore();
      const exerciseId = store.currentWorkout[0].id;

      store.addSet(exerciseId);

      expect(store.currentWorkout[0].sets.length).toBe(2);
      expect(store.totalSets).toBe(2);
    });

    it('should update set values', () => {
      const store = useWorkoutStore();
      const exerciseId = store.currentWorkout[0].id;
      const setId = store.currentWorkout[0].sets[0].id;

      store.updateSet(exerciseId, setId, { reps: 12, weight: 80, completed: true });

      const updatedSet = store.currentWorkout[0].sets[0];
      expect(updatedSet.reps).toBe(12);
      expect(updatedSet.weight).toBe(80);
      expect(updatedSet.completed).toBe(true);
    });
  });

  describe('Clear Workout', () => {
    it('should clear all workout data', () => {
      const store = useWorkoutStore();
      const exercise: Exercise = {
        id: 'squat',
        name: 'Squat',
        category: 'quads',
        equipment: 'barbell',
      };

      store.addExercise(exercise);
      expect(store.hasExercises).toBe(true);
      expect(store.workoutStartTime).not.toBeNull();

      store.clearWorkout();

      expect(store.currentWorkout).toEqual([]);
      expect(store.hasExercises).toBe(false);
      expect(store.workoutStartTime).toBeNull();
    });
  });
});
