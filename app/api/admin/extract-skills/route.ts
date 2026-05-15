import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase.server";

// Keep pdf-parse in Node.js runtime — webpack can't bundle its native deps
export const runtime = "nodejs";

// ── Skill Dictionary ────────────────────────────────────────────────────────
// Each entry: canonical display name, category, optional lowercase aliases.
// The matcher checks the resume text for the canonical name (case-insensitive)
// plus all aliases as whole-word (or whole-phrase) patterns.

interface DictEntry {
  name: string;
  category: "Frontend" | "Backend" | "Database" | "DevOps" | "Mobile" | "Other";
  aliases?: string[];
}

const SKILLS: DictEntry[] = [
  // ── Frontend ──────────────────────────────────────────────────────────────
  { name: "React", category: "Frontend", aliases: ["reactjs", "react.js"] },
  { name: "Vue.js", category: "Frontend", aliases: ["vue", "vuejs", "vue.js"] },
  { name: "Angular", category: "Frontend", aliases: ["angularjs"] },
  { name: "Svelte", category: "Frontend", aliases: ["sveltekit"] },
  { name: "Next.js", category: "Frontend", aliases: ["nextjs"] },
  { name: "Nuxt.js", category: "Frontend", aliases: ["nuxt", "nuxtjs"] },
  { name: "Remix", category: "Frontend" },
  { name: "Astro", category: "Frontend" },
  { name: "Gatsby", category: "Frontend" },
  { name: "SolidJS", category: "Frontend", aliases: ["solid.js"] },
  { name: "TypeScript", category: "Frontend", aliases: ["typescript"] },
  { name: "JavaScript", category: "Frontend", aliases: ["js", "es6", "ecmascript"] },
  { name: "HTML", category: "Frontend", aliases: ["html5"] },
  { name: "CSS", category: "Frontend", aliases: ["css3"] },
  { name: "Tailwind CSS", category: "Frontend", aliases: ["tailwind", "tailwindcss"] },
  { name: "SASS", category: "Frontend", aliases: ["scss", "sass"] },
  { name: "Bootstrap", category: "Frontend" },
  { name: "Material UI", category: "Frontend", aliases: ["mui", "material-ui"] },
  { name: "Chakra UI", category: "Frontend", aliases: ["chakra"] },
  { name: "Ant Design", category: "Frontend", aliases: ["antd"] },
  { name: "Styled Components", category: "Frontend" },
  { name: "Framer Motion", category: "Frontend" },
  { name: "Redux", category: "Frontend" },
  { name: "Zustand", category: "Frontend" },
  { name: "MobX", category: "Frontend", aliases: ["mobx"] },
  { name: "React Query", category: "Frontend", aliases: ["tanstack query", "tanstack"] },
  { name: "Apollo", category: "Frontend", aliases: ["apollo client"] },
  { name: "GraphQL", category: "Frontend" },
  { name: "Vite", category: "Frontend" },
  { name: "Webpack", category: "Frontend" },
  { name: "Rollup", category: "Frontend" },
  { name: "Jest", category: "Frontend" },
  { name: "Vitest", category: "Frontend" },
  { name: "Cypress", category: "Frontend" },
  { name: "Playwright", category: "Frontend" },
  { name: "Storybook", category: "Frontend" },
  { name: "Three.js", category: "Frontend", aliases: ["threejs"] },
  { name: "WebGL", category: "Frontend" },
  { name: "D3.js", category: "Frontend", aliases: ["d3"] },
  { name: "Electron", category: "Frontend" },
  { name: "PWA", category: "Frontend", aliases: ["progressive web app"] },

  // ── Backend ───────────────────────────────────────────────────────────────
  { name: "Node.js", category: "Backend", aliases: ["nodejs", "node"] },
  { name: "Express", category: "Backend", aliases: ["express.js", "expressjs"] },
  { name: "Fastify", category: "Backend" },
  { name: "NestJS", category: "Backend", aliases: ["nest.js", "nestjs"] },
  { name: "Hono", category: "Backend" },
  { name: "Python", category: "Backend" },
  { name: "Django", category: "Backend" },
  { name: "Flask", category: "Backend" },
  { name: "FastAPI", category: "Backend" },
  { name: "Java", category: "Backend" },
  { name: "Spring Boot", category: "Backend", aliases: ["spring framework", "spring"] },
  { name: "Go", category: "Backend", aliases: ["golang"] },
  { name: "Rust", category: "Backend" },
  { name: "C#", category: "Backend", aliases: ["csharp"] },
  { name: "ASP.NET", category: "Backend", aliases: [".net", "dotnet", "asp.net core"] },
  { name: "PHP", category: "Backend" },
  { name: "Laravel", category: "Backend" },
  { name: "Symfony", category: "Backend" },
  { name: "Ruby", category: "Backend" },
  { name: "Ruby on Rails", category: "Backend", aliases: ["rails"] },
  { name: "Elixir", category: "Backend" },
  { name: "Phoenix", category: "Backend" },
  { name: "Scala", category: "Backend" },
  { name: "Kotlin", category: "Backend" },
  { name: "REST API", category: "Backend", aliases: ["rest", "restful api", "restful"] },
  { name: "gRPC", category: "Backend" },
  { name: "WebSocket", category: "Backend", aliases: ["websockets"] },
  { name: "tRPC", category: "Backend" },
  { name: "Deno", category: "Backend" },
  { name: "Bun", category: "Backend" },
  { name: "Prisma", category: "Backend" },
  { name: "Drizzle ORM", category: "Backend", aliases: ["drizzle"] },
  { name: "Serverless", category: "Backend", aliases: ["serverless functions", "lambda"] },
  { name: "GraphQL", category: "Backend" },

  // ── Database ──────────────────────────────────────────────────────────────
  { name: "PostgreSQL", category: "Database", aliases: ["postgres"] },
  { name: "MySQL", category: "Database" },
  { name: "MongoDB", category: "Database", aliases: ["mongo"] },
  { name: "Redis", category: "Database" },
  { name: "SQLite", category: "Database" },
  { name: "Supabase", category: "Database" },
  { name: "Firebase", category: "Database" },
  { name: "DynamoDB", category: "Database" },
  { name: "Elasticsearch", category: "Database", aliases: ["elastic search"] },
  { name: "Cassandra", category: "Database" },
  { name: "Neo4j", category: "Database" },
  { name: "CockroachDB", category: "Database" },
  { name: "PlanetScale", category: "Database" },
  { name: "Neon", category: "Database" },
  { name: "SQL", category: "Database" },
  { name: "TypeORM", category: "Database" },
  { name: "Sequelize", category: "Database" },
  { name: "Mongoose", category: "Database" },
  { name: "Convex", category: "Database" },

  // ── DevOps ────────────────────────────────────────────────────────────────
  { name: "Docker", category: "DevOps" },
  { name: "Kubernetes", category: "DevOps", aliases: ["k8s"] },
  { name: "AWS", category: "DevOps", aliases: ["amazon web services", "amazon aws"] },
  { name: "GCP", category: "DevOps", aliases: ["google cloud", "google cloud platform"] },
  { name: "Azure", category: "DevOps", aliases: ["microsoft azure"] },
  { name: "Vercel", category: "DevOps" },
  { name: "Netlify", category: "DevOps" },
  { name: "Heroku", category: "DevOps" },
  { name: "DigitalOcean", category: "DevOps", aliases: ["digital ocean"] },
  { name: "Cloudflare", category: "DevOps" },
  { name: "GitHub Actions", category: "DevOps", aliases: ["github actions", "github ci"] },
  { name: "GitLab CI", category: "DevOps", aliases: ["gitlab ci", "gitlab ci/cd"] },
  { name: "Jenkins", category: "DevOps" },
  { name: "CircleCI", category: "DevOps" },
  { name: "Terraform", category: "DevOps" },
  { name: "Ansible", category: "DevOps" },
  { name: "Pulumi", category: "DevOps" },
  { name: "Linux", category: "DevOps", aliases: ["ubuntu", "debian", "centos"] },
  { name: "Nginx", category: "DevOps" },
  { name: "Apache", category: "DevOps" },
  { name: "CI/CD", category: "DevOps", aliases: ["cicd", "continuous integration", "continuous deployment"] },
  { name: "Git", category: "DevOps" },
  { name: "Prometheus", category: "DevOps" },
  { name: "Grafana", category: "DevOps" },
  { name: "Datadog", category: "DevOps" },
  { name: "Sentry", category: "DevOps" },

  // ── Mobile ────────────────────────────────────────────────────────────────
  { name: "React Native", category: "Mobile" },
  { name: "Flutter", category: "Mobile" },
  { name: "Swift", category: "Mobile" },
  { name: "SwiftUI", category: "Mobile" },
  { name: "Expo", category: "Mobile" },
  { name: "iOS", category: "Mobile" },
  { name: "Android", category: "Mobile" },
  { name: "Xamarin", category: "Mobile" },
  { name: "Ionic", category: "Mobile" },
  { name: "Capacitor", category: "Mobile" },

  // ── Other ─────────────────────────────────────────────────────────────────
  { name: "Machine Learning", category: "Other", aliases: ["ml", "deep learning"] },
  { name: "TensorFlow", category: "Other" },
  { name: "PyTorch", category: "Other" },
  { name: "OpenAI", category: "Other", aliases: ["chatgpt", "openai api"] },
  { name: "LangChain", category: "Other" },
  { name: "Stripe", category: "Other" },
  { name: "WebAssembly", category: "Other", aliases: ["wasm"] },
  { name: "Figma", category: "Other" },
  { name: "Agile", category: "Other", aliases: ["scrum", "kanban"] },
];

// ── Matcher ──────────────────────────────────────────────────────────────────

function extractSkillsFromText(text: string) {
  const lower = text.toLowerCase();
  const found = new Map<string, DictEntry>();

  for (const entry of SKILLS) {
    if (found.has(entry.name)) continue;

    const terms = [entry.name, ...(entry.aliases ?? [])];
    for (const term of terms) {
      // Match the term as a whole word / phrase (boundaries on both sides)
      const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
      if (re.test(lower)) {
        found.set(entry.name, entry);
        break;
      }
    }
  }

  return Array.from(found.values()).map(({ name, category }) => ({
    name,
    category,
    proficiency: 80,
  }));
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST() {
  // Verify the caller is an authenticated admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Download resume.pdf from Supabase storage via service client
  const service = createServiceClient();
  const { data: blob, error: downloadError } = await service.storage
    .from("resume")
    .download("resume.pdf");

  if (downloadError) {
    console.error("Storage download error:", downloadError);
    return NextResponse.json(
      { error: `Storage error: ${downloadError.message}` },
      { status: 404 }
    );
  }
  if (!blob) {
    return NextResponse.json(
      { error: "No resume found in storage. Upload a resume first." },
      { status: 404 }
    );
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await blob.arrayBuffer());
  } catch (err) {
    console.error("Buffer conversion error:", err);
    return NextResponse.json({ error: "Failed to read PDF data" }, { status: 500 });
  }

  let text: string;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string; numpages: number }>;
    const result = await pdfParse(buffer);
    text = result.text;
    console.log(`PDF parsed: ${result.numpages} pages, ${text.length} chars`);
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse PDF. Make sure it is a valid, non-encrypted PDF." },
      { status: 500 }
    );
  }

  const skills = extractSkillsFromText(text);
  return NextResponse.json({ skills });
}
