import { NextResponse } from "next/server";
import { getListings } from "@/lib/getListings";

export async function GET() {
  const listings = await getListings();
  return NextResponse.json(listings);
}
