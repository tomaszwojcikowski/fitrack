import type { Exercise } from '../types';

// Comprehensive exercise database
const EXERCISES: Exercise[] = [
    // Chest Exercises
    { id: 'bench-press', name: "Bench Press", category: "chest", equipment: "barbell" },
    { id: 'incline-bench-press', name: "Incline Bench Press", category: "chest", equipment: "barbell" },
    { id: 'decline-bench-press', name: "Decline Bench Press", category: "chest", equipment: "barbell" },
    { id: 'dumbbell-press', name: "Dumbbell Press", category: "chest", equipment: "dumbbell" },
    { id: 'incline-dumbbell-press', name: "Incline Dumbbell Press", category: "chest", equipment: "dumbbell" },
    { id: 'decline-dumbbell-press', name: "Decline Dumbbell Press", category: "chest", equipment: "dumbbell" },
    { id: 'dumbbell-fly', name: "Dumbbell Fly", category: "chest", equipment: "dumbbell" },
    { id: 'incline-dumbbell-fly', name: "Incline Dumbbell Fly", category: "chest", equipment: "dumbbell" },
    { id: 'cable-fly', name: "Cable Fly", category: "chest", equipment: "cable" },
    { id: 'push-ups', name: "Push-ups", category: "chest", equipment: "bodyweight" },
    { id: 'wide-push-ups', name: "Wide Push-ups", category: "chest", equipment: "bodyweight" },
    { id: 'diamond-push-ups', name: "Diamond Push-ups", category: "chest", equipment: "bodyweight" },
    { id: 'dips-chest', name: "Dips", category: "chest", equipment: "bodyweight" },
    { id: 'chest-press-machine', name: "Chest Press Machine", category: "chest", equipment: "machine" },
    { id: 'pec-deck', name: "Pec Deck", category: "chest", equipment: "machine" },
    
    // Back Exercises
    { id: 'deadlift', name: "Deadlift", category: "back", equipment: "barbell" },
    { id: 'barbell-row', name: "Barbell Row", category: "back", equipment: "barbell" },
    { id: 't-bar-row', name: "T-Bar Row", category: "back", equipment: "barbell" },
    { id: 'pull-ups', name: "Pull-ups", category: "back", equipment: "bodyweight" },
    { id: 'chin-ups', name: "Chin-ups", category: "back", equipment: "bodyweight" },
    { id: 'lat-pulldown', name: "Lat Pulldown", category: "back", equipment: "cable" },
    { id: 'seated-cable-row', name: "Seated Cable Row", category: "back", equipment: "cable" },
    { id: 'one-arm-dumbbell-row', name: "One Arm Dumbbell Row", category: "back", equipment: "dumbbell" },
    { id: 'dumbbell-row', name: "Dumbbell Row", category: "back", equipment: "dumbbell" },
    { id: 'face-pulls-back', name: "Face Pulls", category: "back", equipment: "cable" },
    { id: 'straight-arm-pulldown', name: "Straight Arm Pulldown", category: "back", equipment: "cable" },
    { id: 'hyperextensions', name: "Hyperextensions", category: "back", equipment: "bodyweight" },
    { id: 'good-mornings', name: "Good Mornings", category: "back", equipment: "barbell" },
    { id: 'rack-pulls', name: "Rack Pulls", category: "back", equipment: "barbell" },
    
    // Shoulders Exercises
    { id: 'overhead-press', name: "Overhead Press", category: "shoulders", equipment: "barbell" },
    { id: 'military-press', name: "Military Press", category: "shoulders", equipment: "barbell" },
    { id: 'push-press', name: "Push Press", category: "shoulders", equipment: "barbell" },
    { id: 'dumbbell-shoulder-press', name: "Dumbbell Shoulder Press", category: "shoulders", equipment: "dumbbell" },
    { id: 'arnold-press', name: "Arnold Press", category: "shoulders", equipment: "dumbbell" },
    { id: 'lateral-raise', name: "Lateral Raise", category: "shoulders", equipment: "dumbbell" },
    { id: 'front-raise', name: "Front Raise", category: "shoulders", equipment: "dumbbell" },
    { id: 'rear-delt-fly', name: "Rear Delt Fly", category: "shoulders", equipment: "dumbbell" },
    { id: 'upright-row', name: "Upright Row", category: "shoulders", equipment: "barbell" },
    { id: 'shrugs', name: "Shrugs", category: "shoulders", equipment: "dumbbell" },
    { id: 'cable-lateral-raise', name: "Cable Lateral Raise", category: "shoulders", equipment: "cable" },
    { id: 'face-pulls-shoulders', name: "Face Pulls", category: "shoulders", equipment: "cable" },
    
    // Arms - Biceps
    { id: 'barbell-curl', name: "Barbell Curl", category: "biceps", equipment: "barbell" },
    { id: 'ez-bar-curl', name: "EZ Bar Curl", category: "biceps", equipment: "barbell" },
    { id: 'dumbbell-curl', name: "Dumbbell Curl", category: "biceps", equipment: "dumbbell" },
    { id: 'hammer-curl', name: "Hammer Curl", category: "biceps", equipment: "dumbbell" },
    { id: 'incline-dumbbell-curl', name: "Incline Dumbbell Curl", category: "biceps", equipment: "dumbbell" },
    { id: 'concentration-curl', name: "Concentration Curl", category: "biceps", equipment: "dumbbell" },
    { id: 'preacher-curl', name: "Preacher Curl", category: "biceps", equipment: "barbell" },
    { id: 'cable-curl', name: "Cable Curl", category: "biceps", equipment: "cable" },
    
    // Arms - Triceps
    { id: 'close-grip-bench', name: "Close Grip Bench Press", category: "triceps", equipment: "barbell" },
    { id: 'dips-triceps', name: "Dips", category: "triceps", equipment: "bodyweight" },
    { id: 'tricep-pushdown', name: "Tricep Pushdown", category: "triceps", equipment: "cable" },
    { id: 'overhead-tricep-extension', name: "Overhead Tricep Extension", category: "triceps", equipment: "dumbbell" },
    { id: 'skull-crushers', name: "Skull Crushers", category: "triceps", equipment: "barbell" },
    { id: 'tricep-kickbacks', name: "Tricep Kickbacks", category: "triceps", equipment: "dumbbell" },
    
    // Legs - Quads
    { id: 'squat', name: "Squat", category: "quads", equipment: "barbell" },
    { id: 'front-squat', name: "Front Squat", category: "quads", equipment: "barbell" },
    { id: 'leg-press', name: "Leg Press", category: "quads", equipment: "machine" },
    { id: 'leg-extension', name: "Leg Extension", category: "quads", equipment: "machine" },
    { id: 'bulgarian-split-squat', name: "Bulgarian Split Squat", category: "quads", equipment: "dumbbell" },
    { id: 'lunges', name: "Lunges", category: "quads", equipment: "bodyweight" },
    { id: 'walking-lunges', name: "Walking Lunges", category: "quads", equipment: "dumbbell" },
    
    // Legs - Hamstrings
    { id: 'romanian-deadlift', name: "Romanian Deadlift", category: "hamstrings", equipment: "barbell" },
    { id: 'leg-curl', name: "Leg Curl", category: "hamstrings", equipment: "machine" },
    { id: 'nordic-curls', name: "Nordic Curls", category: "hamstrings", equipment: "bodyweight" },
    
    // Legs - Glutes
    { id: 'hip-thrust', name: "Hip Thrust", category: "glutes", equipment: "barbell" },
    { id: 'glute-bridge', name: "Glute Bridge", category: "glutes", equipment: "bodyweight" },
    { id: 'cable-kickback', name: "Cable Kickback", category: "glutes", equipment: "cable" },
    
    // Legs - Calves
    { id: 'calf-raise', name: "Calf Raise", category: "calves", equipment: "machine" },
    { id: 'seated-calf-raise', name: "Seated Calf Raise", category: "calves", equipment: "machine" },
    
    // Core
    { id: 'plank', name: "Plank", category: "core", equipment: "bodyweight" },
    { id: 'side-plank', name: "Side Plank", category: "core", equipment: "bodyweight" },
    { id: 'crunches', name: "Crunches", category: "core", equipment: "bodyweight" },
    { id: 'bicycle-crunches', name: "Bicycle Crunches", category: "core", equipment: "bodyweight" },
    { id: 'leg-raises', name: "Leg Raises", category: "core", equipment: "bodyweight" },
    { id: 'hanging-leg-raises', name: "Hanging Leg Raises", category: "core", equipment: "bodyweight" },
    { id: 'russian-twist', name: "Russian Twist", category: "core", equipment: "bodyweight" },
    { id: 'ab-wheel', name: "Ab Wheel", category: "core", equipment: "other" },
    { id: 'cable-crunch', name: "Cable Crunch", category: "core", equipment: "cable" },
    
    // Olympic Lifts
    { id: 'clean-and-jerk', name: "Clean and Jerk", category: "olympic", equipment: "barbell" },
    { id: 'snatch', name: "Snatch", category: "olympic", equipment: "barbell" },
    { id: 'power-clean', name: "Power Clean", category: "olympic", equipment: "barbell" },
    { id: 'hang-clean', name: "Hang Clean", category: "olympic", equipment: "barbell" },
    
    // Cardio
    { id: 'running', name: "Running", category: "cardio", equipment: "bodyweight" },
    { id: 'cycling', name: "Cycling", category: "cardio", equipment: "other" },
    { id: 'rowing', name: "Rowing", category: "cardio", equipment: "machine" },
    { id: 'jump-rope', name: "Jump Rope", category: "cardio", equipment: "other" },
    { id: 'burpees', name: "Burpees", category: "cardio", equipment: "bodyweight" },
    
    // Additional exercises
    { id: 'core-work', name: "Core Work", category: "core", equipment: "bodyweight" },
    { id: 'core-work-variation-2', name: "Core Work Variation 2", category: "core", equipment: "bodyweight" },
    { id: 'advanced-core-work', name: "Advanced Core Work", category: "core", equipment: "bodyweight" },
];

// Sort exercises alphabetically
EXERCISES.sort((a, b) => a.name.localeCompare(b.name));

// Export for use in stores
export { EXERCISES };
