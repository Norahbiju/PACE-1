import { NextResponse } from "next/server";
import { listEmployeesFromStore, tableName } from "@/lib/dynamodb";

export async function GET() {
  const employees = await listEmployeesFromStore();

  return NextResponse.json({
    status: "ok",
    tableName,
    employeesAvailable: employees.length
  });
}
