const workoutPlans = [
  {
    id: 'ppl',
    name: 'Push Pull Legs (PPL)',
    difficulty: 'Intermediate',
    daysPerWeek: 6,
    goal: 'Muscle Building',
    description: 'Classic 6-day split alternating push, pull, and legs for maximum muscle growth.',
    days: [
      {
        day: 'Push Day A',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '6-8', rest: '3 min' },
          { name: 'Incline Bench Press', sets: 3, reps: '8-12', rest: '2 min' },
          { name: 'Overhead Press', sets: 3, reps: '8-12', rest: '2 min' },
          { name: 'Lateral Raise', sets: 4, reps: '15-20', rest: '1 min' },
          { name: 'Tricep Pushdown', sets: 3, reps: '10-15', rest: '1 min' },
          { name: 'Skull Crusher', sets: 3, reps: '10-15', rest: '1 min' }
        ]
      },
      {
        day: 'Pull Day A',
        exercises: [
          { name: 'Deadlift', sets: 4, reps: '4-6', rest: '4 min' },
          { name: 'Barbell Row', sets: 4, reps: '6-8', rest: '3 min' },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '2 min' },
          { name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: '2 min' },
          { name: 'Barbell Curl', sets: 3, reps: '10-15', rest: '1 min' },
          { name: 'Hammer Curl', sets: 3, reps: '10-15', rest: '1 min' }
        ]
      },
      {
        day: 'Legs Day A',
        exercises: [
          { name: 'Squat', sets: 4, reps: '6-8', rest: '3 min' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-12', rest: '2 min' },
          { name: 'Leg Press', sets: 3, reps: '10-15', rest: '2 min' },
          { name: 'Leg Curl', sets: 3, reps: '10-15', rest: '1 min' },
          { name: 'Calf Raise', sets: 4, reps: '15-20', rest: '1 min' }
        ]
      }
    ]
  },
  {
    id: 'full-body-beginner',
    name: 'Full Body Beginner',
    difficulty: 'Beginner',
    daysPerWeek: 3,
    goal: 'General Fitness',
    description: 'Perfect 3-day full-body routine for beginners focusing on compound movements.',
    days: [
      {
        day: 'Day A (Mon/Thu)',
        exercises: [
          { name: 'Squat', sets: 3, reps: '5', rest: '3 min' },
          { name: 'Bench Press', sets: 3, reps: '5', rest: '3 min' },
          { name: 'Barbell Row', sets: 3, reps: '5', rest: '3 min' }
        ]
      },
      {
        day: 'Day B (Wed/Sat)',
        exercises: [
          { name: 'Squat', sets: 3, reps: '5', rest: '3 min' },
          { name: 'Overhead Press', sets: 3, reps: '5', rest: '3 min' },
          { name: 'Deadlift', sets: 1, reps: '5', rest: '4 min' }
        ]
      }
    ]
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower Split',
    difficulty: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Strength & Hypertrophy',
    description: '4-day upper/lower split balancing strength and hypertrophy training.',
    days: [
      {
        day: 'Upper A (Monday)',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '4-6', rest: '3 min' },
          { name: 'Barbell Row', sets: 4, reps: '4-6', rest: '3 min' },
          { name: 'Overhead Press', sets: 3, reps: '6-8', rest: '2 min' },
          { name: 'Pull-Up', sets: 3, reps: '6-10', rest: '2 min' },
          { name: 'Dumbbell Curl', sets: 3, reps: '10-12', rest: '1 min' },
          { name: 'Tricep Pushdown', sets: 3, reps: '10-12', rest: '1 min' }
        ]
      },
      {
        day: 'Lower A (Tuesday)',
        exercises: [
          { name: 'Squat', sets: 4, reps: '4-6', rest: '3 min' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: '2 min' },
          { name: 'Leg Press', sets: 3, reps: '10-15', rest: '2 min' },
          { name: 'Leg Curl', sets: 3, reps: '10-15', rest: '1 min' },
          { name: 'Calf Raise', sets: 4, reps: '15-20', rest: '1 min' }
        ]
      },
      {
        day: 'Upper B (Thursday)',
        exercises: [
          { name: 'Incline Bench Press', sets: 4, reps: '8-12', rest: '2 min' },
          { name: 'Lat Pulldown', sets: 4, reps: '8-12', rest: '2 min' },
          { name: 'Lateral Raise', sets: 4, reps: '12-15', rest: '1 min' },
          { name: 'Seated Cable Row', sets: 3, reps: '10-15', rest: '2 min' },
          { name: 'Barbell Curl', sets: 3, reps: '12-15', rest: '1 min' },
          { name: 'Skull Crusher', sets: 3, reps: '12-15', rest: '1 min' }
        ]
      },
      {
        day: 'Lower B (Friday)',
        exercises: [
          { name: 'Deadlift', sets: 3, reps: '4-6', rest: '4 min' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10-15', rest: '2 min' },
          { name: 'Leg Extension', sets: 3, reps: '12-15', rest: '1 min' },
          { name: 'Hip Thrust', sets: 3, reps: '10-15', rest: '2 min' },
          { name: 'Calf Raise', sets: 4, reps: '15-20', rest: '1 min' }
        ]
      }
    ]
  },
  {
    id: 'hiit-fat-loss',
    name: 'HIIT Fat Loss Program',
    difficulty: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Fat Loss',
    description: '4-day HIIT and circuit training program designed to maximize calorie burn.',
    days: [
      {
        day: 'HIIT Circuit A',
        exercises: [
          { name: 'HIIT Sprint', sets: 8, reps: '30s on / 30s off', rest: 'see notes' },
          { name: 'Jump Rope', sets: 3, reps: '2 min', rest: '1 min' },
          { name: 'Push-Up', sets: 3, reps: '15-20', rest: '45s' },
          { name: 'Squat', sets: 3, reps: '15-20', rest: '45s' },
          { name: 'Plank', sets: 3, reps: '45s hold', rest: '30s' }
        ]
      },
      {
        day: 'Strength Circuit A',
        exercises: [
          { name: 'Deadlift', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Bench Press', sets: 4, reps: '10-12', rest: '90s' },
          { name: 'Squat', sets: 4, reps: '10-12', rest: '90s' },
          { name: 'Barbell Row', sets: 3, reps: '10-12', rest: '90s' },
          { name: 'Russian Twist', sets: 3, reps: '20', rest: '45s' }
        ]
      }
    ]
  },
  {
    id: 'bodyweight-home',
    name: 'Home Bodyweight Training',
    difficulty: 'Beginner',
    daysPerWeek: 4,
    goal: 'General Fitness',
    description: 'No equipment needed. Build strength and fitness at home using only your bodyweight.',
    days: [
      {
        day: 'Upper Body (Mon/Thu)',
        exercises: [
          { name: 'Push-Up', sets: 4, reps: '10-20', rest: '90s' },
          { name: 'Pull-Up', sets: 3, reps: '5-10', rest: '2 min' },
          { name: 'Tricep Dip', sets: 3, reps: '10-15', rest: '90s' },
          { name: 'Plank', sets: 3, reps: '45s', rest: '45s' }
        ]
      },
      {
        day: 'Lower Body (Tue/Fri)',
        exercises: [
          { name: 'Squat', sets: 4, reps: '15-20', rest: '90s' },
          { name: 'Lunges', sets: 3, reps: '12/leg', rest: '90s' },
          { name: 'Hip Thrust', sets: 3, reps: '15', rest: '90s' },
          { name: 'Calf Raise', sets: 4, reps: '20', rest: '60s' },
          { name: 'Leg Raise', sets: 3, reps: '15', rest: '60s' }
        ]
      }
    ]
  }
];

module.exports = workoutPlans;
