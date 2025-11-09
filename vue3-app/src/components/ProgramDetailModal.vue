<template>
  <div v-if="show" class="modal-overlay" @click="$emit('update:show', false)">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ program.name }}</h2>
        <button class="close-btn" @click="$emit('update:show', false)">×</button>
      </div>

      <div class="modal-body">
        <div class="program-info">
          <span class="difficulty-badge" :class="`difficulty-${program.difficulty.toLowerCase()}`">
            {{ program.difficulty }}
          </span>
          <p class="program-description">{{ program.description }}</p>
          
          <div class="program-meta">
            <div class="meta-item">
              <strong>Duration:</strong> {{ program.duration }} weeks
            </div>
            <div class="meta-item">
              <strong>Days per Week:</strong> {{ program.daysPerWeek }}
            </div>
            <div class="meta-item">
              <strong>Goal:</strong> {{ program.goal }}
            </div>
          </div>
        </div>

        <div class="program-structure">
          <h3>Program Structure</h3>
          <div v-for="week in program.weeks" :key="week.week" class="week-section">
            <h4>Week {{ week.week }}</h4>
            <div class="days-grid">
              <div v-for="day in week.days" :key="day.day" class="day-card">
                <div class="day-header">
                  <strong>Day {{ day.day }}</strong>
                  <span>{{ day.name }}</span>
                </div>
                <div class="exercises-list">
                  <div v-for="(exercise, idx) in day.exercises" :key="idx" class="exercise-item">
                    {{ exercise.name }} - {{ exercise.sets }} × {{ exercise.reps }}
                    <span v-if="exercise.notes" class="exercise-notes">
                      ({{ exercise.notes }})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:show', false)">
          Close
        </button>
        <button class="btn btn-primary" @click="handleStart">
          Start Program
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Program } from '../types';

const props = defineProps<{
  show: boolean;
  program: Program;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  start: [program: Program];
}>();

function handleStart() {
  emit('start', props.program);
  emit('update:show', false);
}
</script>

<style scoped>
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
  padding: 1rem;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
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
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.program-info {
  margin-bottom: 2rem;
}

.difficulty-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.difficulty-beginner {
  background: #4caf5033;
  color: #4caf50;
}

.difficulty-intermediate {
  background: #ff980033;
  color: #ff9800;
}

.difficulty-advanced {
  background: #f4433633;
  color: #f44336;
}

.program-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.program-meta {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  color: var(--text-secondary);
}

.meta-item strong {
  color: var(--text-primary);
  margin-right: 0.5rem;
}

.program-structure {
  margin-top: 2rem;
}

.program-structure h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.week-section {
  margin-bottom: 2rem;
}

.week-section h4 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.days-grid {
  display: grid;
  gap: 1rem;
}

.day-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.day-header strong {
  color: var(--text-primary);
}

.day-header span {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.exercise-item {
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding-left: 1rem;
  position: relative;
}

.exercise-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
}

.exercise-notes {
  font-size: 0.8rem;
  font-style: italic;
  color: var(--text-tertiary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--hover-bg);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

@media (max-width: 768px) {
  .modal-content {
    max-height: 95vh;
  }

  .modal-header h2 {
    font-size: 1.25rem;
  }

  .program-meta {
    gap: 1rem;
  }

  .meta-item {
    font-size: 0.9rem;
  }

  .day-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
