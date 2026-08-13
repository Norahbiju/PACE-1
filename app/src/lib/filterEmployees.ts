import type { Employee, EmployeeFilters } from "./types";

export function emptyFilters(): EmployeeFilters {
  return {
    categories: [],
    skills: [],
    ratings: [],
    locations: [],
    experience: [],
    certifications: []
  };
}

export function countActiveFilters(filters: EmployeeFilters): number {
  return Object.values(filters).reduce((total, values) => total + values.length, 0);
}

export function parseFilters(searchParams: URLSearchParams): EmployeeFilters {
  const read = (key: keyof EmployeeFilters) => searchParams.get(key)?.split("|").filter(Boolean) || [];
  return {
    categories: read("categories"),
    skills: read("skills"),
    ratings: read("ratings"),
    locations: read("locations"),
    experience: read("experience"),
    certifications: read("certifications")
  };
}

export function filterEmployees(employees: Employee[], filters: EmployeeFilters): Employee[] {
  return employees.filter((employee) => {
    if (filters.categories.length && !filters.categories.some((category) => employee.skills.some((skill) => skill.category === category && skill.ratingLabel !== "Not used"))) {
      return false;
    }

    if (filters.skills.length && !filters.skills.some((skillName) => employee.skills.some((skill) => skill.skill === skillName && skill.ratingLabel !== "Not used"))) {
      return false;
    }

    if (filters.ratings.length && !filters.ratings.some((rating) => employee.skills.some((skill) => skill.ratingLabel === rating))) {
      return false;
    }

    if (filters.locations.length && !filters.locations.includes(employee.location)) {
      return false;
    }

    if (filters.experience.length) {
      const years = employee.yearsOfExperience >= 10 ? "10+" : String(employee.yearsOfExperience);
      if (!filters.experience.includes(years)) return false;
    }

    if (filters.certifications.length) {
      const noCertSelected = filters.certifications.includes("No certification");
      const certMatch = filters.certifications.some((certification) => employee.certifications.includes(certification));
      if (!certMatch && !(noCertSelected && employee.certifications.length === 0)) return false;
    }

    return true;
  });
}
