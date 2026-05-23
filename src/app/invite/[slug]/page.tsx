import InviteClient from "./InviteClient";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ via?: string; r?: string }>;
}) {
  const { slug } = await params;
  const { via, r } = await searchParams;

  // Map ?via= query param to an attribution source
  const sourceMap: Record<string, "qr_code" | "bio_link" | "text" | "website" | "invite_link"> = {
    qr: "qr_code",
    bio: "bio_link",
    sms: "text",
    text: "text",
    web: "website",
    site: "website",
  };
  const source = (via && sourceMap[via]) || "invite_link";

  // r = realtor UUID passed through from the dashboard share link
  return <InviteClient slug={slug} source={source} realtorId={r} />;
}

export function generateMetadata() {
  return {
    title: "Your Personal Home Search · HomeMatch",
    description: "A curated home search experience built around your life.",
  };
}
