// Placeholder data for SignalFeed
export type SourceType = "youtube" | "reddit" | "news" | "article" | "github" | "hackernews" | "devto";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  source: SourceType;
  sourceName: string;
  author: string;
  thumbnail: string;
  category: string;
  tags: string[];
  trendingScore: number;
  timeAgo: string;
  whyRecommended: string;
  url: string;
}

const gradients = [
  "linear-gradient(135deg, oklch(0.5 0.18 145), oklch(0.3 0.12 200))",
  "linear-gradient(135deg, oklch(0.55 0.2 25), oklch(0.35 0.15 320))",
  "linear-gradient(135deg, oklch(0.5 0.2 260), oklch(0.4 0.15 180))",
  "linear-gradient(135deg, oklch(0.6 0.18 70), oklch(0.4 0.15 15))",
  "linear-gradient(135deg, oklch(0.5 0.2 300), oklch(0.35 0.15 200))",
  "linear-gradient(135deg, oklch(0.55 0.18 180), oklch(0.35 0.15 260))",
];

export const sourceMeta: Record<SourceType, { label: string; color: string }> = {
  youtube: { label: "YouTube", color: "oklch(0.62 0.22 25)" },
  reddit: { label: "Reddit", color: "oklch(0.65 0.2 40)" },
  news: { label: "News", color: "oklch(0.65 0.16 220)" },
  article: { label: "Article", color: "oklch(0.7 0.15 145)" },
  github: { label: "GitHub", color: "oklch(0.7 0.04 260)" },
  hackernews: { label: "Hacker News", color: "oklch(0.65 0.18 55)" },
  devto: { label: "Dev.to", color: "oklch(0.2 0.02 0)" },
};

export function thumbFor(i: number) {
  return gradients[i % gradients.length];
}

export const recommendations: Recommendation[] = [
  {
    id: "1",
    title: "The Hidden Cost of Microservices at Scale",
    description: "Engineering teams at Uber, Netflix, and Shopify on what they'd undo about their service architectures.",
    source: "article",
    sourceName: "Dev.to",
    author: "Sarah Chen",
    thumbnail: thumbFor(0),
    category: "Engineering",
    tags: ["architecture", "backend", "scaling"],
    trendingScore: 94,
    timeAgo: "2h ago",
    whyRecommended: "Based on your interest in distributed systems and recent reads on system design.",
    url: "#",
  },
  {
    id: "2",
    title: "Why GPT-5 isn't the AGI moment everyone expected",
    description: "A deep-dive into capability plateaus, benchmark saturation, and the actual delta from frontier labs this year.",
    source: "youtube",
    sourceName: "Two Minute Papers",
    author: "Károly Zsolnai-Fehér",
    thumbnail: thumbFor(1),
    category: "AI Research",
    tags: ["ai", "llm", "research"],
    trendingScore: 98,
    timeAgo: "5h ago",
    whyRecommended: "You watch AI research breakdowns weekly and saved 3 related videos this month.",
    url: "#",
  },
  {
    id: "3",
    title: "I quit FAANG to build a $40k/mo solo SaaS. AMA",
    description: "Indie hacker shares revenue breakdown, tech stack, and the brutal first 6 months in r/SaaS.",
    source: "reddit",
    sourceName: "r/SaaS",
    author: "u/buildinpublic",
    thumbnail: thumbFor(2),
    category: "Entrepreneurship",
    tags: ["startups", "indie", "saas"],
    trendingScore: 87,
    timeAgo: "8h ago",
    whyRecommended: "Matches your interests in indie hacking and startup case studies.",
    url: "#",
  },
  {
    id: "4",
    title: "Apple's M5 chip leaked: 40% performance jump over M4",
    description: "Supply chain reports confirm a new neural engine and on-device LLM acceleration coming Q1 2026.",
    source: "news",
    sourceName: "The Verge",
    author: "Nilay Patel",
    thumbnail: thumbFor(3),
    category: "Hardware",
    tags: ["apple", "silicon", "tech-news"],
    trendingScore: 91,
    timeAgo: "1h ago",
    whyRecommended: "Trending in your Hardware interest cluster.",
    url: "#",
  },
  {
    id: "5",
    title: "shadcn/ui v3 — composable, primitives-first, framework-agnostic",
    description: "12.4k stars this week. Major rewrite using Radix and CSS-first theming.",
    source: "github",
    sourceName: "shadcn/ui",
    author: "@shadcn",
    thumbnail: thumbFor(4),
    category: "Frontend",
    tags: ["react", "ui", "design-systems"],
    trendingScore: 96,
    timeAgo: "3h ago",
    whyRecommended: "You starred 8 component-library repos in the last 30 days.",
    url: "#",
  },
  {
    id: "6",
    title: "How Stripe rebuilt their dashboard in 9 months",
    description: "An inside look at the design system, perf wins, and migration playbook from React to a custom runtime.",
    source: "article",
    sourceName: "Medium",
    author: "Stripe Engineering",
    thumbnail: thumbFor(5),
    category: "Engineering",
    tags: ["design-systems", "performance", "react"],
    trendingScore: 89,
    timeAgo: "6h ago",
    whyRecommended: "Related to articles you saved about design systems.",
    url: "#",
  },
  {
    id: "7",
    title: "The state of European AI startups in 2026",
    description: "Funding, talent, regulation. Mistral, Black Forest Labs, and a new wave from Berlin.",
    source: "news",
    sourceName: "Sifted",
    author: "Mimi Billing",
    thumbnail: thumbFor(0),
    category: "AI Research",
    tags: ["startups", "europe", "ai"],
    trendingScore: 78,
    timeAgo: "12h ago",
    whyRecommended: "You follow European tech ecosystem coverage.",
    url: "#",
  },
  {
    id: "8",
    title: "Linear's new planning model is genuinely different",
    description: "Cycles + initiatives + projects, unified. A walkthrough by a PM who switched 4 tools to it.",
    source: "youtube",
    sourceName: "Productive PM",
    author: "Anna Park",
    thumbnail: thumbFor(2),
    category: "Productivity",
    tags: ["tools", "pm", "workflow"],
    trendingScore: 82,
    timeAgo: "1d ago",
    whyRecommended: "You consume productivity tool reviews regularly.",
    url: "#",
  },
  {
    id: "9",
    title: "Rust is winning systems programming — here's the data",
    description: "Job postings, RFC adoption in Linux kernel, and the new wave of infra startups picking Rust by default.",
    source: "reddit",
    sourceName: "r/programming",
    author: "u/rustacean42",
    thumbnail: thumbFor(3),
    category: "Engineering",
    tags: ["rust", "systems", "trends"],
    trendingScore: 85,
    timeAgo: "10h ago",
    whyRecommended: "Trending in topics you follow.",
    url: "#",
  },
  {
    id: "10",
    title: "vercel/next.js — App Router stabilizes Partial Prerendering",
    description: "PPR shipped to stable in v16. Detailed migration notes and performance benchmarks.",
    source: "github",
    sourceName: "vercel/next.js",
    author: "@vercel",
    thumbnail: thumbFor(4),
    category: "Frontend",
    tags: ["nextjs", "react", "ssr"],
    trendingScore: 93,
    timeAgo: "4h ago",
    whyRecommended: "You follow Next.js releases closely.",
    url: "#",
  },
  {
    id: "11",
    title: "The Default Effect: how product defaults shape behavior",
    description: "Research-backed essay on choice architecture in software.",
    source: "article",
    sourceName: "Nielsen Norman Group",
    author: "Kate Moran",
    thumbnail: thumbFor(5),
    category: "Design",
    tags: ["ux", "research", "psychology"],
    trendingScore: 76,
    timeAgo: "2d ago",
    whyRecommended: "Based on your UX research reading habits.",
    url: "#",
  },
  {
    id: "12",
    title: "Anthropic releases Claude 4.5 Opus with 1M context window",
    description: "Coding benchmarks, agent reliability scores, and pricing breakdown vs GPT and Gemini.",
    source: "news",
    sourceName: "TechCrunch",
    author: "Kyle Wiggers",
    thumbnail: thumbFor(1),
    category: "AI Research",
    tags: ["ai", "anthropic", "llm"],
    trendingScore: 99,
    timeAgo: "30m ago",
    whyRecommended: "Top trending in AI — and you follow Anthropic launches.",
    url: "#",
  },
];

export const trendingTopics = [
  { name: "AI Research", count: 248, change: "+12%" },
  { name: "Frontend", count: 184, change: "+8%" },
  { name: "Engineering", count: 312, change: "+4%" },
  { name: "Startups", count: 156, change: "+22%" },
  { name: "Design", count: 98, change: "+3%" },
  { name: "Productivity", count: 72, change: "-2%" },
  { name: "Hardware", count: 64, change: "+15%" },
  { name: "Security", count: 88, change: "+6%" },
];

export const interestCategories = [
  "AI Research", "Engineering", "Frontend", "Backend", "DevOps",
  "Startups", "Design", "Productivity", "Hardware", "Security",
  "Data Science", "Mobile", "Web3", "Gaming", "Science",
  "Business", "Finance", "Climate", "Health", "Education",
];

export const platforms = [
  { id: "youtube", name: "YouTube", connected: true, desc: "Video content & creators" },
  { id: "reddit", name: "Reddit", connected: true, desc: "Community discussions" },
  { id: "news", name: "News", connected: true, desc: "Major publications" },
  { id: "article", name: "Articles", connected: true, desc: "Medium, Dev.to, blogs" },
  { id: "github", name: "GitHub", connected: false, desc: "Trending repositories" },
  { id: "hackernews", name: "Hacker News", connected: false, desc: "Tech community" },
  { id: "twitter", name: "X / Twitter", connected: false, desc: "Curated lists" },
  { id: "podcast", name: "Podcasts", connected: false, desc: "Audio content" },
];

export const collections = [
  { id: "1", name: "AI Deep Dives", count: 24, color: "oklch(0.5 0.2 260)" },
  { id: "2", name: "Read Tonight", count: 8, color: "oklch(0.55 0.18 145)" },
  { id: "3", name: "Design Inspiration", count: 47, color: "oklch(0.6 0.18 320)" },
  { id: "4", name: "Startup Lessons", count: 18, color: "oklch(0.6 0.18 70)" },
  { id: "5", name: "Engineering Notes", count: 63, color: "oklch(0.55 0.18 200)" },
];
