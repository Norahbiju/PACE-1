import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as XLSX from "xlsx";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { documentClient, putEmployee, tableName } from "../src/lib/dynamodb";
import { certifications, locations, ratingLevels, skillNameToCategory } from "../src/lib/filterCatalog";
import { createSampleEmployees } from "../src/lib/sampleData";
import type { Employee, RatingLabel, SkillProfile } from "../src/lib/types";

const rootDir = path.resolve(process.cwd(), "..");
const baselinePath = path.join(rootDir, "PACE DevOps Skills Baseline Profile(1-1).xlsx");

const ratingAliases: Record<string, RatingLabel> = {
  "not used": "Not used",
  beginner: "Beginner",
  working: "Working",
  advanced: "Advanced",
  expert: "Expert",
  mastery: "Mastery"
};

function stableId(value: string) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function normalizeRating(value: unknown): RatingLabel {
  const key = String(value || "Not used").trim().toLowerCase();
  return ratingAliases[key] || "Not used";
}

function readBaselineRows(): Record<string, string | number | null>[] {
  if (!fs.existsSync(baselinePath)) {
    return [];
  }

  const workbook = XLSX.readFile(baselinePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, string | number | null>>(sheet, { defval: null });
}

function rowToEmployee(row: Record<string, string | number | null>, index: number): Employee {
  const name = String(row.Name || `PACE Employee ${index + 1}`);
  const email = String(row.Email || `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@ust.com`);
  const employeeIdSource = String(row["Enter your Employee ID"] || email || name);
  const employeeId = employeeIdSource.includes("@") ? `PACE-${stableId(employeeIdSource)}` : employeeIdSource;

  const skills: SkillProfile[] = [];
  for (const [skillName, category] of skillNameToCategory.entries()) {
    const ratingLabel = normalizeRating(row[skillName]);
    skills.push({
      category,
      skill: skillName,
      ratingLabel,
      ratingLevel: ratingLevels[ratingLabel]
    });
  }

  const selectedCerts = index % 5 === 0 ? [] : [certifications[index % (certifications.length - 1)]];

  return {
    employeeId,
    name,
    nameNormalized: name.toLowerCase(),
    email,
    role: index % 3 === 0 ? "Senior DevOps Engineer" : index % 3 === 1 ? "Cloud Engineer" : "Platform Engineer",
    location: locations[index % locations.length],
    yearsOfExperience: Math.min(index % 12, 10),
    certifications: selectedCerts,
    skills,
    profileSummary: `${name} has a DevOps baseline profile imported from the approved PACE workbook schema.`,
    projectExperience: [
      "Imported baseline skill profile from the submitted workbook.",
      "Mapped category responses and skill ratings into DynamoDB filter facets."
    ],
    contact: { email },
    sourceProfile: row,
    lastUpdatedAt: new Date().toISOString()
  };
}

async function exists(employeeId: string) {
  const result = await documentClient.send(
    new GetCommand({
      TableName: tableName,
      Key: { employeeId }
    })
  );
  return Boolean(result.Item);
}

async function main() {
  const baselineRows = readBaselineRows();
  const imported = baselineRows.map(rowToEmployee);
  const generated = createSampleEmployees();
  const employeesById = new Map<string, Employee>();

  [...imported, ...generated].forEach((employee, index) => {
    const id = employee.employeeId || `PACE-${String(index + 1).padStart(4, "0")}`;
    if (!employeesById.has(id)) employeesById.set(id, { ...employee, employeeId: id });
  });

  const employees = Array.from(employeesById.values()).slice(0, 50);
  let inserted = 0;
  let skippedDuplicate = 0;
  let failed = 0;

  for (const employee of employees) {
    try {
      if (await exists(employee.employeeId)) {
        skippedDuplicate += 1;
        continue;
      }

      await putEmployee(employee);
      inserted += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed to seed ${employee.employeeId}`, error);
    }
  }

  console.log(JSON.stringify({ tableName, target: 50, inserted, skippedDuplicate, failed }, null, 2));

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
