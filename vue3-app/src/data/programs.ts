import type { Program } from '../types';

// Migrated from programs.js - Predefined workout programs
export const PROGRAMS: Program[] = [
  {
    id: 'beginner-strength',
    name: 'Beginner Strength Builder',
    description: '4-week program for building foundational strength',
    duration: 4,
    daysPerWeek: 3,
    difficulty: 'Beginner',
    goal: 'Strength',
    weeks: [
      {
        week: 1,
        days: [
          {
            day: 1,
            name: 'Upper Body A',
            exercises: [
              { name: 'Bench Press', sets: 3, reps: 10, restSeconds: 120, weight: null, notes: 'Focus on form' },
              { name: 'Barbell Row', sets: 3, reps: 10, restSeconds: 120, weight: null },
              { name: 'Overhead Press', sets: 3, reps: 8, restSeconds: 90, weight: null },
              { name: 'Lat Pulldown', sets: 3, reps: 12, restSeconds: 90, weight: null },
              { name: 'Dumbbell Curl', sets: 2, reps: 12, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 2,
            name: 'Lower Body A',
            exercises: [
              { name: 'Squat', sets: 3, reps: 10, restSeconds: 150, weight: null, notes: 'Go to parallel or below' },
              { name: 'Romanian Deadlift', sets: 3, reps: 10, restSeconds: 120, weight: null },
              { name: 'Leg Press', sets: 3, reps: 12, restSeconds: 90, weight: null },
              { name: 'Leg Curl', sets: 3, reps: 12, restSeconds: 90, weight: null },
              { name: 'Calf Raise', sets: 3, reps: 15, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 3,
            name: 'Upper Body B',
            exercises: [
              { name: 'Incline Dumbbell Press', sets: 3, reps: 10, restSeconds: 120, weight: null },
              { name: 'Pull-ups', sets: 3, reps: 8, restSeconds: 120, weight: null, notes: 'Assisted if needed' },
              { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, restSeconds: 90, weight: null },
              { name: 'Cable Row', sets: 3, reps: 12, restSeconds: 90, weight: null },
              { name: 'Tricep Dips', sets: 2, reps: 12, restSeconds: 60, weight: null }
            ]
          }
        ]
      },
      {
        week: 2,
        days: [
          {
            day: 1,
            name: 'Upper Body A',
            exercises: [
              { name: 'Bench Press', sets: 4, reps: 8, restSeconds: 120, weight: null, notes: 'Increase weight from week 1' },
              { name: 'Barbell Row', sets: 4, reps: 8, restSeconds: 120, weight: null },
              { name: 'Overhead Press', sets: 3, reps: 8, restSeconds: 90, weight: null },
              { name: 'Lat Pulldown', sets: 3, reps: 12, restSeconds: 90, weight: null },
              { name: 'Dumbbell Curl', sets: 3, reps: 12, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 2,
            name: 'Lower Body A',
            exercises: [
              { name: 'Squat', sets: 4, reps: 8, restSeconds: 150, weight: null, notes: 'Increase weight from week 1' },
              { name: 'Romanian Deadlift', sets: 3, reps: 10, restSeconds: 120, weight: null },
              { name: 'Leg Press', sets: 3, reps: 12, restSeconds: 90, weight: null },
              { name: 'Leg Curl', sets: 3, reps: 12, restSeconds: 90, weight: null },
              { name: 'Calf Raise', sets: 3, reps: 15, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 3,
            name: 'Upper Body B',
            exercises: [
              { name: 'Incline Dumbbell Press', sets: 4, reps: 8, restSeconds: 120, weight: null },
              { name: 'Pull-ups', sets: 3, reps: 8, restSeconds: 120, weight: null },
              { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, restSeconds: 90, weight: null },
              { name: 'Cable Row', sets: 3, reps: 12, restSeconds: 90, weight: null },
              { name: 'Tricep Dips', sets: 3, reps: 12, restSeconds: 60, weight: null }
            ]
          }
        ]
      },
      {
        week: 3,
        days: [
          {
            day: 1,
            name: 'Upper Body A',
            exercises: [
              { name: 'Bench Press', sets: 4, reps: 6, restSeconds: 150, weight: null, notes: 'Heavy week - increase weight' },
              { name: 'Barbell Row', sets: 4, reps: 6, restSeconds: 120, weight: null },
              { name: 'Overhead Press', sets: 3, reps: 8, restSeconds: 90, weight: null },
              { name: 'Lat Pulldown', sets: 3, reps: 10, restSeconds: 90, weight: null },
              { name: 'Dumbbell Curl', sets: 3, reps: 10, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 2,
            name: 'Lower Body A',
            exercises: [
              { name: 'Squat', sets: 4, reps: 6, restSeconds: 180, weight: null, notes: 'Heavy week - increase weight' },
              { name: 'Romanian Deadlift', sets: 4, reps: 8, restSeconds: 120, weight: null },
              { name: 'Leg Press', sets: 3, reps: 10, restSeconds: 90, weight: null },
              { name: 'Leg Curl', sets: 3, reps: 10, restSeconds: 90, weight: null },
              { name: 'Calf Raise', sets: 4, reps: 15, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 3,
            name: 'Upper Body B',
            exercises: [
              { name: 'Incline Dumbbell Press', sets: 4, reps: 6, restSeconds: 120, weight: null },
              { name: 'Pull-ups', sets: 4, reps: 8, restSeconds: 120, weight: null },
              { name: 'Dumbbell Shoulder Press', sets: 3, reps: 8, restSeconds: 90, weight: null },
              { name: 'Cable Row', sets: 3, reps: 10, restSeconds: 90, weight: null },
              { name: 'Tricep Dips', sets: 3, reps: 10, restSeconds: 60, weight: null }
            ]
          }
        ]
      },
      {
        week: 4,
        days: [
          {
            day: 1,
            name: 'Upper Body A - Deload',
            exercises: [
              { name: 'Bench Press', sets: 3, reps: 10, restSeconds: 120, weight: null, notes: 'Deload week - reduce weight 20%' },
              { name: 'Barbell Row', sets: 3, reps: 10, restSeconds: 120, weight: null },
              { name: 'Overhead Press', sets: 2, reps: 10, restSeconds: 90, weight: null },
              { name: 'Lat Pulldown', sets: 3, reps: 12, restSeconds: 90, weight: null },
              { name: 'Dumbbell Curl', sets: 2, reps: 12, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 2,
            name: 'Lower Body A - Deload',
            exercises: [
              { name: 'Squat', sets: 3, reps: 10, restSeconds: 120, weight: null, notes: 'Deload week - reduce weight 20%' },
              { name: 'Romanian Deadlift', sets: 3, reps: 10, restSeconds: 120, weight: null },
              { name: 'Leg Press', sets: 2, reps: 12, restSeconds: 90, weight: null },
              { name: 'Leg Curl', sets: 2, reps: 12, restSeconds: 90, weight: null },
              { name: 'Calf Raise', sets: 2, reps: 15, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 3,
            name: 'Upper Body B - Deload',
            exercises: [
              { name: 'Incline Dumbbell Press', sets: 3, reps: 10, restSeconds: 120, weight: null },
              { name: 'Pull-ups', sets: 2, reps: 8, restSeconds: 120, weight: null },
              { name: 'Dumbbell Shoulder Press', sets: 2, reps: 10, restSeconds: 90, weight: null },
              { name: 'Cable Row', sets: 2, reps: 12, restSeconds: 90, weight: null },
              { name: 'Tricep Dips', sets: 2, reps: 12, restSeconds: 60, weight: null }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'hypertrophy-gains',
    name: 'Hypertrophy Gains',
    description: '4-week muscle building program with moderate-high volume',
    duration: 4,
    daysPerWeek: 4,
    difficulty: 'Intermediate',
    goal: 'Hypertrophy',
    weeks: [
      {
        week: 1,
        days: [
          {
            day: 1,
            name: 'Chest & Triceps',
            exercises: [
              { name: 'Bench Press', sets: 4, reps: 10, restSeconds: 90, weight: null },
              { name: 'Incline Dumbbell Press', sets: 4, reps: 12, restSeconds: 90, weight: null },
              { name: 'Cable Fly', sets: 3, reps: 15, restSeconds: 60, weight: null },
              { name: 'Dips', sets: 3, reps: 12, restSeconds: 90, weight: null },
              { name: 'Tricep Pushdown', sets: 3, reps: 15, restSeconds: 60, weight: null },
              { name: 'Overhead Tricep Extension', sets: 3, reps: 12, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 2,
            name: 'Back & Biceps',
            exercises: [
              { name: 'Deadlift', sets: 4, reps: 8, restSeconds: 120, weight: null },
              { name: 'Pull-ups', sets: 4, reps: 10, restSeconds: 90, weight: null },
              { name: 'Barbell Row', sets: 4, reps: 10, restSeconds: 90, weight: null },
              { name: 'Seated Cable Row', sets: 3, reps: 12, restSeconds: 60, weight: null },
              { name: 'Barbell Curl', sets: 3, reps: 12, restSeconds: 60, weight: null },
              { name: 'Hammer Curl', sets: 3, reps: 15, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 3,
            name: 'Legs',
            exercises: [
              { name: 'Squat', sets: 4, reps: 10, restSeconds: 120, weight: null },
              { name: 'Romanian Deadlift', sets: 4, reps: 10, restSeconds: 90, weight: null },
              { name: 'Leg Press', sets: 3, reps: 15, restSeconds: 90, weight: null },
              { name: 'Leg Curl', sets: 3, reps: 12, restSeconds: 60, weight: null },
              { name: 'Leg Extension', sets: 3, reps: 15, restSeconds: 60, weight: null },
              { name: 'Calf Raise', sets: 4, reps: 20, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 4,
            name: 'Shoulders & Abs',
            exercises: [
              { name: 'Overhead Press', sets: 4, reps: 10, restSeconds: 90, weight: null },
              { name: 'Dumbbell Shoulder Press', sets: 3, reps: 12, restSeconds: 90, weight: null },
              { name: 'Lateral Raise', sets: 4, reps: 15, restSeconds: 60, weight: null },
              { name: 'Front Raise', sets: 3, reps: 12, restSeconds: 60, weight: null },
              { name: 'Face Pulls', sets: 3, reps: 20, restSeconds: 60, weight: null },
              { name: 'Plank', sets: 3, reps: 1, time: '60s', restSeconds: 60, weight: null },
              { name: 'Hanging Leg Raise', sets: 3, reps: 15, restSeconds: 60, weight: null }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'powerlifting-peak',
    name: 'Powerlifting Peak',
    description: '4-week program focused on the big three: squat, bench, deadlift',
    duration: 4,
    daysPerWeek: 3,
    difficulty: 'Advanced',
    goal: 'Strength/Powerlifting',
    weeks: [
      {
        week: 1,
        days: [
          {
            day: 1,
            name: 'Squat Focus',
            exercises: [
              { name: 'Squat', sets: 5, reps: 5, restSeconds: 180, weight: null, notes: '75% of 1RM' },
              { name: 'Front Squat', sets: 3, reps: 8, restSeconds: 120, weight: null },
              { name: 'Romanian Deadlift', sets: 3, reps: 8, restSeconds: 120, weight: null },
              { name: 'Leg Press', sets: 3, reps: 10, restSeconds: 90, weight: null },
              { name: 'Abs Wheel', sets: 3, reps: 12, restSeconds: 60, weight: null }
            ]
          },
          {
            day: 2,
            name: 'Bench Focus',
            exercises: [
              { name: 'Bench Press', sets: 5, reps: 5, restSeconds: 180, weight: null, notes: '75% of 1RM' },
              { name: 'Incline Bench Press', sets: 3, reps: 8, restSeconds: 120, weight: null },
              { name: 'Overhead Press', sets: 3, reps: 8, restSeconds: 120, weight: null },
              { name: 'Barbell Row', sets: 4, reps: 8, restSeconds: 90, weight: null },
              { name: 'Dips', sets: 3, reps: 10, restSeconds: 90, weight: null }
            ]
          },
          {
            day: 3,
            name: 'Deadlift Focus',
            exercises: [
              { name: 'Deadlift', sets: 5, reps: 5, restSeconds: 180, weight: null, notes: '75% of 1RM' },
              { name: 'Deficit Deadlift', sets: 3, reps: 6, restSeconds: 150, weight: null },
              { name: 'Pull-ups', sets: 4, reps: 8, restSeconds: 120, weight: null },
              { name: 'Barbell Row', sets: 3, reps: 8, restSeconds: 90, weight: null },
              { name: 'Plank', sets: 3, reps: 1, time: '60s', restSeconds: 60, weight: null }
            ]
          }
        ]
      }
    ]
  }
];
