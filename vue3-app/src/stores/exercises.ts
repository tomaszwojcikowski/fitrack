import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { EXERCISES } from '../data/exercises';
import type { Exercise } from '../types';

export const useExerciseStore = defineStore('exercises', () => {
  const exercises = ref<Exercise[]>(EXERCISES);
  const favoriteExerciseIds = useStorage<string[]>('fitrack-favorite-exercises', []);
  const recentExerciseIds = useStorage<string[]>('fitrack-recent-exercises', []);
  
  const favoriteExercises = computed(() =>
    favoriteExerciseIds.value
      .map(id => exercises.value.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => ex !== undefined)
  );
  
  const recentExercises = computed(() =>
    recentExerciseIds.value
      .map(id => exercises.value.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => ex !== undefined)
      .slice(0, 10)
  );
  
  function getExercise(id: string): Exercise | undefined {
    return exercises.value.find(ex => ex.id === id);
  }
  
  function searchExercises(query: string): Exercise[] {
    if (!query) return exercises.value;
    
    const q = query.toLowerCase();
    return exercises.value.filter(ex =>
      ex.name.toLowerCase().includes(q) ||
      ex.category.toLowerCase().includes(q) ||
      ex.equipment.toLowerCase().includes(q)
    );
  }
  
  function addToFavorites(exerciseId: string) {
    if (!favoriteExerciseIds.value.includes(exerciseId)) {
      favoriteExerciseIds.value.push(exerciseId);
    }
  }
  
  function removeFromFavorites(exerciseId: string) {
    const index = favoriteExerciseIds.value.indexOf(exerciseId);
    if (index !== -1) {
      favoriteExerciseIds.value.splice(index, 1);
    }
  }
  
  function toggleFavorite(exerciseId: string) {
    if (favoriteExerciseIds.value.includes(exerciseId)) {
      removeFromFavorites(exerciseId);
    } else {
      addToFavorites(exerciseId);
    }
  }
  
  function isFavorite(exerciseId: string): boolean {
    return favoriteExerciseIds.value.includes(exerciseId);
  }
  
  function addToRecent(exerciseId: string) {
    // Remove if already exists
    const index = recentExerciseIds.value.indexOf(exerciseId);
    if (index !== -1) {
      recentExerciseIds.value.splice(index, 1);
    }
    // Add to beginning
    recentExerciseIds.value.unshift(exerciseId);
    // Keep only last 10
    if (recentExerciseIds.value.length > 10) {
      recentExerciseIds.value = recentExerciseIds.value.slice(0, 10);
    }
  }
  
  function getExercisesByCategory(category: string): Exercise[] {
    return exercises.value.filter(ex => ex.category === category);
  }
  
  function getExercisesByEquipment(equipment: string): Exercise[] {
    return exercises.value.filter(ex => ex.equipment === equipment);
  }
  
  return {
    exercises,
    favoriteExercises,
    recentExercises,
    getExercise,
    searchExercises,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    addToRecent,
    getExercisesByCategory,
    getExercisesByEquipment,
  };
});
