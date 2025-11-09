import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import type { Workout, WorkoutStats } from '../types';

export const useHistoryStore = defineStore('history', () => {
  // State
  const workouts = useStorage<Workout[]>('fitrack-history', [], localStorage, {
    mergeDefaults: true,
  });

  // Getters
  const workoutCount = computed(() => workouts.value.length);

  const sortedWorkouts = computed(() => {
    return [...workouts.value].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  const recentWorkouts = computed(() => {
    return sortedWorkouts.value.slice(0, 10);
  });

  const stats = computed((): WorkoutStats => {
    const totalWorkouts = workouts.value.length;
    
    if (totalWorkouts === 0) {
      return {
        totalWorkouts: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalVolume: 0,
        averageDuration: 0,
        favoriteExercises: [],
      };
    }

    // Calculate total volume (weight × reps)
    const totalVolume = workouts.value.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((exSum, exercise) => {
        return exSum + exercise.sets.reduce((setSum, set) => {
          return setSum + (set.weight * set.reps);
        }, 0);
      }, 0);
    }, 0);

    // Calculate average duration
    const totalDuration = workouts.value.reduce((sum, workout) => {
      if (workout.startTime && workout.endTime) {
        const start = new Date(workout.startTime).getTime();
        const end = new Date(workout.endTime).getTime();
        return sum + Math.floor((end - start) / 1000);
      }
      return sum;
    }, 0);
    const averageDuration = Math.floor(totalDuration / totalWorkouts);

    // Calculate streaks
    const sortedDates = [...workouts.value]
      .map(w => w.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;
    let lastDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);

      if (!lastDate) {
        streak = 1;
        currentStreak = 1;
      } else {
        const dayDiff = Math.floor((lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          streak++;
          if (lastDate.toDateString() === new Date().toDateString() || 
              date.toDateString() === new Date().toDateString()) {
            currentStreak = streak;
          }
        } else if (dayDiff > 1) {
          longestStreak = Math.max(longestStreak, streak);
          streak = 1;
        }
      }

      lastDate = date;
    }
    longestStreak = Math.max(longestStreak, streak);

    // Calculate favorite exercises (most frequently used)
    const exerciseCount = new Map<string, number>();
    workouts.value.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const name = exercise.exercise.name;
        exerciseCount.set(name, (exerciseCount.get(name) || 0) + 1);
      });
    });

    const favoriteExercises = Array.from(exerciseCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    return {
      totalWorkouts,
      currentStreak,
      longestStreak,
      totalVolume,
      averageDuration,
      favoriteExercises,
    };
  });

  // Actions
  function saveWorkout(workout: Omit<Workout, 'id'>) {
    const newWorkout: Workout = {
      ...workout,
      id: `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    workouts.value.push(newWorkout);
    return newWorkout;
  }

  function deleteWorkout(id: string) {
    const index = workouts.value.findIndex(w => w.id === id);
    if (index !== -1) {
      workouts.value.splice(index, 1);
    }
  }

  function getWorkout(id: string) {
    return workouts.value.find(w => w.id === id);
  }

  function getWorkoutsByDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return workouts.value.filter(workout => {
      const workoutTime = new Date(workout.date).getTime();
      return workoutTime >= start && workoutTime <= end;
    });
  }

  function searchWorkouts(query: string) {
    const lowerQuery = query.toLowerCase();
    return workouts.value.filter(workout => {
      return workout.exercises.some(exercise =>
        exercise.exercise.name.toLowerCase().includes(lowerQuery) ||
        exercise.exercise.category.toLowerCase().includes(lowerQuery)
      );
    });
  }

  function getExerciseHistory(exerciseName: string) {
    const history: Array<{
      date: string;
      sets: Array<{ weight: number; reps: number; completed: boolean }>;
    }> = [];

    workouts.value.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.exercise.name === exerciseName) {
          history.push({
            date: workout.date,
            sets: exercise.sets.map(s => ({
              weight: s.weight,
              reps: s.reps,
              completed: s.completed,
            })),
          });
        }
      });
    });

    return history.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  function clearHistory() {
    workouts.value = [];
  }

  return {
    // State
    workouts,
    
    // Getters
    workoutCount,
    sortedWorkouts,
    recentWorkouts,
    stats,
    
    // Actions
    saveWorkout,
    deleteWorkout,
    getWorkout,
    getWorkoutsByDateRange,
    searchWorkouts,
    getExerciseHistory,
    clearHistory,
  };
});
