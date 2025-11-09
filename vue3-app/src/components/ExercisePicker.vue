<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="close">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Select Exercise</h2>
            <button class="close-btn" @click="close" aria-label="Close">×</button>
          </div>

          <div class="modal-body">
            <div class="search-section">
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                placeholder="Search exercises..."
                class="search-input"
                @keydown.esc="close"
              />
            </div>

            <div v-if="exerciseStore.favoriteExercises.length > 0" class="section">
              <h3 class="section-title">⭐ Favorites</h3>
              <div class="exercise-grid">
                <div
                  v-for="ex in exerciseStore.favoriteExercises"
                  :key="ex.id"
                  class="exercise-item"
                  @click="selectExercise(ex)"
                >
                  <div class="exercise-name">{{ ex.name }}</div>
                  <div class="exercise-meta">{{ ex.category }} • {{ ex.equipment }}</div>
                </div>
              </div>
            </div>

            <div v-if="exerciseStore.recentExercises.length > 0 && !searchQuery" class="section">
              <h3 class="section-title">🕐 Recent</h3>
              <div class="exercise-grid">
                <div
                  v-for="ex in exerciseStore.recentExercises"
                  :key="ex.id"
                  class="exercise-item"
                  @click="selectExercise(ex)"
                >
                  <div class="exercise-name">{{ ex.name }}</div>
                  <div class="exercise-meta">{{ ex.category }} • {{ ex.equipment }}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">{{ searchQuery ? 'Search Results' : 'All Exercises' }}</h3>
              <div v-if="filteredExercises.length === 0" class="empty-state">
                <p>No exercises found</p>
              </div>
              <div v-else class="exercise-grid">
                <div
                  v-for="ex in filteredExercises"
                  :key="ex.id"
                  class="exercise-item"
                  @click="selectExercise(ex)"
                >
                  <div class="exercise-name">{{ ex.name }}</div>
                  <div class="exercise-meta">{{ ex.category }} • {{ ex.equipment }}</div>
                  <button
                    class="favorite-btn"
                    :class="{ active: exerciseStore.isFavorite(ex.id) }"
                    @click.stop="exerciseStore.toggleFavorite(ex.id)"
                    :aria-label="exerciseStore.isFavorite(ex.id) ? 'Remove from favorites' : 'Add to favorites'"
                  >
                    {{ exerciseStore.isFavorite(ex.id) ? '★' : '☆' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useExerciseStore } from '@/stores/exercises';
import type { Exercise } from '@/types';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  select: [exercise: Exercise];
}>();

const exerciseStore = useExerciseStore();
const searchQuery = ref('');
const searchInput = ref<HTMLInputElement>();

const filteredExercises = computed(() => {
  const results = exerciseStore.searchExercises(searchQuery.value);
  // Exclude favorites and recent from main list when not searching
  if (!searchQuery.value) {
    const favoriteIds = new Set(exerciseStore.favoriteExercises.map((e: Exercise) => e.id));
    const recentIds = new Set(exerciseStore.recentExercises.map((e: Exercise) => e.id));
    return results.filter((ex: Exercise) => !favoriteIds.has(ex.id) && !recentIds.has(ex.id));
  }
  return results;
});

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  } else {
    searchQuery.value = '';
  }
});

function close() {
  emit('update:modelValue', false);
}

function selectExercise(exercise: Exercise) {
  exerciseStore.addToRecent(exercise.id);
  emit('select', exercise);
  close();
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
  background: var(--card-bg, #1e293b);
  border-radius: var(--radius-xl, 1rem);
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color, #334155);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary, #94a3b8);
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary, #f1f5f9);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.search-section {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--input-bg, #0f172a);
  border: 2px solid var(--border-color, #334155);
  border-radius: var(--radius-md, 0.5rem);
  color: var(--text-primary, #f1f5f9);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
}

.search-input::placeholder {
  color: var(--text-tertiary, #64748b);
}

.section {
  margin-bottom: 2rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary, #94a3b8);
}

.exercise-grid {
  display: grid;
  gap: 0.75rem;
}

.exercise-item {
  position: relative;
  padding: 1rem;
  background: var(--bg-color, #0f172a);
  border-radius: var(--radius-md, 0.5rem);
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.exercise-item:hover {
  background: var(--hover-bg, #1e293b);
  border-color: var(--primary-color, #3b82f6);
  transform: translateY(-2px);
}

.exercise-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text-primary, #f1f5f9);
  padding-right: 2rem;
}

.exercise-meta {
  font-size: 0.875rem;
  color: var(--text-secondary, #94a3b8);
  text-transform: capitalize;
}

.favorite-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-tertiary, #64748b);
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s;
  line-height: 1;
}

.favorite-btn:hover {
  color: var(--warning-color, #f59e0b);
  transform: scale(1.2);
}

.favorite-btn.active {
  color: var(--warning-color, #f59e0b);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary, #94a3b8);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.9);
}
</style>
