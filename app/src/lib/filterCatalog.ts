import type { FilterCategory, RatingLabel, SkillOption } from "./types";

export const ratingLabels: RatingLabel[] = ["Not used", "Beginner", "Working", "Advanced", "Expert", "Mastery"];

export const ratingLevels: Record<RatingLabel, number> = {
  "Not used": 0,
  Beginner: 1,
  Working: 2,
  Advanced: 3,
  Expert: 4,
  Mastery: 5
};

const skillGroups: Record<string, string[]> = {
  Cloud: ["AWS CloudFormation", "Chef", "OpenStack", "Puppet", "Azure ARM Templates", "Packer"],
  SCM: ["Git", "GitHub", "TFS/VTVS", "Bitbucket", "AWS CodeCommit", "Azure Repos", "Google Cloud Source Repositories"],
  Containerization: ["Kubernetes (Classic)", "ECR/EKS (AWS)", "ACS/AKS (Azure)", "Mesos", "GCE/GKE (Google)"],
  "Build Management": ["Maven (Java)", "MSBuild (.NET)", "AWS CodeBuild", "ANT", "BuildMaster", "UrbanCode Build", "Build Concepts"],
  "Continuous Integration": ["Maven (Java) CI", "Jenkins", "AWS CodePipeline", "Azure DevOps", "Bamboo", "TeamCity", "Google Cloud Build CI/CD"],
  "Repo Management": ["Nexus", "Artifactory", "NuGet"],
  "Testing & QA": ["Mockito", "TestNG", "Selenium", "Cucumber", "JUnit", "JMeter", "Statement 2"],
  "Deployment Automation": ["AWS CodeDeploy", "Octopus Deploy", "Go", "UrbanCode Deploy"],
  "Monitoring & Analysis": ["Grafana", "AWS CloudWatch / CloudTrail", "Azure Monitor / Application Insights", "New Relic", "Nagios", "Splunk", "Graphite", "Elasticsearch, Logstash, Kibana (ELK)"],
  Security: ["Application Security Concepts", "CyberArk", "AWS Secrets Manager", "Azure Key Vault", "GCP Secret Manager"],
  Consulting: ["Assessments", "Due Diligence", "Solution Design & Architecture", "Process Mapping", "Pre-Sales", "Other Consulting Skills"],
  Programming: ["Java / J2EE", ".NET / C# / C++", "Groovy", "Python", "Other Programming Skills"],
  Backend: ["Databases", "Other Backend Skills"],
  Scripting: ["PowerShell Scripting", "Linux & Windows Shell Scripting", "Other Scripting Skills"]
};

export const locations = ["Trivandrum", "Kochi", "Bangalore", "Hyderabad", "Pune", "Chennai", "US", "GB"];
export const experienceBands = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];
export const certifications = ["GH-200", "GH-100", "GH-600", "TERRAFORM", "CKA", "No certification"];

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const skillCategories: FilterCategory[] = Object.entries(skillGroups).map(([category, skills]) => ({
  id: slug(category),
  name: category,
  type: "skills",
  options: skills.map<SkillOption>((skill) => ({
    id: slug(`${category}-${skill}`),
    name: skill,
    category
  }))
}));

export const filterCatalog: FilterCategory[] = [
  ...skillCategories,
  {
    id: "years-of-experience",
    name: "Years of experience",
    type: "experience",
    options: experienceBands.map((band) => ({ id: slug(`experience-${band}`), name: band, category: "Years of experience" }))
  },
  {
    id: "location",
    name: "Location",
    type: "location",
    options: locations.map((location) => ({ id: slug(`location-${location}`), name: location, category: "Location" }))
  },
  {
    id: "certifications",
    name: "Certifications",
    type: "certification",
    options: certifications.map((certification) => ({ id: slug(`certification-${certification}`), name: certification, category: "Certifications" }))
  }
];

export const skillNameToCategory = new Map(
  skillCategories.flatMap((category) => category.options.map((option) => [option.name, category.name] as const))
);
