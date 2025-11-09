# FiTrack Vue 3 Migration Guide

## Overview

This guide provides step-by-step instructions for migrating FiTrack from vanilla JavaScript to Vue 3 + TypeScript. The migration has been initiated with a foundational structure in the `vue3-app` directory.

## Current Status

✅ **Completed:**
- Vue 3 + TypeScript + Vite project initialized
- Required dependencies installed (vue-router, pinia, @vueuse/core)
- Testing infrastructure set up (vitest, @vue/test-utils, happy-dom)
- Directory structure created
- Type definitions created (`src/types/index.ts`)
- Router configuration created (`src/router/index.ts`)
- Workout store created (`src/stores/workout.ts`)

⏳ **Remaining Work (4-5 weeks):**
- Copy and migrate exercise database
- Create all Vue components
- Migrate all views
- Set up styling
- Write tests
- Configure PWA
- Deploy

## Directory Structure

```
vue3-app/
├── src/
│   ├── assets/          # Static assets and styles
│   │   └── styles/      # CSS files
│   ├── components/      # Reusable components
│   │   ├── layout/      # Layout components (Header, etc.)
│   │   └── icons/       # Icon components
│   ├── composables/     # Reusable composition functions
│   ├── router/          # Vue Router configuration
│   ├── stores/          # Pinia stores
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── views/           # Page components
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── public/              # Public static assets
├── tests/               # Test files
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

## Step-by-Step Migration

### Phase 1: Core Setup (Week 1)

#### Day 1: Configure Vite and Update Main Entry

1. **Update `vite.config.ts`**:

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

2. **Create `src/main.ts`**:

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles/main.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');
```

3. **Create `src/App.vue`**:

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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';

onMounted(() => {
  console.log('FiTrack Vue 3 initialized');
});
</script>

<style>
@import './assets/styles/base.css';
@import './assets/styles/components.css';

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

#### Day 2: Copy Exercise Data and Create Exercise Store

1. **Copy `exercises.js` to `src/data/exercises.ts`**:

```bash
cp ../exercises.js src/data/exercises.ts
```

2. **Convert to TypeScript** and update imports:

```typescript
import type { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  // Copy all exercises from original file
  // Update structure to match TypeScript types
];
```

3. **Create `src/stores/exercises.ts`**:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { EXERCISES } from '../data/exercises';
import type { Exercise } from '../types';

export const useExerciseStore = defineStore('exercises', () => {
  const exercises = ref<Exercise[]>(EXERCISES);
  const favoriteExerciseIds = ref<string[]>([]);
  const recentExerciseIds = ref<string[]>([]);
  
  const favoriteExercises = computed(() =>
    favoriteExerciseIds.value
      .map(id => exercises.value.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => ex !== undefined)
  );
  
  const recentExercises = computed(() =>
    recentExerciseIds.value
      .map(id => exercises.value.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => ex !== undefined)
  );
  
  function getExercise(id: string): Exercise | undefined {
    return exercises.value.find(ex => ex.id === id);
  }
  
  function searchExercises(query: string): Exercise[] {
    const q = query.toLowerCase();
    return exercises.value.filter(ex =>
      ex.name.toLowerCase().includes(q) ||
      ex.category.toLowerCase().includes(q) ||
      ex.equipment.toLowerCase().includes(q)
    );
  }
  
  function addToFavorites(exerciseId: string) {
    if (!favoriteExerciseIds.value.includes(exerciseId)) {
      favoriteExerciseIds.value.push(exerciseId);
    }
  }
  
  function removeFromFavorites(exerciseId: string) {
    const index = favoriteExerciseIds.value.indexOf(exerciseId);
    if (index !== -1) {
      favoriteExerciseIds.value.splice(index, 1);
    }
  }
  
  function addToRecent(exerciseId: string) {
    // Remove if already exists
    const index = recentExerciseIds.value.indexOf(exerciseId);
    if (index !== -1) {
      recentExerciseIds.value.splice(index, 1);
    }
    // Add to beginning
    recentExerciseIds.value.unshift(exerciseId);
    // Keep only last 10
    if (recentExerciseIds.value.length > 10) {
      recentExerciseIds.value = recentExerciseIds.value.slice(0, 10);
    }
  }
  
  return {
    exercises,
    favoriteExercises,
    recentExercises,
    getExercise,
    searchExercises,
    addToFavorites,
    removeFromFavorites,
    addToRecent,
  };
});
```

#### Day 3: Copy Styles

1. **Copy CSS files**:

```bash
# Copy main styles
cp ../styles.css src/assets/styles/main.css

# Copy additional styles
cp ../styles-phase3.css src/assets/styles/components.css
```

2. **Update CSS to use @import for modularity** if needed

3. **Verify CSS custom properties are preserved**

#### Day 4-5: Create Base Components

1. **Create `src/components/layout/AppHeader.vue`**:

```vue
<template>
  <header class="app-header">
    <h1>FiTrack</h1>
    <div class="header-actions">
      <RouterLink to="/dashboard" class="icon-btn" title="Dashboard">
        <DashboardIcon />
      </RouterLink>
      <RouterLink to="/programs" class="icon-btn" title="Programs">
        <ProgramsIcon />
      </RouterLink>
      <RouterLink to="/history" class="icon-btn" title="History">
        <HistoryIcon />
      </RouterLink>
      <RouterLink to="/settings" class="icon-btn" title="Settings">
        <SettingsIcon />
      </RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import DashboardIcon from '../icons/DashboardIcon.vue';
import ProgramsIcon from '../icons/ProgramsIcon.vue';
import HistoryIcon from '../icons/HistoryIcon.vue';
import SettingsIcon from '../icons/SettingsIcon.vue';
</script>
```

2. **Create Icon Components** (in `src/components/icons/`):

Each icon from the original HTML should be a Vue component. Example:

```vue
<!-- DashboardIcon.vue -->
<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
</template>
```

3. **Create Base UI Components**:

- `BaseButton.vue`
- `BaseInput.vue`
- `BaseModal.vue`
- `BaseCard.vue`

### Phase 2: Workout View (Week 2)

#### Day 6-7: Exercise Card Component

Create `src/components/ExerciseCard.vue`:

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

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

function onSetComplete(set: Set) {
  // Handle set completion (e.g., start timer)
  console.log('Set completed:', set);
}
</script>
```

#### Day 8: SetRow Component

Create `src/components/SetRow.vue`:

```vue
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
      />
      <input
        v-model.number="localWeight"
        type="number"
        placeholder="Weight"
        class="set-input"
        step="0.5"
        @blur="updateSet"
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

#### Day 9: Workout View

Create `src/views/WorkoutView.vue`:

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
        @update-set="
          (setId: string, updates) =>
            workoutStore.updateSet(exercise.id, setId, updates)
        "
        @remove-set="(setId: string) => workoutStore.removeSet(exercise.id, setId)"
      />
    </TransitionGroup>

    <div class="workout-actions">
      <button class="fab" @click="showExercisePicker = true">
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

    <!-- TODO: Add ExercisePicker component -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkoutStore } from '@/stores/workout';
import ExerciseCard from '@/components/ExerciseCard.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';

const router = useRouter();
const workoutStore = useWorkoutStore();
const showExercisePicker = ref(false);

async function finishWorkout() {
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
```

### Phase 3: Remaining Views (Week 3)

Continue creating the other views following the same pattern:

- `HistoryView.vue`
- `DashboardView.vue`
- `ProgramsView.vue`
- `SettingsView.vue`

### Phase 4: Testing & Deployment (Week 4)

1. **Write Tests** for all components and stores
2. **Performance Optimization**
3. **Accessibility Audit**
4. **Deploy to GitHub Pages**

## Testing the Vue 3 App

```bash
cd vue3-app

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

## Data Migration

The app will automatically migrate data from the old localStorage format. The stores use the same keys (`fitrack-workout`, `fitrack-history`, etc.) so data will be preserved.

## Deployment

Once complete, update the GitHub Actions workflow to build and deploy the Vue 3 app instead of the vanilla JS version.

## Next Steps

1. ✅ Review this migration guide
2. ⬜ Complete Phase 1 (Week 1) - Core Setup
3. ⬜ Complete Phase 2 (Week 2) - Workout View
4. ⬜ Complete Phase 3 (Week 3) - Other Views
5. ⬜ Complete Phase 4 (Week 4) - Testing & Deploy

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [VueUse Documentation](https://vueuse.org/)
- [Vite Documentation](https://vitejs.dev/)

## Support

If you encounter issues during migration:

1. Check the Vue 3 migration guide
2. Review existing code in `vue3-app/src`
3. Refer to the detailed plan in `VUE3_MIGRATION_PLAN.md`
4. Test incrementally and commit frequently
