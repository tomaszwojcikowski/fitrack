# Vue 3 Migration Implementation Plan

## Overview

This document provides a detailed, step-by-step plan to migrate FiTrack from vanilla JavaScript to Vue 3 + TypeScript while maintaining all existing functionality and improving code quality.

## Migration Strategy

### Approach: Parallel Development with Incremental Migration

1. **Create new Vue 3 app** in a separate branch
2. **Migrate features incrementally** and test thoroughly
3. **Keep old app running** until new app is feature-complete
4. **Deploy simultaneously** when ready
5. **Gradual rollout** with feature flags if needed

### Success Criteria

✅ All 174 existing tests pass (converted to Vue Test Utils)
✅ No feature regressions
✅ Performance equal or better than current
✅ Bundle size < 150KB (currently ~100KB)
✅ Lighthouse score 100/100 maintained
✅ All data migration works seamlessly

---

## Phase 0: Preparation & POC (Week 0)

### Goal: Validate approach with proof of concept

#### Day 1-2: Proof of Concept

**Objective**: Build a minimal workout view in Vue 3 to validate:
- Architecture decisions
- Performance characteristics
- Developer experience
- Migration complexity

**Tasks**:
- [ ] Create minimal Vite + Vue 3 + TypeScript project
- [ ] Implement basic workout view
- [ ] Implement one exercise card component
- [ ] Test localStorage integration
- [ ] Measure bundle size
- [ ] Measure performance

**Deliverable**: Working POC with metrics for go/no-go decision

#### Day 3: Decision Point

**Review**:
- Code quality improvement
- Developer experience
- Performance metrics
- Complexity assessment
- Team feedback

**Outcome**: Go/No-Go decision for full migration

---

## Phase 1: Foundation (Week 1)

### Goal: Set up project infrastructure and core architecture

#### Day 1: Project Setup

**Morning: Initialize Project**
```bash
npm create vite@latest fitrack-vue3 -- --template vue-ts
cd fitrack-vue3
npm install
```

**Install Dependencies**:
```bash
# Core
npm install vue@^3.4 vue-router@^4.3 pinia@^2.1

# UI & Utilities
npm install @vueuse/core

# Development
npm install -D @vue/test-utils vitest @vitest/ui happy-dom
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint-plugin-vue prettier eslint-config-prettier
npm install -D vite-plugin-pwa workbox-window

# Type definitions
npm install -D @types/node
```

**Configure TypeScript** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Configure Vite** (`vite.config.ts`):
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FiTrack - Fitness Tracker',
        short_name: 'FiTrack',
        description: 'Track your workouts offline',
        theme_color: '#3b82f6',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
});
```

**Tasks**:
- [x] Initialize Vue 3 + Vite + TypeScript project
- [ ] Configure TypeScript strict mode
- [ ] Configure path aliases (@/)
- [ ] Set up ESLint + Prettier
- [ ] Configure Vitest for Vue
- [ ] Create initial folder structure
- [ ] Set up Git (new branch)

**Time**: 1 day

---

#### Day 2: Type Definitions

**Create Type System** (`src/types/index.ts`):

```typescript
// Exercise Types
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment;
  description?: string;
  muscleGroups: MuscleGroup[];
}

export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'olympic'
  | 'cardio';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'bands'
  | 'other';

export type MuscleGroup = string;

// Workout Types
export interface Set {
  id: string;
  reps: number | '';
  weight: number | '';
  time?: number | '';
  completed: boolean;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: Set[];
  notes?: string;
  order: number;
}

export interface Workout {
  id: string;
  date: string;
  exercises: WorkoutExercise[];
  startTime?: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  programId?: string;
  programWeek?: number;
  programDay?: number;
}

// Program Types
export interface ProgramDay {
  name: string;
  exercises: ProgramExercise[];
}

export interface ProgramWeek {
  name: string;
  days: ProgramDay[];
}

export interface Program {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  weeks: ProgramWeek[];
}

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
}

// Active Program State
export interface ActiveProgram {
  programId: string;
  currentWeek: number;
  currentDay: number;
  startedAt: string;
  completedDays: string[];
}

// Stats Types
export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  previousRecord?: {
    weight: number;
    reps: number;
    date: string;
  };
}

export interface WorkoutStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalVolume: number;
  averageDuration: number;
  favoriteExercises: string[];
}

// Settings Types
export interface Settings {
  autoStartTimer: boolean;
  defaultRestTime: number;
  theme: 'dark' | 'light';
  units: 'metric' | 'imperial';
  notifications: boolean;
  syncEnabled: boolean;
  githubToken?: string;
  gistId?: string;
}

// Sync Types
export interface SyncState {
  lastSyncTime: string | null;
  isSyncing: boolean;
  syncError: string | null;
}
```

**Tasks**:
- [ ] Create comprehensive type definitions
- [ ] Document all types with JSDoc
- [ ] Export types from index
- [ ] Create utility types
- [ ] Add validation helpers

**Time**: 1 day

---

#### Day 3: Router & Store Setup

**Vue Router** (`src/router/index.ts`):

```typescript
import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'workout',
    component: () => import('@/views/WorkoutView.vue'),
    meta: { title: 'Workout' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Dashboard' },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { title: 'History' },
  },
  {
    path: '/programs',
    name: 'programs',
    component: () => import('@/views/ProgramsView.vue'),
    meta: { title: 'Programs' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'Settings' },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = `FiTrack - ${to.meta.title || 'Fitness Tracker'}`;
  next();
});

export default router;
```

**Pinia Stores Setup** (`src/stores/workout.ts`):

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Workout, WorkoutExercise, Set } from '@/types';
import { useStorage } from '@vueuse/core';

export const useWorkoutStore = defineStore('workout', () => {
  // State
  const currentWorkout = useStorage<WorkoutExercise[]>(
    'fitrack-workout',
    [],
    localStorage,
    { mergeDefaults: true }
  );
  
  const workoutDate = ref(new Date().toISOString().split('T')[0]);
  const workoutStartTime = ref<string | null>(null);
  
  // Getters
  const hasExercises = computed(() => currentWorkout.value.length > 0);
  
  const totalSets = computed(() =>
    currentWorkout.value.reduce((sum, ex) => sum + ex.sets.length, 0)
  );
  
  const completedSets = computed(() =>
    currentWorkout.value.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    )
  );
  
  const workoutDuration = computed(() => {
    if (!workoutStartTime.value) return 0;
    const start = new Date(workoutStartTime.value);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / 1000);
  });

  // Actions
  function startWorkout() {
    if (!workoutStartTime.value) {
      workoutStartTime.value = new Date().toISOString();
    }
  }

  function addExercise(exercise: Exercise) {
    const newExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exercise,
      sets: [
        {
          id: crypto.randomUUID(),
          reps: '',
          weight: '',
          completed: false,
        },
      ],
      order: currentWorkout.value.length,
    };
    
    currentWorkout.value.push(newExercise);
    startWorkout();
  }

  function removeExercise(exerciseId: string) {
    const index = currentWorkout.value.findIndex((ex) => ex.id === exerciseId);
    if (index !== -1) {
      currentWorkout.value.splice(index, 1);
    }
  }

  function addSet(exerciseId: string) {
    const exercise = currentWorkout.value.find((ex) => ex.id === exerciseId);
    if (exercise) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      exercise.sets.push({
        id: crypto.randomUUID(),
        reps: lastSet?.reps || '',
        weight: lastSet?.weight || '',
        completed: false,
      });
    }
  }

  function updateSet(exerciseId: string, setId: string, updates: Partial<Set>) {
    const exercise = currentWorkout.value.find((ex) => ex.id === exerciseId);
    if (exercise) {
      const set = exercise.sets.find((s) => s.id === setId);
      if (set) {
        Object.assign(set, updates);
      }
    }
  }

  function removeSet(exerciseId: string, setId: string) {
    const exercise = currentWorkout.value.find((ex) => ex.id === exerciseId);
    if (exercise && exercise.sets.length > 1) {
      const index = exercise.sets.findIndex((s) => s.id === setId);
      if (index !== -1) {
        exercise.sets.splice(index, 1);
      }
    }
  }

  function clearWorkout() {
    currentWorkout.value = [];
    workoutStartTime.value = null;
  }

  return {
    // State
    currentWorkout,
    workoutDate,
    workoutStartTime,
    
    // Getters
    hasExercises,
    totalSets,
    completedSets,
    workoutDuration,
    
    // Actions
    startWorkout,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    clearWorkout,
  };
});
```

**Tasks**:
- [ ] Set up Vue Router with hash mode
- [ ] Create all route definitions
- [ ] Set up Pinia store plugin
- [ ] Create workout store
- [ ] Create history store
- [ ] Create settings store
- [ ] Add persistence with @vueuse/core

**Time**: 1 day

---

#### Day 4: Base Components & Layout

**Create Layout** (`src/App.vue`):

```vue
<template>
  <div id="app" class="app">
    <AppHeader />
    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <RestTimer v-if="timerStore.isActive" />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import RestTimer from '@/components/RestTimer.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import { useTimerStore } from '@/stores/timer';

const timerStore = useTimerStore();

onMounted(() => {
  // Initialize app
});
</script>

<style>
/* Import styles */
@import '@/assets/styles/base.css';
@import '@/assets/styles/components.css';
@import '@/assets/styles/utilities.css';

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

**Create Base Components**:

1. `BaseButton.vue` - Reusable button component
2. `BaseInput.vue` - Reusable input component
3. `BaseCard.vue` - Reusable card component
4. `BaseModal.vue` - Reusable modal component
5. `AppHeader.vue` - Application header
6. `LoadingSpinner.vue` - Loading indicator

**Tasks**:
- [ ] Create App.vue layout
- [ ] Create AppHeader component
- [ ] Create base components (Button, Input, etc.)
- [ ] Migrate CSS variables
- [ ] Set up global styles
- [ ] Test responsive layout

**Time**: 1 day

---

#### Day 5: Testing Setup & First Tests

**Vitest Configuration** (`vitest.config.ts`):

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Test Setup** (`tests/setup.ts`):

```typescript
import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

**Example Test** (`tests/stores/workout.test.ts`):

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useWorkoutStore } from '@/stores/workout';
import type { Exercise } from '@/types';

describe('Workout Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('should initialize with empty workout', () => {
    const store = useWorkoutStore();
    expect(store.currentWorkout).toEqual([]);
    expect(store.hasExercises).toBe(false);
  });

  it('should add exercise to workout', () => {
    const store = useWorkoutStore();
    const exercise: Exercise = {
      id: '1',
      name: 'Bench Press',
      category: 'chest',
      equipment: 'barbell',
      muscleGroups: ['chest'],
    };

    store.addExercise(exercise);

    expect(store.currentWorkout.length).toBe(1);
    expect(store.currentWorkout[0].exercise.name).toBe('Bench Press');
    expect(store.currentWorkout[0].sets.length).toBe(1);
  });

  // More tests...
});
```

**Tasks**:
- [ ] Configure Vitest for Vue components
- [ ] Set up test helpers and mocks
- [ ] Write tests for stores
- [ ] Write tests for composables
- [ ] Ensure all tests pass
- [ ] Set up coverage reporting

**Time**: 1 day

---

## Phase 2: Core Features (Week 2)

### Goal: Migrate workout view and core functionality

#### Day 6-7: Workout View Components

**ExerciseCard Component** (`src/components/ExerciseCard.vue`):

```vue
<template>
  <div class="exercise-card" :class="{ collapsed: isCollapsed }">
    <div class="exercise-header">
      <button class="collapse-btn" @click="toggleCollapse">
        <ChevronIcon :direction="isCollapsed ? 'right' : 'down'" />
      </button>
      <div class="exercise-info">
        <h3>{{ exercise.exercise.name }}</h3>
        <p class="exercise-meta">
          {{ exercise.exercise.category }} • {{ exercise.exercise.equipment }}
        </p>
      </div>
      <button class="icon-btn" @click="$emit('remove')">
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
import { useTimerStore } from '@/stores/timer';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  exercise: WorkoutExercise;
}>();

const emit = defineEmits<{
  remove: [];
  'add-set': [];
  'update-set': [setId: string, updates: Partial<Set>];
  'remove-set': [setId: string];
}>();

const isCollapsed = ref(false);
const timerStore = useTimerStore();
const settingsStore = useSettingsStore();

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

function onSetComplete(set: Set) {
  if (settingsStore.settings.autoStartTimer && set.completed) {
    timerStore.start(settingsStore.settings.defaultRestTime);
  }
}
</script>

<style scoped>
/* Component styles */
</style>
```

**SetRow Component** (`src/components/SetRow.vue`):

```vue
<template>
  <div class="set-row" :class="{ completed: set.completed }">
    <div class="set-number">{{ index + 1 }}</div>

    <div class="set-inputs">
      <input
        type="number"
        v-model.number="localReps"
        @blur="updateSet"
        placeholder="Reps"
        class="set-input"
      />
      <input
        type="number"
        v-model.number="localWeight"
        @blur="updateSet"
        placeholder="Weight"
        class="set-input"
        step="0.5"
      />
    </div>

    <div class="set-actions">
      <button
        class="complete-btn"
        :class="{ active: set.completed }"
        @click="toggleComplete"
      >
        <CheckIcon v-if="set.completed" />
      </button>
      <button class="icon-btn-small" @click="$emit('remove')">
        <TrashIcon />
      </button>
    </div>

    <div v-if="showSuggestion" class="set-suggestion">
      Previous: {{ previousSet?.weight }}kg × {{ previousSet?.reps }}
    </div>
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
  () => props.previousSet && props.previousSet.completed
);

watch(
  () => props.set,
  (newSet) => {
    localReps.value = newSet.reps;
    localWeight.value = newSet.weight;
  }
);

function updateSet() {
  emit('update', {
    reps: localReps.value,
    weight: localWeight.value,
  });
}

function toggleComplete() {
  emit('update', { completed: !props.set.completed });
  if (!props.set.completed) {
    emit('complete');
  }
}
</script>
```

**Tasks**:
- [ ] Create ExerciseCard component
- [ ] Create SetRow component
- [ ] Add collapse/expand functionality
- [ ] Implement set completion
- [ ] Add previous set suggestions
- [ ] Write component tests

**Time**: 2 days

---

#### Day 8: Exercise Picker Modal

**ExercisePicker Component** (`src/components/ExercisePicker.vue`):

```vue
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Select Exercise</h2>
          <button class="close-btn" @click="close">
            <XIcon />
          </button>
        </div>

        <div class="modal-search">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search exercises..."
            class="search-input"
          />
        </div>

        <div class="modal-body">
          <div v-if="favoriteExercises.length" class="exercise-section">
            <h3>⭐ Favorites</h3>
            <div class="exercise-grid">
              <ExerciseItem
                v-for="exercise in favoriteExercises"
                :key="exercise.id"
                :exercise="exercise"
                @select="selectExercise"
              />
            </div>
          </div>

          <div v-if="recentExercises.length" class="exercise-section">
            <h3>🕒 Recent</h3>
            <div class="exercise-grid">
              <ExerciseItem
                v-for="exercise in recentExercises"
                :key="exercise.id"
                :exercise="exercise"
                @select="selectExercise"
              />
            </div>
          </div>

          <div class="exercise-section">
            <h3>All Exercises</h3>
            <div class="exercise-grid">
              <ExerciseItem
                v-for="exercise in filteredExercises"
                :key="exercise.id"
                :exercise="exercise"
                @select="selectExercise"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useExerciseStore } from '@/stores/exercise';
import ExerciseItem from './ExerciseItem.vue';
import XIcon from './icons/XIcon.vue';
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

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const filteredExercises = computed(() => {
  if (!searchQuery.value) {
    return exerciseStore.exercises;
  }
  
  const query = searchQuery.value.toLowerCase();
  return exerciseStore.exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(query) ||
      ex.category.toLowerCase().includes(query) ||
      ex.equipment.toLowerCase().includes(query)
  );
});

const favoriteExercises = computed(() =>
  exerciseStore.favoriteExercises.slice(0, 6)
);

const recentExercises = computed(() =>
  exerciseStore.recentExercises.slice(0, 6)
);

watch(isOpen, async (open) => {
  if (open) {
    await nextTick();
    searchInput.value?.focus();
  }
});

function close() {
  isOpen.value = false;
  searchQuery.value = '';
}

function selectExercise(exercise: Exercise) {
  emit('select', exercise);
  exerciseStore.addToRecent(exercise.id);
  close();
}
</script>
```

**Tasks**:
- [ ] Create ExercisePicker modal component
- [ ] Implement exercise search
- [ ] Add favorites support
- [ ] Add recent exercises
- [ ] Implement keyboard navigation
- [ ] Write component tests

**Time**: 1 day

---

#### Day 9: Rest Timer Component

**RestTimer Component** (`src/components/RestTimer.vue`):

```vue
<template>
  <Transition name="slide-up">
    <div v-if="timerStore.isActive" class="rest-timer">
      <div class="timer-content">
        <div class="timer-circle">
          <svg class="timer-svg" viewBox="0 0 100 100">
            <circle class="timer-bg" cx="50" cy="50" r="45" />
            <circle
              class="timer-progress"
              cx="50" cy="50" r="45"
              :style="{ strokeDashoffset: progressOffset }"
            />
          </svg>
          <div class="timer-text">
            <div class="timer-display">{{ formattedTime }}</div>
            <div class="timer-label">Rest Time</div>
          </div>
        </div>

        <div class="timer-controls">
          <button class="timer-btn" @click="timerStore.add(15)">+15s</button>
          <button class="timer-btn" @click="timerStore.add(30)">+30s</button>
          <button class="timer-btn" @click="timerStore.skip">Skip</button>
        </div>

        <button class="btn btn-secondary" @click="timerStore.stop">
          Stop Timer
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimerStore } from '@/stores/timer';

const timerStore = useTimerStore();

const formattedTime = computed(() => {
  const minutes = Math.floor(timerStore.seconds / 60);
  const seconds = timerStore.seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const progressOffset = computed(() => {
  const circumference = 2 * Math.PI * 45;
  const progress = timerStore.seconds / timerStore.initialSeconds;
  return circumference * (1 - progress);
});
</script>
```

**Timer Store** (`src/stores/timer.ts`):

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useSound } from '@/composables/useSound';

export const useTimerStore = defineStore('timer', () => {
  const seconds = ref(0);
  const initialSeconds = ref(90);
  const isActive = ref(false);
  let intervalId: number | null = null;

  const { play: playSound } = useSound('/timer-sound.wav');

  function start(duration: number = 90) {
    seconds.value = duration;
    initialSeconds.value = duration;
    isActive.value = true;
    tick();
  }

  function tick() {
    if (intervalId) {
      clearInterval(intervalId);
    }

    intervalId = window.setInterval(() => {
      if (seconds.value > 0) {
        seconds.value--;
      } else {
        complete();
      }
    }, 1000);
  }

  function add(amount: number) {
    seconds.value += amount;
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isActive.value = false;
    seconds.value = 0;
  }

  function skip() {
    stop();
  }

  function complete() {
    playSound();
    stop();
  }

  return {
    seconds,
    initialSeconds,
    isActive,
    start,
    add,
    stop,
    skip,
  };
});
```

**Tasks**:
- [ ] Create RestTimer component
- [ ] Implement timer logic in store
- [ ] Add circular progress animation
- [ ] Add sound notifications
- [ ] Add timer controls
- [ ] Write timer tests

**Time**: 1 day

---

#### Day 10: Workout View Integration

**WorkoutView** (`src/views/WorkoutView.vue`):

```vue
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
    </div>

    <TransitionGroup v-else name="list" tag="div" class="exercises-list">
      <ExerciseCard
        v-for="exercise in workoutStore.currentWorkout"
        :key="exercise.id"
        :exercise="exercise"
        @remove="workoutStore.removeExercise(exercise.id)"
        @add-set="workoutStore.addSet(exercise.id)"
        @update-set="(setId, updates) => 
          workoutStore.updateSet(exercise.id, setId, updates)"
        @remove-set="(setId) => 
          workoutStore.removeSet(exercise.id, setId)"
      />
    </TransitionGroup>

    <div class="workout-actions">
      <button class="fab" @click="openExercisePicker">
        <PlusIcon />
      </button>
      <button
        v-if="workoutStore.hasExercises"
        class="btn btn-primary"
        @click="finishWorkout"
      >
        <CheckIcon />
        Finish Workout
      </button>
    </div>

    <ExercisePicker
      v-model="showExercisePicker"
      @select="workoutStore.addExercise"
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
import PlusIcon from '@/components/icons/PlusIcon.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';

const router = useRouter();
const workoutStore = useWorkoutStore();
const historyStore = useHistoryStore();
const showExercisePicker = ref(false);

function openExercisePicker() {
  showExercisePicker.value = true;
}

async function finishWorkout() {
  await historyStore.saveWorkout({
    date: workoutStore.workoutDate,
    exercises: workoutStore.currentWorkout,
    startTime: workoutStore.workoutStartTime,
    endTime: new Date().toISOString(),
  });
  
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
```

**Tasks**:
- [ ] Create WorkoutView component
- [ ] Integrate all workout components
- [ ] Add finish workout functionality
- [ ] Add workout duration tracking
- [ ] Implement transitions
- [ ] Write integration tests

**Time**: 1 day

---

## Phase 3: History & Dashboard (Week 3)

### Day 11-12: History View

**HistoryView** (`src/views/HistoryView.vue`):

```vue
<template>
  <div class="history-view">
    <div class="view-header">
      <h1>Workout History</h1>
      <div class="view-toggle">
        <button
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          List
        </button>
        <button
          :class="{ active: viewMode === 'calendar' }"
          @click="viewMode = 'calendar'"
        >
          Calendar
        </button>
      </div>
    </div>

    <div class="history-filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search exercises..."
        class="search-input"
      />
      <select v-model="dateFilter" class="filter-select">
        <option value="all">All Time</option>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>
    </div>

    <div v-if="viewMode === 'list'" class="history-list">
      <div
        v-for="workout in filteredWorkouts"
        :key="workout.id"
        class="workout-item"
        @click="viewWorkout(workout)"
      >
        <div class="workout-date">{{ formatDate(workout.date) }}</div>
        <div class="workout-summary">
          {{ workout.exercises.length }} exercises •
          {{ totalSets(workout) }} sets
        </div>
      </div>
    </div>

    <CalendarView
      v-else
      :workouts="historyStore.workouts"
      @select="viewWorkout"
    />

    <WorkoutDetailModal
      v-model="showDetailModal"
      :workout="selectedWorkout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHistoryStore } from '@/stores/history';
import CalendarView from '@/components/CalendarView.vue';
import WorkoutDetailModal from '@/components/WorkoutDetailModal.vue';
import type { Workout } from '@/types';

const historyStore = useHistoryStore();
const viewMode = ref<'list' | 'calendar'>('list');
const searchQuery = ref('');
const dateFilter = ref('all');
const showDetailModal = ref(false);
const selectedWorkout = ref<Workout | null>(null);

const filteredWorkouts = computed(() => {
  // Implement filtering logic
  return historyStore.workouts;
});

function viewWorkout(workout: Workout) {
  selectedWorkout.value = workout;
  showDetailModal.value = true;
}

function totalSets(workout: Workout): number {
  return workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}
</script>
```

**Tasks**:
- [ ] Create HistoryView component
- [ ] Implement list view
- [ ] Implement calendar view
- [ ] Add search and filtering
- [ ] Create workout detail modal
- [ ] Write history tests

**Time**: 2 days

---

### Day 13-14: Dashboard View

**DashboardView** (`src/views/DashboardView.vue`):

```vue
<template>
  <div class="dashboard-view">
    <div class="stats-grid">
      <StatCard
        title="Total Workouts"
        :value="stats.totalWorkouts"
        icon="💪"
      />
      <StatCard
        title="Current Streak"
        :value="stats.currentStreak"
        icon="🔥"
        :suffix="stats.currentStreak === 1 ? 'day' : 'days'"
      />
      <StatCard
        title="Total Volume"
        :value="stats.totalVolume"
        icon="🏋️"
        suffix="kg"
      />
      <StatCard
        title="Avg Duration"
        :value="formatDuration(stats.averageDuration)"
        icon="⏱️"
      />
    </div>

    <div class="dashboard-section">
      <h2>Weekly Activity</h2>
      <WeeklyHeatmap :workouts="historyStore.workouts" />
    </div>

    <div class="dashboard-section">
      <h2>Progress Chart</h2>
      <ExerciseSelect v-model="selectedExercise" />
      <ProgressChart
        v-if="selectedExercise"
        :exercise-id="selectedExercise"
      />
    </div>

    <div class="dashboard-section">
      <h2>🏆 Personal Records</h2>
      <PersonalRecordsList :records="recentPRs" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHistoryStore } from '@/stores/history';
import { useStatsCalculator } from '@/composables/useStatsCalculator';
import StatCard from '@/components/StatCard.vue';
import WeeklyHeatmap from '@/components/WeeklyHeatmap.vue';
import ProgressChart from '@/components/ProgressChart.vue';
import PersonalRecordsList from '@/components/PersonalRecordsList.vue';
import ExerciseSelect from '@/components/ExerciseSelect.vue';

const historyStore = useHistoryStore();
const selectedExercise = ref('');

const { stats, recentPRs } = useStatsCalculator(historyStore.workouts);

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
</script>
```

**Tasks**:
- [ ] Create DashboardView component
- [ ] Implement statistics calculation
- [ ] Create WeeklyHeatmap component
- [ ] Create ProgressChart component (Chart.js)
- [ ] Create PersonalRecordsList component
- [ ] Write dashboard tests

**Time**: 2 days

---

### Day 15: Settings & Programs Views

**SettingsView** (`src/views/SettingsView.vue`):

```vue
<template>
  <div class="settings-view">
    <h1>Settings</h1>

    <div class="settings-section">
      <h2>☁️ Cloud Sync</h2>
      <CloudSyncSettings />
    </div>

    <div class="settings-section">
      <h2>Workout Preferences</h2>
      <SettingToggle
        v-model="settings.autoStartTimer"
        label="Auto-start Rest Timer"
        description="Automatically start timer after completing a set"
      />
      <SettingNumber
        v-model="settings.defaultRestTime"
        label="Default Rest Time"
        description="Default rest time in seconds"
        :min="30"
        :max="300"
        :step="15"
      />
    </div>

    <div class="settings-section">
      <h2>Data Management</h2>
      <button class="btn btn-secondary" @click="exportData">
        Export Data (JSON)
      </button>
      <button class="btn btn-secondary" @click="exportCSV">
        Export Data (CSV)
      </button>
      <button class="btn btn-danger" @click="confirmClearData">
        Clear All Data
      </button>
    </div>

    <div class="settings-section">
      <h2>About</h2>
      <p>FiTrack v2.0.0</p>
      <p>Built with Vue 3 + TypeScript</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import CloudSyncSettings from '@/components/CloudSyncSettings.vue';
import SettingToggle from '@/components/SettingToggle.vue';
import SettingNumber from '@/components/SettingNumber.vue';

const settingsStore = useSettingsStore();
const settings = settingsStore.settings;

async function exportData() {
  // Implementation
}

async function exportCSV() {
  // Implementation
}

async function confirmClearData() {
  // Implementation
}
</script>
```

**Tasks**:
- [ ] Create SettingsView component
- [ ] Implement Cloud Sync UI
- [ ] Add settings controls
- [ ] Implement data export
- [ ] Create ProgramsView (simpler)
- [ ] Write settings tests

**Time**: 1 day

---

## Phase 4: Polish & Deploy (Week 4)

### Day 16-17: PWA & Offline Support

**Service Worker** (via Vite PWA Plugin):

Already configured in `vite.config.ts`. Additional tasks:

**Tasks**:
- [ ] Configure service worker caching strategy
- [ ] Add offline page
- [ ] Implement background sync
- [ ] Add install prompt
- [ ] Test offline functionality
- [ ] Test app install

**Time**: 2 days

---

### Day 18-19: Testing & Optimization

**Tasks**:
- [ ] Run full test suite
- [ ] Fix any failing tests
- [ ] Add missing tests
- [ ] Achieve 90%+ code coverage
- [ ] Performance audit (Lighthouse)
- [ ] Bundle size optimization
- [ ] Accessibility audit
- [ ] Cross-browser testing

**Time**: 2 days

---

### Day 20: Documentation & Deployment

**Tasks**:
- [ ] Update README with new tech stack
- [ ] Create migration guide
- [ ] Document new component APIs
- [ ] Update deployment scripts
- [ ] Deploy to production (GitHub Pages)
- [ ] Monitor for errors
- [ ] Create rollback plan if needed

**Time**: 1 day

---

## Data Migration Strategy

### Backward Compatibility

The new Vue 3 app must read existing localStorage data:

```typescript
// src/utils/migration.ts
export function migrateLocalStorage() {
  try {
    // Migrate workout data
    const oldWorkout = localStorage.getItem('fitrack-workout');
    if (oldWorkout) {
      const parsed = JSON.parse(oldWorkout);
      // Transform if needed
      localStorage.setItem('fitrack-workout-v2', JSON.stringify(parsed));
    }

    // Migrate history
    const oldHistory = localStorage.getItem('fitrack-history');
    if (oldHistory) {
      const parsed = JSON.parse(oldHistory);
      // Transform if needed
      localStorage.setItem('fitrack-history-v2', JSON.stringify(parsed));
    }

    // Migrate settings
    const oldSettings = localStorage.getItem('fitrack-settings');
    if (oldSettings) {
      const parsed = JSON.parse(oldSettings);
      localStorage.setItem('fitrack-settings-v2', JSON.stringify(parsed));
    }

    console.log('Data migration complete');
  } catch (error) {
    console.error('Migration error:', error);
    // Handle migration failure
  }
}
```

---

## Rollback Plan

If critical issues arise:

1. **Immediate**: Revert to previous vanilla JS version
2. **Short-term**: Fix issues in Vue 3 version
3. **Long-term**: Continue migration with fixes

**Rollback Checklist**:
- [ ] Keep old codebase in separate branch
- [ ] Use feature flags for gradual rollout
- [ ] Monitor error rates
- [ ] Have automated rollback script ready
- [ ] Communicate with users about changes

---

## Success Metrics

### Code Quality
- ✅ All 174+ tests passing
- ✅ 90%+ code coverage
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors
- ✅ All components documented

### Performance
- ✅ Bundle size < 150KB (target: 108KB)
- ✅ First Contentful Paint < 1s
- ✅ Time to Interactive < 2s
- ✅ Lighthouse score 100/100

### User Experience
- ✅ No feature regressions
- ✅ All data migrates successfully
- ✅ Improved accessibility score
- ✅ Better mobile experience

### Developer Experience
- ✅ 2-3x faster feature development
- ✅ Better type safety
- ✅ Easier testing
- ✅ Better IDE support

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 0: POC | 3 days | Proof of concept, go/no-go decision |
| Phase 1: Foundation | 1 week | Project setup, types, stores, base components |
| Phase 2: Core Features | 1 week | Workout view, exercise picker, rest timer |
| Phase 3: Views | 1 week | History, dashboard, settings, programs |
| Phase 4: Polish | 1 week | PWA, testing, optimization, deployment |
| **Total** | **4-5 weeks** | **Production-ready Vue 3 app** |

---

## Conclusion

This migration plan provides a clear, step-by-step path to modernize FiTrack with Vue 3 + TypeScript. The phased approach minimizes risk while delivering significant improvements in code quality, maintainability, and developer experience.

**Next Steps**:
1. ✅ Approve this plan
2. ⬜ Create proof of concept (Day 1-3)
3. ⬜ Review POC and make go/no-go decision
4. ⬜ Begin Phase 1 implementation
5. ⬜ Weekly progress reviews

---

**Status**: Ready for approval and implementation 🚀
