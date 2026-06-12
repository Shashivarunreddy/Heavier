export interface ExerciseInfo {
  name: string;
  category: "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";
  targetMuscle: string;
  instructions: string;
}

export const EXERCISE_LIBRARY: ExerciseInfo[] = [
  {
    name: "Bench Press",
    category: "Chest",
    targetMuscle: "Pectorals, Triceps, Anterior Deltoids",
    instructions: "Lie flat on a bench, grip the barbell slightly wider than shoulder width, lower it to your mid-chest, and press it back up while keeping your feet flat on the floor."
  },
  {
    name: "Incline Dumbbell Press",
    category: "Chest",
    targetMuscle: "Upper Pectorals, Anterior Deltoids, Triceps",
    instructions: "Sit on an incline bench (30-45 degrees) holding dumbbells at chest level. Press dumbbells upward until arms are extended, then lower them slowly."
  },
  {
    name: "Push-Up",
    category: "Chest",
    targetMuscle: "Pectorals, Triceps, Core",
    instructions: "Start in a plank position with hands slightly wider than shoulder-width. Lower your body until your chest almost touches the floor, then push back up."
  },
  {
    name: "Squat",
    category: "Legs",
    targetMuscle: "Quadriceps, Glutes, Hamstrings",
    instructions: "Place a barbell on your upper back. Stand with feet shoulder-width apart, bend knees and hips to lower your thighs to parallel or below, then push back up."
  },
  {
    name: "Leg Press",
    category: "Legs",
    targetMuscle: "Quadriceps, Glutes, Hamstrings",
    instructions: "Sit in the leg press machine, place feet on the sled. Release the safety lock, bend knees to lower the sled toward your chest, then press it back up."
  },
  {
    name: "Lunge",
    category: "Legs",
    targetMuscle: "Quadriceps, Glutes, Hamstrings",
    instructions: "Step forward with one foot, lower your hips until both knees are bent at about 90 degrees, then push off the front foot to return to the starting position."
  },
  {
    name: "Deadlift",
    category: "Back",
    targetMuscle: "Erector Spinae, Glutes, Hamstrings, Lats",
    instructions: "Stand with feet mid-bar. Bend and grip the bar. Keep your back straight, drive through your feet, hips forward, and lift the bar to standing height."
  },
  {
    name: "Lat Pulldown",
    category: "Back",
    targetMuscle: "Latissimus Dorsi, Biceps, Upper Back",
    instructions: "Sit at a pulldown station. Grip the bar wide, pull it down to your collarbone while squeezing your shoulder blades together, then return slowly."
  },
  {
    name: "Barbell Row",
    category: "Back",
    targetMuscle: "Lats, Rhomboids, Rear Deltoids, Biceps",
    instructions: "Bend at the hips, keeping your back flat. Hold the barbell with an overhand grip, pull the bar to your lower ribcage, and lower it with control."
  },
  {
    name: "Pull-Up",
    category: "Back",
    targetMuscle: "Lats, Biceps, Upper Back",
    instructions: "Hang from a pull-up bar with hands wider than shoulders, palms facing away. Pull your body up until your chin is over the bar, then lower with control."
  },
  {
    name: "Shoulder Press",
    category: "Shoulders",
    targetMuscle: "Deltoids, Triceps, Upper Pectorals",
    instructions: "Hold a barbell or dumbbells at shoulder height. Press straight overhead until arms are locked out, then lower back to shoulder height."
  },
  {
    name: "Lateral Raise",
    category: "Shoulders",
    targetMuscle: "Lateral Deltoids",
    instructions: "Stand holding dumbbells at your sides. Keeping a slight bend in your elbows, raise the weights out to your sides until arms are parallel to the floor."
  },
  {
    name: "Bicep Curl",
    category: "Arms",
    targetMuscle: "Biceps Brachii",
    instructions: "Hold dumbbells or a barbell at thighs. Keep elbows tucked at sides, curl weights toward shoulders, squeeze biceps, and slowly lower."
  },
  {
    name: "Tricep Pushdown",
    category: "Arms",
    targetMuscle: "Triceps Brachii",
    instructions: "Hold a cable attachment at chest height. Keep elbows tucked in, push the cable down until arms are fully extended, squeeze, and slowly return."
  },
  {
    name: "Plank",
    category: "Core",
    targetMuscle: "Rectus Abdominis, Obliques, Lower Back",
    instructions: "Support body weight on forearms and toes. Keep body in a straight line, engage core, and hold the position."
  },
  {
    name: "Crunch",
    category: "Core",
    targetMuscle: "Rectus Abdominis",
    instructions: "Lie flat on your back, knees bent, feet flat. Place hands behind head or on chest, lift your head and shoulders off the floor using your abs, and lower."
  }
];
