import { notFound } from "next/navigation";
import { niagaraListings } from "@/data/niagaraListings";
import ListingDetail from "./ListingDetail";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = niagaraListings.find((l) => l.id === id);
  if (!listing) notFound();

  return <ListingDetail listing={listing} />;
}

export function generateStaticParams() {
  return niagaraListings.map((l) => ({ id: l.id }));
}
