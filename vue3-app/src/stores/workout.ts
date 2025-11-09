import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import type { WorkoutExercise, Set, Exercise } from '../types';

export const useWorkoutStore = defineStore('workout', () => {
  // State
  const currentWorkout = useStorage<WorkoutExercise[]>(
    'fitrack-workout',
    [],
    localStorage,
    { mergeDefaults: true }
  );
  
  const workoutDate = ref(new Date().toISOString().split('T')[0]);
  const workoutStartTime = ref<string | null>(null);
  
  // Getters
  const hasExercises = computed(() => currentWorkout.value.length > 0);
  
  const totalSets = computed(() =>
    currentWorkout.value.reduce((sum, ex) => sum + ex.sets.length, 0)
  );
  
  const completedSets = computed(() =>
    currentWorkout.value.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    )
  );
  
  const workoutDuration = computed(() => {
    if (!workoutStartTime.value) return 0;
    const start = new Date(workoutStartTime.value);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / 1000);
  });

  // Actions
  function startWorkout() {
    if (!workoutStartTime.value) {
      workoutStartTime.value = new Date().toISOString();
    }
  }

  function addExercise(exercise: Exercise) {
    const newExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exercise,
      sets: [
        {
          id: crypto.randomUUID(),
          reps: '',
          weight: '',
          completed: false,
        },
      ],
      order: currentWorkout.value.length,
    };
    
    currentWorkout.value.push(newExercise);
    startWorkout();
  }

  function removeExercise(exerciseId: string) {
    const index = currentWorkout.value.findIndex((ex) => ex.id === exerciseId);
    if (index !== -1) {
      currentWorkout.value.splice(index, 1);
    }
  }

  function addSet(exerciseId: string) {
    const exercise = currentWorkout.value.find((ex) => ex.id === exerciseId);
    if (exercise) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      exercise.sets.push({
        id: crypto.randomUUID(),
        reps: lastSet?.reps || '',
        weight: lastSet?.weight || '',
        completed: false,
      });
    }
  }

  function updateSet(exerciseId: string, setId: string, updates: Partial<Set>) {
    const exercise = currentWorkout.value.find((ex) => ex.id === exerciseId);
    if (exercise) {
      const set = exercise.sets.find((s) => s.id === setId);
      if (set) {
        Object.assign(set, updates);
      }
    }
  }

  function removeSet(exerciseId: string, setId: string) {
    const exercise = currentWorkout.value.find((ex) => ex.id === exerciseId);
    if (exercise && exercise.sets.length > 1) {
      const index = exercise.sets.findIndex((s) => s.id === setId);
      if (index !== -1) {
        exercise.sets.splice(index, 1);
      }
    }
  }

  function clearWorkout() {
    currentWorkout.value = [];
    workoutStartTime.value = null;
  }

  return {
    // State
    currentWorkout,
    workoutDate,
    workoutStartTime,
    
    // Getters
    hasExercises,
    totalSets,
    completedSets,
    workoutDuration,
    
    // Actions
    startWorkout,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    clearWorkout,
  };
});
