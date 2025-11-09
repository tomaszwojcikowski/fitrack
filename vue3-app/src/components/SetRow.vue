<template>
  <div class="set-row" :class="{ completed: set.completed }">
    <div class="set-number">{{ index + 1 }}</div>

    <div class="set-inputs">
      <input
        v-model.number="localReps"
        type="number"
        placeholder="Reps"
        class="set-input"
        @blur="updateSet"
        @keyup.enter="updateSet"
        :disabled="set.completed"
      />
      <input
        v-model.number="localWeight"
        type="number"
        placeholder="Weight"
        class="set-input"
        step="0.5"
        @blur="updateSet"
        @keyup.enter="updateSet"
        :disabled="set.completed"
      />
    </div>

    <div class="set-actions">
      <button
        class="complete-btn"
        :class="{ active: set.completed }"
        @click="toggleComplete"
        :aria-label="set.completed ? 'Mark as incomplete' : 'Mark as complete'"
      >
        <CheckIcon v-if="set.completed" />
      </button>
      <button 
        class="icon-btn-small" 
        @click="$emit('remove')"
        aria-label="Remove set"
      >
        <TrashIcon />
      </button>
    </div>

    <Transition name="fade">
      <div v-if="showSuggestion && !set.completed" class="set-suggestion">
        Previous: {{ previousSet?.weight }}kg × {{ previousSet?.reps }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Set } from '@/types';
import CheckIcon from './icons/CheckIcon.vue';
import TrashIcon from './icons/TrashIcon.vue';

const props = defineProps<{
  set: Set;
  index: number;
  previousSet?: Set;
}>();

const emit = defineEmits<{
  update: [updates: Partial<Set>];
  remove: [];
  complete: [];
}>();

const localReps = ref(props.set.reps);
const localWeight = ref(props.set.weight);

const showSuggestion = computed(
  () => props.previousSet && props.previousSet.completed && !props.set.completed
);

watch(
  () => props.set,
  (newSet) => {
    localReps.value = newSet.reps;
    localWeight.value = newSet.weight;
  },
  { deep: true }
);

function updateSet() {
  if (localReps.value !== props.set.reps || localWeight.value !== props.set.weight) {
    emit('update', {
      reps: localReps.value,
      weight: localWeight.value,
    });
  }
}

function toggleComplete() {
  emit('update', { completed: !props.set.completed });
  if (!props.set.completed) {
    emit('complete');
  }
}
</script>

<style scoped>
.set-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-color, #0f172a);
  border-radius: var(--radius-md, 0.5rem);
  border: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.set-row:hover {
  border-color: var(--border-color, #334155);
}

.set-row.completed {
  background: var(--success-bg, rgba(34, 197, 94, 0.1));
  border-color: var(--success-color, #22c55e);
}

.set-row.completed .set-input {
  color: var(--text-secondary, #94a3b8);
}

.set-number {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary, #94a3b8);
  min-width: 1.5rem;
  text-align: center;
}

.set-inputs {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.set-input {
  flex: 1;
  padding: 0.5rem;
  background: var(--input-bg, #1e293b);
  border: 1px solid var(--border-color, #334155);
  border-radius: var(--radius-sm, 0.375rem);
  color: var(--text-primary, #f1f5f9);
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.set-input:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
}

.set-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.set-input::placeholder {
  color: var(--text-tertiary, #64748b);
}

.set-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.complete-btn {
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: 2px solid var(--border-color, #334155);
  border-radius: var(--radius-sm, 0.375rem);
  color: var(--text-secondary, #94a3b8);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.complete-btn:hover {
  border-color: var(--success-color, #22c55e);
  background: var(--success-bg, rgba(34, 197, 94, 0.1));
}

.complete-btn.active {
  background: var(--success-color, #22c55e);
  border-color: var(--success-color, #22c55e);
  color: white;
}

.icon-btn-small {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--text-secondary, #94a3b8);
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn-small:hover {
  color: var(--danger-color, #ef4444);
}

.set-suggestion {
  position: absolute;
  bottom: -1.5rem;
  left: 3rem;
  font-size: 0.75rem;
  color: var(--text-tertiary, #64748b);
  font-style: italic;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
