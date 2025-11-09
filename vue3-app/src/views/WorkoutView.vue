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

    <TransitionGroup v-else name="list" tag="div" class="exercises-list">
      <ExerciseCard
        v-for="exercise in workoutStore.currentWorkout"
        :key="exercise.id"
        :exercise="exercise"
        @remove="workoutStore.removeExercise(exercise.id)"
        @add-set="workoutStore.addSet(exercise.id)"
        @update-set="
          (setId: string, updates: any) =>
            workoutStore.updateSet(exercise.id, setId, updates)
        "
        @remove-set="(setId: string) => workoutStore.removeSet(exercise.id, setId)"
      />
    </TransitionGroup>

    <div v-if="workoutStore.hasExercises" class="workout-actions">
      <button class="btn btn-secondary" @click="showExercisePicker = true">
        Add Exercise
      </button>
      <button class="btn btn-primary" @click="finishWorkout">
        Finish Workout
      </button>
    </div>

    <!-- Enhanced Exercise Picker Modal -->
    <ExercisePicker
      v-model="showExercisePicker"
      @select="selectExercise"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkoutStore } from '@/stores/workout';
import { useHistoryStore } from '@/stores/history';
import ExerciseCard from '@/components/ExerciseCard.vue';
import ExercisePicker from '@/components/ExercisePicker.vue';
import type { Exercise } from '@/types';

const router = useRouter();
const workoutStore = useWorkoutStore();
const historyStore = useHistoryStore();

const showExercisePicker = ref(false);

function selectExercise(exercise: Exercise) {
  workoutStore.addExercise(exercise);
}

async function finishWorkout() {
  if (!workoutStore.hasExercises) {
    return;
  }

  // Confirm if there are incomplete sets
  const incompleteSets = workoutStore.currentWorkout.some((ex: any) => 
    ex.sets.some((set: any) => !set.completed)
  );
  
  if (incompleteSets) {
    const confirmed = confirm(
      'You have incomplete sets. Do you want to finish this workout anyway?'
    );
    if (!confirmed) {
      return;
    }
  }

  // Save workout to history
  historyStore.saveWorkout({
    date: workoutStore.workoutDate,
    exercises: workoutStore.currentWorkout,
    startTime: workoutStore.workoutStartTime,
    endTime: new Date().toISOString(),
  });

  // Clear current workout
  workoutStore.clearWorkout();
  
  // Navigate to history
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
  gap: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.list-move {
  transition: transform 0.3s ease;
}

.workout-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
