import { NextResponse } from "next/server";
import { filterCatalog, ratingLabels } from "@/lib/filterCatalog";

export async function GET() {
  return NextResponse.json({
    categories: filterCatalog,
    ratingLabels
  });
}
