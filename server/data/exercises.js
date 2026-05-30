const exercises = [
  // Chest
  { name: 'Bench Press', category: 'Chest', type: 'strength', muscles: ['chest', 'triceps', 'shoulders'] },
  { name: 'Incline Bench Press', category: 'Chest', type: 'strength', muscles: ['upper chest', 'triceps'] },
  { name: 'Dumbbell Flyes', category: 'Chest', type: 'strength', muscles: ['chest'] },
  { name: 'Push-Up', category: 'Chest', type: 'bodyweight', muscles: ['chest', 'triceps', 'shoulders'] },
  { name: 'Cable Crossover', category: 'Chest', type: 'strength', muscles: ['chest'] },
  // Back
  { name: 'Pull-Up', category: 'Back', type: 'bodyweight', muscles: ['lats', 'biceps'] },
  { name: 'Barbell Row', category: 'Back', type: 'strength', muscles: ['lats', 'rhomboids', 'biceps'] },
  { name: 'Lat Pulldown', category: 'Back', type: 'strength', muscles: ['lats', 'biceps'] },
  { name: 'Seated Cable Row', category: 'Back', type: 'strength', muscles: ['rhomboids', 'lats'] },
  { name: 'Deadlift', category: 'Back', type: 'strength', muscles: ['lower back', 'glutes', 'hamstrings'] },
  { name: 'Dumbbell Row', category: 'Back', type: 'strength', muscles: ['lats', 'rhomboids'] },
  // Shoulders
  { name: 'Overhead Press', category: 'Shoulders', type: 'strength', muscles: ['deltoids', 'triceps'] },
  { name: 'Lateral Raise', category: 'Shoulders', type: 'strength', muscles: ['lateral deltoid'] },
  { name: 'Front Raise', category: 'Shoulders', type: 'strength', muscles: ['front deltoid'] },
  { name: 'Rear Delt Fly', category: 'Shoulders', type: 'strength', muscles: ['rear deltoid'] },
  { name: 'Arnold Press', category: 'Shoulders', type: 'strength', muscles: ['deltoids', 'triceps'] },
  // Arms
  { name: 'Barbell Curl', category: 'Biceps', type: 'strength', muscles: ['biceps'] },
  { name: 'Dumbbell Curl', category: 'Biceps', type: 'strength', muscles: ['biceps'] },
  { name: 'Hammer Curl', category: 'Biceps', type: 'strength', muscles: ['biceps', 'brachialis'] },
  { name: 'Tricep Pushdown', category: 'Triceps', type: 'strength', muscles: ['triceps'] },
  { name: 'Skull Crusher', category: 'Triceps', type: 'strength', muscles: ['triceps'] },
  { name: 'Tricep Dip', category: 'Triceps', type: 'bodyweight', muscles: ['triceps', 'chest'] },
  { name: 'Close Grip Bench Press', category: 'Triceps', type: 'strength', muscles: ['triceps', 'chest'] },
  // Legs
  { name: 'Squat', category: 'Legs', type: 'strength', muscles: ['quads', 'glutes', 'hamstrings'] },
  { name: 'Leg Press', category: 'Legs', type: 'strength', muscles: ['quads', 'glutes'] },
  { name: 'Romanian Deadlift', category: 'Legs', type: 'strength', muscles: ['hamstrings', 'glutes'] },
  { name: 'Lunges', category: 'Legs', type: 'strength', muscles: ['quads', 'glutes'] },
  { name: 'Leg Curl', category: 'Legs', type: 'strength', muscles: ['hamstrings'] },
  { name: 'Leg Extension', category: 'Legs', type: 'strength', muscles: ['quads'] },
  { name: 'Calf Raise', category: 'Legs', type: 'strength', muscles: ['calves'] },
  { name: 'Hip Thrust', category: 'Legs', type: 'strength', muscles: ['glutes'] },
  { name: 'Bulgarian Split Squat', category: 'Legs', type: 'strength', muscles: ['quads', 'glutes'] },
  // Core
  { name: 'Plank', category: 'Core', type: 'bodyweight', muscles: ['core', 'abs'] },
  { name: 'Crunch', category: 'Core', type: 'bodyweight', muscles: ['abs'] },
  { name: 'Russian Twist', category: 'Core', type: 'bodyweight', muscles: ['obliques'] },
  { name: 'Leg Raise', category: 'Core', type: 'bodyweight', muscles: ['lower abs'] },
  { name: 'Ab Wheel Rollout', category: 'Core', type: 'bodyweight', muscles: ['core', 'abs'] },
  { name: 'Cable Crunch', category: 'Core', type: 'strength', muscles: ['abs'] },
  // Cardio
  { name: 'Running', category: 'Cardio', type: 'cardio', muscles: ['full body'] },
  { name: 'Cycling', category: 'Cardio', type: 'cardio', muscles: ['legs', 'cardio'] },
  { name: 'Jump Rope', category: 'Cardio', type: 'cardio', muscles: ['full body'] },
  { name: 'Rowing Machine', category: 'Cardio', type: 'cardio', muscles: ['full body'] },
  { name: 'Stair Climber', category: 'Cardio', type: 'cardio', muscles: ['legs', 'cardio'] },
  { name: 'Elliptical', category: 'Cardio', type: 'cardio', muscles: ['full body'] },
  { name: 'Swimming', category: 'Cardio', type: 'cardio', muscles: ['full body'] },
  { name: 'HIIT Sprint', category: 'Cardio', type: 'cardio', muscles: ['full body'] }
];

module.exports = exercises;
