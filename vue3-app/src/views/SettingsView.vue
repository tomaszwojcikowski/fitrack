<template>
  <div class="settings-view">
    <h1>Settings</h1>

    <div class="settings-sections">
      <!-- App Info Section -->
      <div class="settings-section">
        <h2>About FiTrack</h2>
        <div class="setting-item">
          <div class="setting-label">Version</div>
          <div class="setting-value">3.0.0 (Vue 3)</div>
        </div>
        <div class="setting-item">
          <div class="setting-label">Storage</div>
          <div class="setting-value">{{ storageUsed }}</div>
        </div>
      </div>

      <!-- Data Management Section -->
      <div class="settings-section">
        <h2>Data Management</h2>
        
        <div class="setting-item">
          <div>
            <div class="setting-label">Export Data</div>
            <div class="setting-description">Download all your workout data as JSON</div>
          </div>
          <button class="btn btn-secondary" @click="exportData">
            Export
          </button>
        </div>

        <div class="setting-item">
          <div>
            <div class="setting-label">Import Data</div>
            <div class="setting-description">Import workout data from a JSON file</div>
          </div>
          <label class="btn btn-secondary">
            Import
            <input type="file" accept=".json" @change="importData" style="display: none;">
          </label>
        </div>

        <div class="setting-item danger-zone">
          <div>
            <div class="setting-label">Clear All Data</div>
            <div class="setting-description">Permanently delete all workout data</div>
          </div>
          <button class="btn btn-danger" @click="clearAllData">
            Clear Data
          </button>
        </div>
      </div>

      <!-- Preferences Section -->
      <div class="settings-section">
        <h2>Preferences</h2>
        
        <div class="setting-item">
          <div>
            <div class="setting-label">Default Rest Timer</div>
            <div class="setting-description">Default rest time between sets</div>
          </div>
          <select v-model="defaultRestTime" class="setting-select">
            <option :value="30">30 seconds</option>
            <option :value="60">60 seconds</option>
            <option :value="90">90 seconds</option>
            <option :value="120">2 minutes</option>
            <option :value="180">3 minutes</option>
          </select>
        </div>

        <div class="setting-item">
          <div>
            <div class="setting-label">Weight Unit</div>
            <div class="setting-description">Unit for displaying weights</div>
          </div>
          <select v-model="weightUnit" class="setting-select">
            <option value="kg">Kilograms (kg)</option>
            <option value="lbs">Pounds (lbs)</option>
          </select>
        </div>
      </div>

      <!-- Cloud Sync Section -->
      <div class="settings-section">
        <h2>Cloud Sync</h2>
        <div class="info-box">
          <p>Cloud sync via GitHub Gist is coming soon!</p>
          <p class="info-text">
            This feature will allow you to backup and sync your workout data across devices 
            using your GitHub account.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWorkoutStore } from '../stores/workout';
import { useHistoryStore } from '../stores/history';
import { useExerciseStore } from '../stores/exercises';
import { useProgramsStore } from '../stores/programs';

const workoutStore = useWorkoutStore();
const historyStore = useHistoryStore();
const exerciseStore = useExerciseStore();
const programsStore = useProgramsStore();

const defaultRestTime = ref(90);
const weightUnit = ref('kg');

const storageUsed = computed(() => {
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith('fitrack-')) {
      totalSize += localStorage[key].length;
    }
  }
  const kb = totalSize / 1024;
  return kb < 1 ? `${totalSize} bytes` : `${kb.toFixed(2)} KB`;
});

function exportData() {
  const data = {
    version: '3.0.0',
    exportDate: new Date().toISOString(),
    workout: workoutStore.currentWorkout,
    history: historyStore.workouts,
    favorites: exerciseStore.favoriteExerciseIds,
    recentExercises: exerciseStore.recentExerciseIds,
    activeProgram: programsStore.activeProgram,
    completedDays: programsStore.completedDays,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitrack-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert('Data exported successfully!');
}

function importData(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      
      if (!confirm('This will replace all current data. Are you sure?')) {
        return;
      }

      // Import data
      if (data.workout) workoutStore.currentWorkout = data.workout;
      if (data.history) historyStore.workouts = data.history;
      if (data.favorites) exerciseStore.favoriteExerciseIds = data.favorites;
      if (data.recentExercises) exerciseStore.recentExerciseIds = data.recentExercises;
      if (data.activeProgram) programsStore.activeProgram = data.activeProgram;
      if (data.completedDays) programsStore.completedDays = data.completedDays;

      alert('Data imported successfully!');
    } catch (error) {
      alert('Error importing data. Please check the file format.');
      console.error('Import error:', error);
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  const confirmation = prompt(
    'This will permanently delete ALL your workout data. Type "DELETE" to confirm:'
  );
  
  if (confirmation === 'DELETE') {
    workoutStore.clearWorkout();
    historyStore.clearHistory();
    exerciseStore.favoriteExerciseIds = [];
    exerciseStore.recentExerciseIds = [];
    programsStore.endProgram();
    programsStore.completedDays = [];
    
    alert('All data has been cleared.');
  }
}
</script>

<style scoped>
.settings-view {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.settings-view h1 {
  margin-bottom: 2rem;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.settings-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.setting-value {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.setting-select {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
}

.setting-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
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

.btn-danger {
  background: #f4433644;
  color: #f44336;
  border: 1px solid #f44336;
}

.btn-danger:hover {
  background: #f44336;
  color: white;
}

.danger-zone {
  background: #f4433611;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.info-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.info-box p {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.info-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .settings-view {
    padding: 1rem;
  }

  .settings-section {
    padding: 1rem;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn, .setting-select {
    width: 100%;
  }
}
</style>
