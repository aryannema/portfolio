import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase.server";
import { createClient } from "@/lib/supabase.server";
import PortfolioOS from "@/components/os/PortfolioOS";
import { Profile, Skill, Project } from "@/types";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profile")
    .select("name, tagline, bio, avatar_url")
    .single();

  const name = profile?.name ?? "Developer";
  const tagline = profile?.tagline ?? "A retro OS-style developer portfolio";
  const title = `${name} | Portfolio OS`;
  const images = profile?.avatar_url
    ? [{ url: profile.avatar_url, width: 400, height: 400, alt: name }]
    : [];

  return {
    title,
    description: tagline,
    metadataBase: new URL(SITE_URL),
    keywords: [
      name,
      "developer portfolio",
      "software engineer",
      "full stack developer",
      "portfolio",
      "web developer",
    ],
    authors: [{ name }],
    openGraph: {
      title,
      description: tagline,
      type: "website",
      url: SITE_URL,
      siteName: `${name} — Portfolio OS`,
      images,
    },
    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      title,
      description: tagline,
      images: images.map((i) => i.url),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

async function getPortfolioData() {
  const supabase = await createClient();

  const [profileRes, skillsRes, projectsRes] = await Promise.all([
    supabase.from("profile").select("*").single(),
    supabase.from("skills").select("*").order("sort_order"),
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
  ]);

  let resumeUrl: string | null = null;
  try {
    const { data } = supabase.storage.from("resume").getPublicUrl("resume.pdf");
    if (data?.publicUrl) resumeUrl = data.publicUrl;
  } catch {}

  return {
    profile: (profileRes.data as Profile) ?? null,
    skills: (skillsRes.data as Skill[]) ?? [],
    projects: (projectsRes.data as Project[]) ?? [],
    resumeUrl,
  };
}

export default async function Home() {
  const { profile, skills, projects, resumeUrl } = await getPortfolioData();

  // JSON-LD structured data for Google rich results
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile?.name,
    description: profile?.bio || profile?.tagline,
    url: SITE_URL,
    ...(profile?.github_url && { sameAs: [profile.github_url, profile.linkedin_url].filter(Boolean) }),
    ...(profile?.email && { email: profile.email }),
    ...(profile?.location && { address: { "@type": "PostalAddress", addressLocality: profile.location } }),
  };

  // Safe JSON serialization — prevents </script> injection
  const safeSchema = JSON.stringify(personSchema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSchema }}
      />
      <PortfolioOS
        profile={profile}
        skills={skills}
        projects={projects}
        resumeUrl={resumeUrl}
      />
    </>
  );
}
