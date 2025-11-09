// Type definitions for FiTrack Vue 3 application

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
  | 'cardio'
  | 'strength'; // Added for program exercises

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'bands'
  | 'other';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment;
  description?: string;
  muscleGroups?: string[];
}

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

export interface ProgramExercise {
  name: string;
  sets: number;
  reps: number | string;
  restSeconds: number;
  weight?: number | null;
  time?: string;
  notes?: string;
}

export interface ProgramDay {
  day: number;
  name: string;
  exercises: ProgramExercise[];
}

export interface ProgramWeek {
  week: number;
  days: ProgramDay[];
}

export interface Program {
  id: string;
  name: string;
  description: string;
  duration: number;
  daysPerWeek: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
  weeks: ProgramWeek[];
}

export interface ActiveProgram {
  programId: string;
  currentWeek: number;
  currentDay: number;
  startDate: string;
}

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

export interface SyncState {
  lastSyncTime: string | null;
  isSyncing: boolean;
  syncError: string | null;
}
