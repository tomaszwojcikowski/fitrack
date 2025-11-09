<template>
  <div class="program-card" @click="$emit('select', program)">
    <div class="program-header">
      <h3>{{ program.name }}</h3>
      <span class="difficulty-badge" :class="`difficulty-${program.difficulty.toLowerCase()}`">
        {{ program.difficulty }}
      </span>
    </div>
    <p class="program-description">{{ program.description }}</p>
    <div class="program-stats">
      <div class="stat">
        <span class="stat-label">Duration</span>
        <span class="stat-value">{{ program.duration }} weeks</span>
      </div>
      <div class="stat">
        <span class="stat-label">Days/Week</span>
        <span class="stat-value">{{ program.daysPerWeek }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Goal</span>
        <span class="stat-value">{{ program.goal }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Program } from '../types';

defineProps<{
  program: Program;
}>();

defineEmits<{
  select: [program: Program];
}>();
</script>

<style scoped>
.program-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.program-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-color: var(--primary-color);
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.program-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
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
  margin-bottom: 1rem;
  line-height: 1.5;
}

.program-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .program-card {
    padding: 1rem;
  }

  .program-header h3 {
    font-size: 1.1rem;
  }

  .program-stats {
    gap: 0.75rem;
  }
}
</style>
