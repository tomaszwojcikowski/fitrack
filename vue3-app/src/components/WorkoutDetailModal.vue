<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="header-info">
            <h2>{{ formattedDate }}</h2>
            <p class="workout-duration">
              <span class="duration-icon">⏱</span>
              {{ duration }}
            </p>
          </div>
          <button class="close-btn" @click="$emit('close')">
            <span class="close-icon">×</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="workout-summary">
            <div class="summary-card">
              <div class="summary-icon">💪</div>
              <div class="summary-info">
                <span class="summary-value">{{ workout.exercises.length }}</span>
                <span class="summary-label">Exercises</span>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">📊</div>
              <div class="summary-info">
                <span class="summary-value">{{ totalSets }}</span>
                <span class="summary-label">Total Sets</span>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">🏋️</div>
              <div class="summary-info">
                <span class="summary-value">{{ totalVolume }}kg</span>
                <span class="summary-label">Volume</span>
              </div>
            </div>
          </div>

          <div class="exercises-section">
            <h3>Exercises</h3>
            <div class="exercises-list">
              <div
                v-for="exercise in workout.exercises"
                :key="exercise.id"
                class="exercise-detail"
              >
                <div class="exercise-header">
                  <h4>{{ exercise.exercise.name }}</h4>
                  <span class="exercise-meta">
                    {{ exercise.exercise.category }}
                  </span>
                </div>
                <div class="sets-table">
                  <div class="table-header">
                    <span>Set</span>
                    <span>Weight</span>
                    <span>Reps</span>
                    <span>Status</span>
                  </div>
                  <div
                    v-for="(set, index) in exercise.sets"
                    :key="set.id"
                    class="table-row"
                    :class="{ completed: set.completed }"
                  >
                    <span>{{ index + 1 }}</span>
                    <span>{{ set.weight }}kg</span>
                    <span>{{ set.reps }}</span>
                    <span>
                      <span v-if="set.completed" class="status-check">✓</span>
                      <span v-else class="status-pending">−</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-danger" @click="confirmDelete">
            <TrashIcon />
            Delete Workout
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Workout } from '@/types';
import TrashIcon from './icons/TrashIcon.vue';

const props = defineProps<{
  workout: Workout;
}>();

const emit = defineEmits<{
  close: [];
  delete: [id: string];
}>();

const formattedDate = computed(() => {
  const date = new Date(props.workout.date);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const duration = computed(() => {
  if (!props.workout.startTime || !props.workout.endTime) {
    return 'Duration not recorded';
  }
  
  const start = new Date(props.workout.startTime).getTime();
  const end = new Date(props.workout.endTime).getTime();
  const durationSec = Math.floor((end - start) / 1000);
  
  const hours = Math.floor(durationSec / 3600);
  const minutes = Math.floor((durationSec % 3600) / 60);
  const seconds = durationSec % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
});

const totalSets = computed(() => {
  return props.workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
});

const totalVolume = computed(() => {
  return props.workout.exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((setSum, set) => {
      return setSum + (set.weight * set.reps);
    }, 0);
  }, 0);
});

function confirmDelete() {
  if (confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
    emit('delete', props.workout.id);
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.header-info h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.workout-duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.duration-icon {
  font-size: 1rem;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: var(--text-primary);
}

.close-icon {
  font-size: 2rem;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
}

.workout-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.summary-icon {
  font-size: 1.5rem;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

.summary-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.exercises-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.exercise-detail {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  background: var(--bg-secondary);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.exercise-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.exercise-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: capitalize;
  padding: 0.25rem 0.5rem;
  background: var(--card-bg);
  border-radius: 4px;
}

.sets-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 2fr 1fr;
  gap: 0.5rem;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.table-header {
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.table-row {
  background: var(--card-bg);
  border-radius: 8px;
  color: var(--text-primary);
  transition: background 0.2s ease;
}

.table-row.completed {
  background: rgba(var(--success-rgb), 0.1);
  color: var(--success-color);
}

.status-check {
  color: var(--success-color);
  font-weight: 700;
}

.status-pending {
  color: var(--text-secondary);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.btn-danger {
  background: var(--danger-color);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger:hover {
  background: var(--danger-hover);
}

@media (max-width: 768px) {
  .modal-content {
    max-height: 95vh;
  }

  .workout-summary {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 0.5fr 1.5fr 1.5fr 0.5fr;
    gap: 0.25rem;
    padding: 0.375rem;
    font-size: 0.8125rem;
  }

  .exercise-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
