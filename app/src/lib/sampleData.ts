import { certifications, locations, ratingLabels, ratingLevels, skillCategories } from "./filterCatalog";
import type { Employee, RatingLabel, SkillProfile } from "./types";

const firstNames = [
  "Aarav", "Ananya", "Arjun", "Devika", "Diya", "Elzabeth", "Ishaan", "Kavya", "Meera", "Nikhil",
  "Priya", "Rahul", "Riya", "Saanvi", "Siddharth", "Sneha", "Thomas", "Varun", "Veda", "Zara",
  "Aditya", "Aisha", "Kiran", "Lakshmi", "Neha"
];

const lastNames = [
  "Menon", "Nair", "Iyer", "Joseph", "Mathew", "Lalson", "Raman", "George", "Pillai", "Biju",
  "Kumar", "Sharma", "Rao", "Das", "Varghese", "Koshy", "Thomas", "Mohan", "Prasad", "Kapoor",
  "Reddy", "Bose", "Kurian", "Nambiar", "Chacko"
];

const roles = [
  "DevOps Engineer",
  "Senior DevOps Engineer",
  "Cloud Engineer",
  "Platform Engineer",
  "Release Engineer",
  "SRE Consultant",
  "Automation Engineer",
  "Build and Release Lead"
];

function pick<T>(items: T[], index: number, offset = 0): T {
  return items[(index + offset) % items.length];
}

function makeSkills(index: number): SkillProfile[] {
  const profiles: SkillProfile[] = [];

  skillCategories.forEach((category, categoryIndex) => {
    category.options.forEach((option, optionIndex) => {
      const shouldUse = (index + categoryIndex + optionIndex) % 3 !== 0;
      const label = shouldUse ? pick(ratingLabels.slice(1), index + optionIndex + categoryIndex) : "Not used";
      profiles.push({
        category: category.name,
        skill: option.name,
        ratingLabel: label as RatingLabel,
        ratingLevel: ratingLevels[label as RatingLabel]
      });
    });
  });

  return profiles;
}

export function createSampleEmployees(): Employee[] {
  return Array.from({ length: 50 }, (_, index) => {
    const name = `${pick(firstNames, index)} ${pick(lastNames, index, Math.floor(index / 2))}`;
    const certPool = certifications.filter((certification) => certification !== "No certification");
    const employeeCerts = index % 5 === 0 ? [] : [pick(certPool, index), ...(index % 4 === 0 ? [pick(certPool, index, 2)] : [])];
    const email = `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@ust.com`;
    const employeeId = `PACE-${String(index + 1).padStart(4, "0")}`;

    return {
      employeeId,
      name,
      nameNormalized: name.toLowerCase(),
      email,
      role: pick(roles, index),
      location: pick(locations, index),
      yearsOfExperience: Math.min(index % 12, 10),
      certifications: employeeCerts,
      skills: makeSkills(index),
      profileSummary: `${name} focuses on cloud, automation, and delivery practices for enterprise platform teams.`,
      projectExperience: [
        `Delivered CI/CD improvements for release stream ${index + 1}.`,
        `Supported infrastructure automation and observability adoption across distributed teams.`
      ],
      contact: { email },
      sourceProfile: {
        ID: index + 2,
        Email: email,
        Name: name,
        "Enter your Employee ID": employeeId
      },
      lastUpdatedAt: new Date("2026-08-13T00:00:00.000Z").toISOString()
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}
