<template>
  <header class="app-header">
    <h1>FiTrack</h1>
    <div class="header-actions">
      <RouterLink to="/dashboard" class="icon-btn" title="Dashboard" aria-label="View dashboard">
        <DashboardIcon />
      </RouterLink>
      <RouterLink to="/programs" class="icon-btn" title="Programs" aria-label="Browse workout programs">
        <ProgramsIcon />
      </RouterLink>
      <RouterLink to="/history" class="icon-btn" title="History" aria-label="View workout history">
        <HistoryIcon />
      </RouterLink>
      <RouterLink to="/settings" class="icon-btn" title="Settings" aria-label="Open settings">
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
