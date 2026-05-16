import { getListings } from "@/lib/getListings";
import ListingsClient from "./ListingsClient";

export const revalidate = 900; // refresh every 15 minutes

export default async function ListingsPage() {
  const listings = await getListings();
  return <ListingsClient initialListings={listings} />;
}
