<template>
  <div class="exercise-card" :class="{ collapsed: isCollapsed }">
    <div class="exercise-header">
      <button class="collapse-btn" @click="toggleCollapse" aria-label="Toggle exercise">
        <ChevronIcon :class="{ rotated: isCollapsed }" />
      </button>
      <div class="exercise-info">
        <h3>{{ exercise.exercise.name }}</h3>
        <p class="exercise-meta">
          {{ exercise.exercise.category }} • {{ exercise.exercise.equipment }}
        </p>
      </div>
      <button class="icon-btn" @click="$emit('remove')" aria-label="Remove exercise">
        <TrashIcon />
      </button>
    </div>

    <Transition name="expand">
      <div v-show="!isCollapsed" class="exercise-body">
        <div class="sets-container">
          <SetRow
            v-for="(set, index) in exercise.sets"
            :key="set.id"
            :set="set"
            :index="index"
            :previous-set="index > 0 ? exercise.sets[index - 1] : undefined"
            @update="(updates) => $emit('update-set', set.id, updates)"
            @remove="$emit('remove-set', set.id)"
            @complete="onSetComplete(set)"
          />
        </div>

        <button class="btn btn-secondary add-set-btn" @click="$emit('add-set')">
          <PlusIcon />
          Add Set
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { WorkoutExercise, Set } from '@/types';
import SetRow from './SetRow.vue';
import ChevronIcon from './icons/ChevronIcon.vue';
import TrashIcon from './icons/TrashIcon.vue';
import PlusIcon from './icons/PlusIcon.vue';

defineProps<{
  exercise: WorkoutExercise;
}>();

const emit = defineEmits<{
  remove: [];
  'add-set': [];
  'update-set': [setId: string, updates: Partial<Set>];
  'remove-set': [setId: string];
}>();

const isCollapsed = ref(false);

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

function onSetComplete(set: Set) {
  if (set.completed) {
    // TODO: Start rest timer if enabled in settings
    console.log('Set completed, timer would start here');
  }
}
</script>

<style scoped>
.exercise-card {
  background: var(--card-bg, #1e293b);
  border-radius: var(--radius-lg, 0.75rem);
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.exercise-card.collapsed {
  padding-bottom: 0.75rem;
}

.exercise-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0;
}

.collapse-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary, #94a3b8);
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn .rotated {
  transform: rotate(-90deg);
}

.exercise-info {
  flex: 1;
  min-width: 0;
}

.exercise-info h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exercise-meta {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #94a3b8);
  text-transform: capitalize;
}

.icon-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary, #94a3b8);
  transition: color 0.2s;
}

.icon-btn:hover {
  color: var(--danger-color, #ef4444);
}

.exercise-body {
  margin-top: 1rem;
}

.sets-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.add-set-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 1000px;
  opacity: 1;
  margin-top: 1rem;
}
</style>
