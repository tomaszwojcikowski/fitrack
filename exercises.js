// Comprehensive exercise database
const EXERCISES = [
    // Chest Exercises
    { name: "Bench Press", category: "Chest", equipment: "Barbell" },
    { name: "Incline Bench Press", category: "Chest", equipment: "Barbell" },
    { name: "Decline Bench Press", category: "Chest", equipment: "Barbell" },
    { name: "Dumbbell Press", category: "Chest", equipment: "Dumbbell" },
    { name: "Incline Dumbbell Press", category: "Chest", equipment: "Dumbbell" },
    { name: "Decline Dumbbell Press", category: "Chest", equipment: "Dumbbell" },
    { name: "Dumbbell Fly", category: "Chest", equipment: "Dumbbell" },
    { name: "Incline Dumbbell Fly", category: "Chest", equipment: "Dumbbell" },
    { name: "Cable Fly", category: "Chest", equipment: "Cable" },
    { name: "Push-ups", category: "Chest", equipment: "Bodyweight" },
    { name: "Wide Push-ups", category: "Chest", equipment: "Bodyweight" },
    { name: "Diamond Push-ups", category: "Chest", equipment: "Bodyweight" },
    { name: "Dips", category: "Chest", equipment: "Bodyweight" },
    { name: "Chest Press Machine", category: "Chest", equipment: "Machine" },
    { name: "Pec Deck", category: "Chest", equipment: "Machine" },
    
    // Back Exercises
    { name: "Deadlift", category: "Back", equipment: "Barbell" },
    { name: "Barbell Row", category: "Back", equipment: "Barbell" },
    { name: "T-Bar Row", category: "Back", equipment: "Barbell" },
    { name: "Pull-ups", category: "Back", equipment: "Bodyweight" },
    { name: "Chin-ups", category: "Back", equipment: "Bodyweight" },
    { name: "Lat Pulldown", category: "Back", equipment: "Cable" },
    { name: "Seated Cable Row", category: "Back", equipment: "Cable" },
    { name: "One Arm Dumbbell Row", category: "Back", equipment: "Dumbbell" },
    { name: "Dumbbell Row", category: "Back", equipment: "Dumbbell" },
    { name: "Face Pulls", category: "Back", equipment: "Cable" },
    { name: "Straight Arm Pulldown", category: "Back", equipment: "Cable" },
    { name: "Hyperextensions", category: "Back", equipment: "Bodyweight" },
    { name: "Good Mornings", category: "Back", equipment: "Barbell" },
    { name: "Rack Pulls", category: "Back", equipment: "Barbell" },
    
    // Shoulders Exercises
    { name: "Overhead Press", category: "Shoulders", equipment: "Barbell" },
    { name: "Military Press", category: "Shoulders", equipment: "Barbell" },
    { name: "Push Press", category: "Shoulders", equipment: "Barbell" },
    { name: "Dumbbell Shoulder Press", category: "Shoulders", equipment: "Dumbbell" },
    { name: "Arnold Press", category: "Shoulders", equipment: "Dumbbell" },
    { name: "Lateral Raise", category: "Shoulders", equipment: "Dumbbell" },
    { name: "Front Raise", category: "Shoulders", equipment: "Dumbbell" },
    { name: "Rear Delt Fly", category: "Shoulders", equipment: "Dumbbell" },
    { name: "Upright Row", category: "Shoulders", equipment: "Barbell" },
    { name: "Shrugs", category: "Shoulders", equipment: "Dumbbell" },
    { name: "Cable Lateral Raise", category: "Shoulders", equipment: "Cable" },
    { name: "Face Pulls", category: "Shoulders", equipment: "Cable" },
    
    // Arms - Biceps
    { name: "Barbell Curl", category: "Biceps", equipment: "Barbell" },
    { name: "EZ Bar Curl", category: "Biceps", equipment: "Barbell" },
    { name: "Dumbbell Curl", category: "Biceps", equipment: "Dumbbell" },
    { name: "Hammer Curl", category: "Biceps", equipment: "Dumbbell" },
    { name: "Concentration Curl", category: "Biceps", equipment: "Dumbbell" },
    { name: "Preacher Curl", category: "Biceps", equipment: "Barbell" },
    { name: "Cable Curl", category: "Biceps", equipment: "Cable" },
    { name: "Incline Dumbbell Curl", category: "Biceps", equipment: "Dumbbell" },
    { name: "Spider Curl", category: "Biceps", equipment: "Barbell" },
    { name: "21s", category: "Biceps", equipment: "Barbell" },
    
    // Arms - Triceps
    { name: "Close Grip Bench Press", category: "Triceps", equipment: "Barbell" },
    { name: "Dips", category: "Triceps", equipment: "Bodyweight" },
    { name: "Tricep Pushdown", category: "Triceps", equipment: "Cable" },
    { name: "Overhead Tricep Extension", category: "Triceps", equipment: "Dumbbell" },
    { name: "Skull Crushers", category: "Triceps", equipment: "Barbell" },
    { name: "Tricep Kickback", category: "Triceps", equipment: "Dumbbell" },
    { name: "Diamond Push-ups", category: "Triceps", equipment: "Bodyweight" },
    { name: "Cable Overhead Extension", category: "Triceps", equipment: "Cable" },
    { name: "Rope Pushdown", category: "Triceps", equipment: "Cable" },
    
    // Legs - Quads
    { name: "Squat", category: "Quads", equipment: "Barbell" },
    { name: "Front Squat", category: "Quads", equipment: "Barbell" },
    { name: "Leg Press", category: "Quads", equipment: "Machine" },
    { name: "Leg Extension", category: "Quads", equipment: "Machine" },
    { name: "Bulgarian Split Squat", category: "Quads", equipment: "Dumbbell" },
    { name: "Lunges", category: "Quads", equipment: "Dumbbell" },
    { name: "Walking Lunges", category: "Quads", equipment: "Dumbbell" },
    { name: "Box Squat", category: "Quads", equipment: "Barbell" },
    { name: "Hack Squat", category: "Quads", equipment: "Machine" },
    { name: "Goblet Squat", category: "Quads", equipment: "Dumbbell" },
    
    // Legs - Hamstrings
    { name: "Romanian Deadlift", category: "Hamstrings", equipment: "Barbell" },
    { name: "Leg Curl", category: "Hamstrings", equipment: "Machine" },
    { name: "Seated Leg Curl", category: "Hamstrings", equipment: "Machine" },
    { name: "Stiff Leg Deadlift", category: "Hamstrings", equipment: "Barbell" },
    { name: "Glute Ham Raise", category: "Hamstrings", equipment: "Bodyweight" },
    { name: "Nordic Curls", category: "Hamstrings", equipment: "Bodyweight" },
    { name: "Single Leg Deadlift", category: "Hamstrings", equipment: "Dumbbell" },
    
    // Legs - Glutes
    { name: "Hip Thrust", category: "Glutes", equipment: "Barbell" },
    { name: "Glute Bridge", category: "Glutes", equipment: "Bodyweight" },
    { name: "Cable Pull Through", category: "Glutes", equipment: "Cable" },
    { name: "Kickbacks", category: "Glutes", equipment: "Cable" },
    
    // Legs - Calves
    { name: "Standing Calf Raise", category: "Calves", equipment: "Machine" },
    { name: "Seated Calf Raise", category: "Calves", equipment: "Machine" },
    { name: "Calf Press", category: "Calves", equipment: "Machine" },
    { name: "Single Leg Calf Raise", category: "Calves", equipment: "Bodyweight" },
    
    // Core/Abs
    { name: "Plank", category: "Core", equipment: "Bodyweight" },
    { name: "Side Plank", category: "Core", equipment: "Bodyweight" },
    { name: "Crunches", category: "Core", equipment: "Bodyweight" },
    { name: "Bicycle Crunches", category: "Core", equipment: "Bodyweight" },
    { name: "Russian Twists", category: "Core", equipment: "Bodyweight" },
    { name: "Leg Raises", category: "Core", equipment: "Bodyweight" },
    { name: "Hanging Leg Raises", category: "Core", equipment: "Bodyweight" },
    { name: "Ab Wheel Rollout", category: "Core", equipment: "Equipment" },
    { name: "Mountain Climbers", category: "Core", equipment: "Bodyweight" },
    { name: "Cable Crunch", category: "Core", equipment: "Cable" },
    { name: "Pallof Press", category: "Core", equipment: "Cable" },
    { name: "Dead Bug", category: "Core", equipment: "Bodyweight" },
    { name: "Bird Dog", category: "Core", equipment: "Bodyweight" },
    
    // Olympic Lifts
    { name: "Clean and Jerk", category: "Olympic", equipment: "Barbell" },
    { name: "Snatch", category: "Olympic", equipment: "Barbell" },
    { name: "Power Clean", category: "Olympic", equipment: "Barbell" },
    { name: "Power Snatch", category: "Olympic", equipment: "Barbell" },
    { name: "Clean", category: "Olympic", equipment: "Barbell" },
    { name: "Hang Clean", category: "Olympic", equipment: "Barbell" },
    
    // Cardio
    { name: "Running", category: "Cardio", equipment: "Bodyweight" },
    { name: "Cycling", category: "Cardio", equipment: "Machine" },
    { name: "Rowing", category: "Cardio", equipment: "Machine" },
    { name: "Jump Rope", category: "Cardio", equipment: "Equipment" },
    { name: "Burpees", category: "Cardio", equipment: "Bodyweight" },
    { name: "Box Jumps", category: "Cardio", equipment: "Equipment" },
    { name: "Battle Ropes", category: "Cardio", equipment: "Equipment" },
    { name: "Sprints", category: "Cardio", equipment: "Bodyweight" },
    { name: "Stair Climber", category: "Cardio", equipment: "Machine" },
    { name: "Elliptical", category: "Cardio", equipment: "Machine" },
];

// Sort exercises alphabetically
EXERCISES.sort((a, b) => a.name.localeCompare(b.name));

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EXERCISES };
}
export { EXERCISES };
