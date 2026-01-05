export enum ExerciseType {
  Strength = 'Strength',
  Cardio = 'Cardio',
  Bodyweight = 'Bodyweight'
}

export enum ExecutionStyle {
  Normal = 'Normal',
  BiSet = 'Bi-Set',
  DropSet = 'Drop-Set',
  RestPause = 'Rest-Pause'
}

export interface UserProfile {
  name: string;
  email: string;
  password: string; // In a real app, never store plain text. For local-only prototype, this allows basic auth simulation.
  dob: string; // Date of birth YYYY-MM-DD
  gender?: string;
  phone?: string;
  height?: number; // cm
  weight?: number; // kg
  avatar?: string; // base64 or url, optional
}

// The base definition of an exercise in the library
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: string; // string to allow "12-15" or "Failure"
  defaultWeight: number;
  notes?: string;
}

// An actual set performed during a workout
export interface PerformedSet {
  reps: string;
  weight: number;
  completed: boolean;
}

// An exercise assigned to a specific routine split
export interface RoutineExercise {
  id: string; // Unique ID for this entry in the routine
  exerciseId: string; // Reference to the library ID
  targetSets: number;
  targetReps: string;
  restTimeSeconds: number; // Rest time in seconds
  executionStyle: ExecutionStyle;
  notes?: string;
  // We store the LAST performance here to facilitate progressive overload display
  lastPerformance?: {
    date: string;
    sets: PerformedSet[];
  };
}

export interface RoutineSplit {
  id: string;
  name: string; // "A", "B", "Legs", "Push", etc.
  exercises: RoutineExercise[];
}

export interface Routine {
  id: string;
  name: string;
  splits: RoutineSplit[];
  currentSplitIndex: number; // Tracks which split is next (A -> B -> C...)
}

export interface AppData {
  user: UserProfile | null;
  exercises: Exercise[];
  routines: Routine[];
  activeRoutineId: string | null;
  logs: WorkoutLog[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  routineId: string;
  splitName: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: PerformedSet[];
  }[];
}