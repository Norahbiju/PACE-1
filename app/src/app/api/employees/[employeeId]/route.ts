import { NextRequest, NextResponse } from "next/server";
import { getEmployeeFromStore } from "@/lib/dynamodb";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ employeeId: string }> }) {
  const { employeeId } = await params;
  const employee = await getEmployeeFromStore(employeeId);

  if (!employee) {
    return NextResponse.json({ message: "Employee not found" }, { status: 404 });
  }

  return NextResponse.json(employee);
}
