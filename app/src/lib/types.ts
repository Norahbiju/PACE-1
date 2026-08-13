export type RatingLabel = "Not used" | "Beginner" | "Working" | "Advanced" | "Expert" | "Mastery";

export type SkillProfile = {
  category: string;
  skill: string;
  ratingLabel: RatingLabel;
  ratingLevel: number;
};

export type Employee = {
  employeeId: string;
  name: string;
  nameNormalized: string;
  email: string;
  role: string;
  location: string;
  yearsOfExperience: number;
  certifications: string[];
  skills: SkillProfile[];
  profileSummary: string;
  projectExperience: string[];
  contact: {
    email: string;
  };
  sourceProfile?: Record<string, string | number | null>;
  lastUpdatedAt: string;
};

export type SkillOption = {
  id: string;
  name: string;
  category: string;
  skillGroup?: string;
};

export type FilterCategory = {
  id: string;
  name: string;
  type: "skills" | "experience" | "location" | "certification";
  options: SkillOption[];
};

export type EmployeeListResponse = {
  items: Employee[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  activeFilters: number;
};

export type EmployeeFilters = {
  categories: string[];
  skills: string[];
  ratings: string[];
  locations: string[];
  experience: string[];
  certifications: string[];
};
