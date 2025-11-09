<template>
  <div class="workout-history-card" @click="$emit('click')">
    <div class="card-header">
      <div class="workout-date">
        <div class="date-day">{{ dayOfWeek }}</div>
        <div class="date-text">{{ formattedDate }}</div>
      </div>
      <div class="workout-duration">
        <span class="duration-icon">⏱</span>
        {{ duration }}
      </div>
    </div>

    <div class="card-body">
      <div class="workout-summary">
        <div class="summary-item">
          <span class="summary-label">Exercises</span>
          <span class="summary-value">{{ workout.exercises.length }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Sets</span>
          <span class="summary-value">{{ totalSets }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Volume</span>
          <span class="summary-value">{{ totalVolume }}kg</span>
        </div>
      </div>

      <div class="workout-exercises">
        <span
          v-for="(exercise, index) in workout.exercises.slice(0, 3)"
          :key="exercise.id"
          class="exercise-pill"
        >
          {{ exercise.exercise.name }}
          <span v-if="index < 2 && index < workout.exercises.length - 1" class="pill-separator">•</span>
        </span>
        <span v-if="workout.exercises.length > 3" class="exercise-more">
          +{{ workout.exercises.length - 3 }} more
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Workout } from '@/types';

const props = defineProps<{
  workout: Workout;
}>();

defineEmits<{
  click: [];
}>();

const dayOfWeek = computed(() => {
  const date = new Date(props.workout.date);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
});

const formattedDate = computed(() => {
  const date = new Date(props.workout.date);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric' 
  });
});

const duration = computed(() => {
  if (!props.workout.startTime || !props.workout.endTime) {
    return 'N/A';
  }
  
  const start = new Date(props.workout.startTime).getTime();
  const end = new Date(props.workout.endTime).getTime();
  const durationSec = Math.floor((end - start) / 1000);
  
  const hours = Math.floor(durationSec / 3600);
  const minutes = Math.floor((durationSec % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

const totalSets = computed(() => {
  return props.workout.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0);
});

const totalVolume = computed(() => {
  return props.workout.exercises.reduce((sum: number, ex: any) => {
    return sum + ex.sets.reduce((setSum: number, set: any) => {
      return setSum + (set.weight * set.reps);
    }, 0);
  }, 0);
});
</script>

<style scoped>
.workout-history-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border-color);
}

.workout-history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.workout-date {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-day {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.date-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.workout-duration {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.duration-icon {
  font-size: 1rem;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.workout-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

.workout-exercises {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.exercise-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  font-size: 0.8125rem;
  color: var(--text-primary);
}

.pill-separator {
  color: var(--text-secondary);
  font-weight: 400;
}

.exercise-more {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .workout-history-card {
    padding: 1rem;
  }

  .workout-summary {
    gap: 0.75rem;
  }

  .summary-value {
    font-size: 1.125rem;
  }
}
</style>
