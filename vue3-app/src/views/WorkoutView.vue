<template>
  <div class="workout-view">
    <div class="workout-header">
      <input
        v-model="workoutStore.workoutDate"
        type="date"
        class="workout-date"
      />
      <div v-if="workoutStore.workoutStartTime" class="workout-duration">
        {{ formatDuration(workoutStore.workoutDuration) }}
      </div>
    </div>

    <div v-if="!workoutStore.hasExercises" class="empty-state">
      <div class="empty-icon">💪</div>
      <h2>Start Your Workout</h2>
      <p>Add exercises below to begin tracking your workout</p>
      <button class="btn btn-primary" @click="showExercisePicker = true">
        Add Exercise
      </button>
    </div>

    <div v-else class="exercises-list">
      <div
        v-for="exercise in workoutStore.currentWorkout"
        :key="exercise.id"
        class="exercise-card"
      >
        <div class="exercise-header">
          <h3>{{ exercise.exercise.name }}</h3>
          <button class="btn btn-sm btn-secondary" @click="workoutStore.removeExercise(exercise.id)">
            Remove
          </button>
        </div>
        <div class="sets-container">
          <div v-for="(set, index) in exercise.sets" :key="set.id" class="set-row">
            <span>Set {{ index + 1 }}</span>
            <input
              v-model.number="set.reps"
              type="number"
              placeholder="Reps"
              class="set-input"
            />
            <input
              v-model.number="set.weight"
              type="number"
              placeholder="Weight"
              class="set-input"
              step="0.5"
            />
            <button
              class="complete-btn"
              :class="{ active: set.completed }"
              @click="set.completed = !set.completed"
            >
              ✓
            </button>
          </div>
        </div>
        <button class="btn btn-sm btn-secondary" @click="workoutStore.addSet(exercise.id)">
          Add Set
        </button>
      </div>
    </div>

    <div v-if="workoutStore.hasExercises" class="workout-actions">
      <button class="btn btn-secondary" @click="showExercisePicker = true">
        Add Exercise
      </button>
      <button class="btn btn-primary" @click="finishWorkout">
        Finish Workout
      </button>
    </div>

    <!-- Simple Exercise Picker Modal -->
    <div v-if="showExercisePicker" class="modal-overlay" @click="showExercisePicker = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Select Exercise</h2>
          <button class="close-btn" @click="showExercisePicker = false">×</button>
        </div>
        <div class="modal-body">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search exercises..."
            class="search-input"
          />
          <div class="exercise-grid">
            <div
              v-for="ex in filteredExercises"
              :key="ex.id"
              class="exercise-item"
              @click="selectExercise(ex)"
            >
              <div class="exercise-name">{{ ex.name }}</div>
              <div class="exercise-meta">{{ ex.category }} • {{ ex.equipment }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkoutStore } from '@/stores/workout';
import { useExerciseStore } from '@/stores/exercises';
import type { Exercise } from '@/types';

const router = useRouter();
const workoutStore = useWorkoutStore();
const exerciseStore = useExerciseStore();

const showExercisePicker = ref(false);
const searchQuery = ref('');

const filteredExercises = computed(() => {
  return exerciseStore.searchExercises(searchQuery.value);
});

function selectExercise(exercise: Exercise) {
  workoutStore.addExercise(exercise);
  exerciseStore.addToRecent(exercise.id);
  showExercisePicker.value = false;
  searchQuery.value = '';
}

function finishWorkout() {
  // TODO: Save to history
  workoutStore.clearWorkout();
  router.push('/history');
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
</script>

<style scoped>
.workout-view {
  padding: 1rem;
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exercise-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sets-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.set-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.set-input {
  flex: 1;
  padding: 0.5rem;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
}

.complete-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
}

.complete-btn.active {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.workout-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
}

.exercise-grid {
  display: grid;
  gap: 0.75rem;
}

.exercise-item {
  padding: 1rem;
  background: var(--bg-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
}

.exercise-item:hover {
  background: var(--hover-bg);
}

.exercise-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.exercise-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
