import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProgramsStore } from '../../src/stores/programs';

describe('Programs Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Clear localStorage
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should have no active program initially', () => {
      const store = useProgramsStore();
      expect(store.hasActiveProgram).toBe(false);
      expect(store.activeProgram).toBeNull();
    });

    it('should have all programs available', () => {
      const store = useProgramsStore();
      expect(store.allPrograms.length).toBeGreaterThan(0);
      expect(store.allPrograms[0]).toHaveProperty('id');
      expect(store.allPrograms[0]).toHaveProperty('name');
    });

    it('should have zero progress initially', () => {
      const store = useProgramsStore();
      expect(store.progress).toBe(0);
    });
  });

  describe('Starting a Program', () => {
    it('should start a program successfully', () => {
      const store = useProgramsStore();
      const programId = store.allPrograms[0].id;
      
      store.startProgram(programId);
      
      expect(store.hasActiveProgram).toBe(true);
      expect(store.activeProgram?.programId).toBe(programId);
      expect(store.activeProgram?.currentWeek).toBe(1);
      expect(store.activeProgram?.currentDay).toBe(1);
    });

    it('should clear completed days when starting a program', () => {
      const store = useProgramsStore();
      store.completedDays = ['test-day'];
      
      store.startProgram(store.allPrograms[0].id);
      
      expect(store.completedDays).toEqual([]);
    });
  });

  describe('Program Navigation', () => {
    it('should move to next day in same week', () => {
      const store = useProgramsStore();
      store.startProgram(store.allPrograms[0].id);
      
      store.moveToNextDay();
      
      expect(store.activeProgram?.currentWeek).toBe(1);
      expect(store.activeProgram?.currentDay).toBe(2);
    });

    it('should move to next week after last day', () => {
      const store = useProgramsStore();
      store.startProgram(store.allPrograms[0].id);
      
      // Move through all days of week 1 (3 days)
      store.activeProgram!.currentDay = 3;
      store.moveToNextDay();
      
      expect(store.activeProgram?.currentWeek).toBe(2);
      expect(store.activeProgram?.currentDay).toBe(1);
    });

    it('should mark days as completed', () => {
      const store = useProgramsStore();
      store.startProgram(store.allPrograms[0].id);
      
      store.completeDay(1, 1);
      
      expect(store.isDayCompleted(1, 1)).toBe(true);
      expect(store.isDayCompleted(1, 2)).toBe(false);
    });
  });

  describe('Program Progress', () => {
    it('should calculate progress correctly', () => {
      const store = useProgramsStore();
      store.startProgram(store.allPrograms[0].id);
      
      expect(store.progress).toBe(0);
      
      store.completeDay(1, 1);
      expect(store.progress).toBeGreaterThan(0);
      
      store.completeDay(1, 2);
      expect(store.progress).toBeGreaterThan(0);
    });
  });

  describe('Ending a Program', () => {
    it('should end active program', () => {
      const store = useProgramsStore();
      store.startProgram(store.allPrograms[0].id);
      
      store.endProgram();
      
      expect(store.hasActiveProgram).toBe(false);
      expect(store.activeProgram).toBeNull();
    });

    it('should keep completed days after ending', () => {
      const store = useProgramsStore();
      store.startProgram(store.allPrograms[0].id);
      store.completeDay(1, 1);
      
      const completedCount = store.completedDays.length;
      store.endProgram();
      
      expect(store.completedDays.length).toBe(completedCount);
    });
  });

  describe('Program Getters', () => {
    it('should get current program details', () => {
      const store = useProgramsStore();
      const programId = store.allPrograms[0].id;
      
      store.startProgram(programId);
      
      expect(store.currentProgram?.id).toBe(programId);
      expect(store.currentWeek).toBeTruthy();
      expect(store.currentDay).toBeTruthy();
    });

    it('should get program by id', () => {
      const store = useProgramsStore();
      const program = store.allPrograms[0];
      
      const found = store.getProgramById(program.id);
      
      expect(found).toEqual(program);
    });
  });
});
