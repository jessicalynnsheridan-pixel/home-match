import { notFound } from "next/navigation";
import { getListings, getListing } from "@/lib/getListings";
import ListingDetail from "./ListingDetail";

export const revalidate = 900; // refresh every 15 minutes

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  return <ListingDetail listing={listing} />;
}

export async function generateStaticParams() {
  const listings = await getListings();
  return listings.map((l) => ({ id: l.id }));
}
