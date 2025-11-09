<template>
  <div class="dashboard-view">
    <div class="view-header">
      <h1>Dashboard</h1>
      <p class="subtitle">Track your fitness journey</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🏋️</div>
        <div class="stat-content">
          <div class="stat-value">{{ historyStore.stats.totalWorkouts }}</div>
          <div class="stat-label">Total Workouts</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <div class="stat-value">{{ historyStore.stats.currentStreak }}</div>
          <div class="stat-label">Day Streak</div>
          <div class="stat-sub">Longest: {{ historyStore.stats.longestStreak }} days</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatVolume(historyStore.stats.totalVolume) }}</div>
          <div class="stat-label">Total Volume</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatDuration(historyStore.stats.averageDuration) }}</div>
          <div class="stat-label">Avg Duration</div>
        </div>
      </div>
    </div>

    <!-- Favorite Exercises -->
    <div v-if="historyStore.stats.favoriteExercises.length > 0" class="section">
      <h2>⭐ Favorite Exercises</h2>
      <div class="favorite-exercises">
        <div
          v-for="(exercise, index) in historyStore.stats.favoriteExercises"
          :key="exercise"
          class="favorite-item"
        >
          <span class="favorite-rank">{{ index + 1 }}</span>
          <span class="favorite-name">{{ exercise }}</span>
        </div>
      </div>
    </div>

    <!-- Recent Workouts -->
    <div class="section">
      <div class="section-header">
        <h2>📅 Recent Workouts</h2>
        <router-link to="/history" class="section-link">
          View All
        </router-link>
      </div>

      <div v-if="historyStore.recentWorkouts.length === 0" class="empty-state">
        <div class="empty-icon">💪</div>
        <h3>No Workouts Yet</h3>
        <p>Start your first workout to see it here</p>
        <button class="btn btn-primary" @click="$router.push('/')">
          Start Workout
        </button>
      </div>

      <div v-else class="recent-workouts">
        <WorkoutHistoryCard
          v-for="workout in historyStore.recentWorkouts.slice(0, 5)"
          :key="workout.id"
          :workout="workout"
          @click="viewWorkout(workout)"
        />
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section">
      <h2>⚡ Quick Actions</h2>
      <div class="quick-actions">
        <button class="action-card" @click="$router.push('/')">
          <div class="action-icon">💪</div>
          <div class="action-content">
            <h3>Start Workout</h3>
            <p>Begin tracking a new workout</p>
          </div>
        </button>

        <button class="action-card" @click="$router.push('/history')">
          <div class="action-icon">📊</div>
          <div class="action-content">
            <h3>View History</h3>
            <p>See your past workouts</p>
          </div>
        </button>

        <button class="action-card" @click="$router.push('/programs')">
          <div class="action-icon">📋</div>
          <div class="action-content">
            <h3>Browse Programs</h3>
            <p>Find a workout program</p>
          </div>
        </button>
      </div>
    </div>

    <WorkoutDetailModal
      v-if="selectedWorkout"
      :workout="selectedWorkout"
      @close="selectedWorkout = null"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHistoryStore } from '@/stores/history';
import WorkoutHistoryCard from '@/components/WorkoutHistoryCard.vue';
import WorkoutDetailModal from '@/components/WorkoutDetailModal.vue';
import type { Workout } from '@/types';

const historyStore = useHistoryStore();
const selectedWorkout = ref<Workout | null>(null);

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K kg`;
  }
  return `${volume} kg`;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function viewWorkout(workout: Workout) {
  selectedWorkout.value = workout;
}

function handleDelete(id: string) {
  historyStore.deleteWorkout(id);
  selectedWorkout.value = null;
}
</script>

<style scoped>
.dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.view-header {
  margin-bottom: 2rem;
}

.view-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-sub {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin-bottom: 0;
}

.section-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.section-link:hover {
  opacity: 0.8;
}

.favorite-exercises {
  display: grid;
  gap: 0.75rem;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.favorite-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
}

.favorite-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.recent-workouts {
  display: grid;
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.action-icon {
  font-size: 2rem;
}

.action-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.action-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: 1rem;
  }

  .view-header h1 {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
