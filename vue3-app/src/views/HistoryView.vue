<template>
  <div class="history-view">
    <div class="view-header">
      <h1>Workout History</h1>
      <div class="view-stats">
        <div class="stat-item">
          <span class="stat-value">{{ historyStore.stats.totalWorkouts }}</span>
          <span class="stat-label">Workouts</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ historyStore.stats.currentStreak }}</span>
          <span class="stat-label">Day Streak</span>
        </div>
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

    <div v-if="filteredWorkouts.length === 0" class="empty-state">
      <div class="empty-icon">📊</div>
      <h2>No Workouts Yet</h2>
      <p>Complete your first workout to see it here</p>
      <button class="btn btn-primary" @click="$router.push('/')">
        Start Workout
      </button>
    </div>

    <TransitionGroup v-else name="list" tag="div" class="history-list">
      <WorkoutHistoryCard
        v-for="workout in filteredWorkouts"
        :key="workout.id"
        :workout="workout"
        @click="viewWorkout(workout)"
      />
    </TransitionGroup>

    <WorkoutDetailModal
      v-if="selectedWorkout"
      :workout="selectedWorkout"
      @close="selectedWorkout = null"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHistoryStore } from '@/stores/history';
import WorkoutHistoryCard from '@/components/WorkoutHistoryCard.vue';
import WorkoutDetailModal from '@/components/WorkoutDetailModal.vue';
import type { Workout } from '@/types';

const historyStore = useHistoryStore();
const searchQuery = ref('');
const dateFilter = ref<'all' | '7' | '30' | '90'>('all');
const selectedWorkout = ref<Workout | null>(null);

const filteredWorkouts = computed(() => {
  let workouts = historyStore.sortedWorkouts;

  // Filter by date range
  if (dateFilter.value !== 'all') {
    const days = parseInt(dateFilter.value);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    workouts = workouts.filter((workout: any) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= cutoffDate;
    });
  }

  // Filter by search query
  if (searchQuery.value) {
    workouts = historyStore.searchWorkouts(searchQuery.value).filter((w: any) => 
      workouts.includes(w)
    );
  }

  return workouts;
});

function viewWorkout(workout: Workout) {
  selectedWorkout.value = workout;
}

function handleDelete(id: string) {
  historyStore.deleteWorkout(id);
  selectedWorkout.value = null;
}
</script>

<style scoped>
.history-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.view-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.view-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.history-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.history-list {
  display: grid;
  gap: 1rem;
}

/* List transition animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.list-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .history-view {
    padding: 1rem;
  }

  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .view-header h1 {
    font-size: 1.5rem;
  }

  .view-stats {
    width: 100%;
    justify-content: space-around;
  }

  .history-filters {
    flex-direction: column;
  }
}
</style>
