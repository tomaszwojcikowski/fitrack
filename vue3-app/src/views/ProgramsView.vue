<template>
  <div class="programs-view">
    <div class="programs-header">
      <h1>Workout Programs</h1>
      <p v-if="!programsStore.hasActiveProgram" class="subtitle">
        Choose a structured program to follow
      </p>
    </div>

    <!-- Active Program Section -->
    <div v-if="programsStore.hasActiveProgram" class="active-program-section">
      <div class="active-program-card">
        <div class="active-program-header">
          <div>
            <h2>{{ programsStore.currentProgram?.name }}</h2>
            <p class="active-program-meta">
              Week {{ programsStore.activeProgram?.currentWeek }} · 
              Day {{ programsStore.activeProgram?.currentDay }}
            </p>
          </div>
          <button class="btn btn-danger" @click="handleEndProgram">
            End Program
          </button>
        </div>
        
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${programsStore.progress}%` }"></div>
          </div>
          <span class="progress-text">{{ programsStore.progress }}% Complete</span>
        </div>

        <div v-if="programsStore.currentDay" class="today-workout">
          <h3>Today's Workout: {{ programsStore.currentDay.name }}</h3>
          <div class="exercises-preview">
            <div v-for="(ex, idx) in programsStore.currentDay.exercises" :key="idx" class="exercise-preview">
              {{ ex.name }} - {{ ex.sets }} × {{ ex.reps }}
            </div>
          </div>
          <button class="btn btn-primary" @click="handleStartTodayWorkout">
            Start Today's Workout
          </button>
        </div>
      </div>
    </div>

    <!-- Available Programs Grid -->
    <div class="programs-section">
      <h2>{{ programsStore.hasActiveProgram ? 'Other Programs' : 'Available Programs' }}</h2>
      <div class="programs-grid">
        <ProgramCard
          v-for="program in programsStore.allPrograms"
          :key="program.id"
          :program="program"
          @select="handleSelectProgram"
        />
      </div>
    </div>

    <!-- Program Detail Modal -->
    <ProgramDetailModal
      v-model:show="showDetailModal"
      :program="selectedProgram!"
      @start="handleStartProgram"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProgramsStore } from '../stores/programs';
import { useWorkoutStore } from '../stores/workout';
import ProgramCard from '../components/ProgramCard.vue';
import ProgramDetailModal from '../components/ProgramDetailModal.vue';
import type { Program } from '../types';

const router = useRouter();
const programsStore = useProgramsStore();
const workoutStore = useWorkoutStore();

const showDetailModal = ref(false);
const selectedProgram = ref<Program | null>(null);

function handleSelectProgram(program: Program) {
  selectedProgram.value = program;
  showDetailModal.value = true;
}

function handleStartProgram(program: Program) {
  if (programsStore.hasActiveProgram) {
    if (!confirm('You already have an active program. Starting a new one will end the current program. Continue?')) {
      return;
    }
  }
  programsStore.startProgram(program.id);
}

function handleEndProgram() {
  if (confirm('Are you sure you want to end this program? Your progress will be saved.')) {
    programsStore.endProgram();
  }
}

function handleStartTodayWorkout() {
  const currentDay = programsStore.currentDay;
  if (!currentDay) return;

  // Clear current workout
  workoutStore.clearWorkout();

  // Add all exercises from today's program
  currentDay.exercises.forEach(ex => {
    const exerciseToAdd = {
      id: `${Date.now()}-${Math.random()}`,
      name: ex.name,
      category: 'strength' as const,
      equipment: 'barbell' as const,
      description: ex.notes || '',
    };
    
    workoutStore.addExercise(exerciseToAdd);
    
    // Add the prescribed sets
    const addedExercise = workoutStore.currentWorkout[workoutStore.currentWorkout.length - 1];
    if (addedExercise) {
      const exerciseId = addedExercise.id;
      for (let i = 0; i < ex.sets; i++) {
        workoutStore.addSet(exerciseId);
        // Set target reps if available
        if (ex.reps && typeof ex.reps === 'number') {
          const exercise = workoutStore.currentWorkout.find(e => e.id === exerciseId);
          if (exercise) {
            const setIndex = exercise.sets.length - 1;
            const setId = exercise.sets[setIndex]?.id;
            if (setId) {
              workoutStore.updateSet(exerciseId, setId, {
                reps: ex.reps,
                weight: ex.weight || 0,
              });
            }
          }
        }
      }
    }
  });

  // Navigate to workout view
  router.push('/workout');
}
</script>

<style scoped>
.programs-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.programs-header {
  margin-bottom: 2rem;
}

.programs-header h1 {
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.active-program-section {
  margin-bottom: 3rem;
}

.active-program-card {
  background: var(--card-bg);
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  padding: 2rem;
}

.active-program-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1.5rem;
}

.active-program-header h2 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.active-program-meta {
  color: var(--text-secondary);
  margin: 0;
}

.progress-section {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.today-workout {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
}

.today-workout h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.exercises-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.exercise-preview {
  color: var(--text-secondary);
  font-size: 0.95rem;
  padding-left: 1.5rem;
  position: relative;
}

.exercise-preview::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
}

.programs-section {
  margin-top: 2rem;
}

.programs-section h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
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

.btn-primary {
  background: var(--primary-color);
  color: white;
  width: 100%;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-danger {
  background: #f4433644;
  color: #f44336;
  border: 1px solid #f44336;
}

.btn-danger:hover {
  background: #f44336;
  color: white;
}

@media (max-width: 768px) {
  .programs-view {
    padding: 1rem;
  }

  .active-program-card {
    padding: 1.5rem;
  }

  .active-program-header {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-danger {
    width: 100%;
  }

  .programs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
