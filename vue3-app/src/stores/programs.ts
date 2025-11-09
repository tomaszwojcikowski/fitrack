import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import type { Program, ActiveProgram } from '../types';
import { PROGRAMS } from '../data/programs';

export const useProgramsStore = defineStore('programs', () => {
  // State: Active program persisted to localStorage
  const activeProgram = useStorage<ActiveProgram | null>(
    'fitrack-active-program',
    null,
    localStorage
  );

  // State: Completed program days
  const completedDays = useStorage<string[]>(
    'fitrack-completed-days',
    [],
    localStorage
  );

  // Getters
  const allPrograms = computed(() => PROGRAMS);

  const hasActiveProgram = computed(() => activeProgram.value !== null);

  const currentProgram = computed(() => {
    if (!activeProgram.value) return null;
    return PROGRAMS.find(p => p.id === activeProgram.value!.programId) || null;
  });

  const currentWeek = computed(() => {
    if (!activeProgram.value || !currentProgram.value) return null;
    return currentProgram.value.weeks.find(
      w => w.week === activeProgram.value!.currentWeek
    ) || null;
  });

  const currentDay = computed(() => {
    if (!currentWeek.value || !activeProgram.value) return null;
    return currentWeek.value.days.find(
      d => d.day === activeProgram.value!.currentDay
    ) || null;
  });

  const progress = computed(() => {
    if (!activeProgram.value || !currentProgram.value) return 0;
    const totalDays = currentProgram.value.weeks.reduce(
      (sum, week) => sum + week.days.length,
      0
    );
    const completedCount = completedDays.value.length;
    return totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
  });

  // Actions
  function startProgram(programId: string) {
    const program = PROGRAMS.find(p => p.id === programId);
    if (!program) return;

    activeProgram.value = {
      programId,
      currentWeek: 1,
      currentDay: 1,
      startDate: new Date().toISOString(),
    };
    completedDays.value = [];
  }

  function completeDay(week: number, day: number) {
    const dayKey = `${activeProgram.value?.programId}-W${week}D${day}`;
    if (!completedDays.value.includes(dayKey)) {
      completedDays.value.push(dayKey);
    }
  }

  function moveToNextDay() {
    if (!activeProgram.value || !currentProgram.value) return;

    const currentWeekData = currentWeek.value;
    if (!currentWeekData) return;

    // Complete current day
    completeDay(activeProgram.value.currentWeek, activeProgram.value.currentDay);

    // Move to next day
    if (activeProgram.value.currentDay < currentWeekData.days.length) {
      activeProgram.value.currentDay++;
    } else {
      // Move to next week
      if (activeProgram.value.currentWeek < currentProgram.value.weeks.length) {
        activeProgram.value.currentWeek++;
        activeProgram.value.currentDay = 1;
      } else {
        // Program complete
        endProgram();
      }
    }
  }

  function endProgram() {
    activeProgram.value = null;
    // Keep completed days for history
  }

  function isDayCompleted(week: number, day: number): boolean {
    const dayKey = `${activeProgram.value?.programId}-W${week}D${day}`;
    return completedDays.value.includes(dayKey);
  }

  function getProgramById(id: string): Program | undefined {
    return PROGRAMS.find(p => p.id === id);
  }

  return {
    // State
    activeProgram,
    completedDays,
    // Getters
    allPrograms,
    hasActiveProgram,
    currentProgram,
    currentWeek,
    currentDay,
    progress,
    // Actions
    startProgram,
    completeDay,
    moveToNextDay,
    endProgram,
    isDayCompleted,
    getProgramById,
  };
});
