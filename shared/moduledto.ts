export interface ModuleDto {
  id?: string;
  name: string;
  icon: string;
  color: string;
  progress: number;
  days: DaysDto;
  exercises: ExerciseDto[];
}

export interface DaysDto {
  mon: boolean;
  tues: boolean;
  wed: boolean;
  thur: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

export interface ExerciseDto {
  id?: string;
  name: string;
  completed: boolean;
  text1: string;
  text2?: string;
  altActive?: boolean;
  altName?: string;
  altText1?: string;
  altText2?: string;
}

// Use this for icon
// as ComponentProps<typeof MaterialIcons>["name"]
