import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { createSampleEmployees } from "./sampleData";
import type { Employee } from "./types";

const region = process.env.AWS_REGION || "us-east-1";
export const tableName = process.env.DYNAMODB_TABLE_NAME || "pace-employees";

const client = new DynamoDBClient({ region });
export const documentClient = DynamoDBDocumentClient.from(client);

export async function listEmployeesFromStore(): Promise<Employee[]> {
  if (process.env.USE_SAMPLE_DATA === "true" || !process.env.AWS_REGION) {
    return createSampleEmployees();
  }

  try {
    const employees: Employee[] = [];
    let ExclusiveStartKey: Record<string, unknown> | undefined;

    do {
      const result = await documentClient.send(
        new ScanCommand({
          TableName: tableName,
          ExclusiveStartKey
        })
      );
      employees.push(...((result.Items || []) as Employee[]));
      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return employees.length ? employees.sort((a, b) => a.name.localeCompare(b.name)) : createSampleEmployees();
  } catch {
    return createSampleEmployees();
  }
}

export async function getEmployeeFromStore(employeeId: string): Promise<Employee | null> {
  if (process.env.USE_SAMPLE_DATA === "true" || !process.env.AWS_REGION) {
    return createSampleEmployees().find((employee) => employee.employeeId === employeeId) || null;
  }

  try {
    const result = await documentClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { employeeId }
      })
    );
    return (result.Item as Employee | undefined) || null;
  } catch {
    return createSampleEmployees().find((employee) => employee.employeeId === employeeId) || null;
  }
}

export async function putEmployee(employee: Employee) {
  return documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: employee
    })
  );
}
