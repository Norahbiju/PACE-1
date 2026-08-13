import { NextRequest, NextResponse } from "next/server";
import { countActiveFilters, filterEmployees, parseFilters } from "@/lib/filterEmployees";
import { listEmployeesFromStore } from "@/lib/dynamodb";

export async function GET(request: NextRequest) {
  const page = Math.max(Number(request.nextUrl.searchParams.get("page") || 1), 1);
  const pageSize = Math.min(Math.max(Number(request.nextUrl.searchParams.get("pageSize") || 20), 1), 100);
  const filters = parseFilters(request.nextUrl.searchParams);
  const employees = await listEmployeesFromStore();
  const filtered = filterEmployees(employees, filters).sort((a, b) => a.name.localeCompare(b.name));
  const start = (page - 1) * pageSize;

  return NextResponse.json({
    items: filtered.slice(start, start + pageSize),
    page,
    pageSize,
    total: filtered.length,
    totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
    activeFilters: countActiveFilters(filters)
  });
}
