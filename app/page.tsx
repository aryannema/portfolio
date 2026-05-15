import { createClient } from "@/lib/supabase.server";
import PortfolioOS from "@/components/os/PortfolioOS";
import { Profile, Skill, Project } from "@/types";

export const revalidate = 60;

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

  return (
    <PortfolioOS
      profile={profile}
      skills={skills}
      projects={projects}
      resumeUrl={resumeUrl}
    />
  );
}
