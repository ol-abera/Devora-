import type { CourseDetail, InstructorSummary, Category, PlaygroundChallenge } from "@/api/types"

type Instructor = InstructorSummary
type Course = CourseDetail

const instructors: Instructor[] = [
  { id: "i1", name: "Sarah Chen", title: "Staff Engineer @ Vercel", avatar: "SC", bio: "Former React core contributor with 12 years building production systems at scale.", courses: 4, students: 28400, rating: 4.9 },
  { id: "i2", name: "Marcus Rivera", title: "ML Lead @ Anthropic", avatar: "MR", bio: "PhD in NLP from Stanford. Built agentic systems serving millions.", courses: 3, students: 19200, rating: 4.8 },
  { id: "i3", name: "Aisha Patel", title: "Principal SRE @ Cloudflare", avatar: "AP", bio: "Kubernetes contributor and CNCF ambassador. Designed multi-region infrastructure.", courses: 2, students: 15800, rating: 4.9 },
  { id: "i4", name: "James Okafor", title: "Systems Architect @ AWS", avatar: "JO", bio: "Rust evangelist and Tokio maintainer. Built critical AWS infrastructure.", courses: 3, students: 12100, rating: 4.7 },
  { id: "i5", name: "Elena Volkov", title: "Design Engineer @ Stripe", avatar: "EV", bio: "Created the design system powering Stripe Checkout.", courses: 2, students: 9800, rating: 4.8 },
]

export const categories: Category[] = [
  { id: "c1", name: "Web Development", icon: "Code2", courseCount: 24, color: "#7C3AED" },
  { id: "c2", name: "AI & Machine Learning", icon: "Brain", courseCount: 18, color: "#06B6D4" },
  { id: "c3", name: "Cloud & DevOps", icon: "Cloud", courseCount: 15, color: "#10B981" },
  { id: "c4", name: "Mobile Development", icon: "Smartphone", courseCount: 12, color: "#F59E0B" },
  { id: "c5", name: "Systems Programming", icon: "Terminal", courseCount: 9, color: "#EF4444" },
  { id: "c6", name: "UI/UX Design", icon: "Palette", courseCount: 11, color: "#EC4899" },
]

export const courses: Course[] = [
  {
    id: "crs1", title: "Full-Stack TypeScript: From Zero to Production",
    subtitle: "Build end-to-end applications with Next.js, Prisma, and tRPC",
    description: "Master the complete TypeScript stack by building production-grade applications.",
    category: "Web Development", level: "Intermediate", price: 12490, originalPrice: 20990,
    rating: 4.9, reviews: 2847, students: 18420, duration: "42 hours", lessons: 186, image: "",
    instructor: instructors[0],
    curriculum: [
      { id: "m1", title: "TypeScript Deep Dive", lessons: [
        { id: "l1", title: "Advanced Generics & Conditional Types", duration: "18:42", type: "video", preview: true },
        { id: "l2", title: "Mapped Types & Template Literals", duration: "22:15", type: "video", preview: true },
        { id: "l3", title: "Type Guards & Narrowing Patterns", duration: "15:30", type: "video", preview: false },
        { id: "l4", title: "Module: Type-Safe Utilities", duration: "35:00", type: "project", preview: false },
      ]},
      { id: "m2", title: "Next.js App Router Mastery", lessons: [
        { id: "l5", title: "Server Components & Streaming", duration: "24:18", type: "video", preview: false },
        { id: "l6", title: "Middleware & Edge Runtime", duration: "19:45", type: "video", preview: false },
        { id: "l7", title: "API Route Patterns", duration: "16:20", type: "video", preview: false },
        { id: "l8", title: "Build a SaaS Dashboard", duration: "52:00", type: "project", preview: false },
      ]},
      { id: "m3", title: "Database with Prisma", lessons: [
        { id: "l9", title: "Schema Design & Migrations", duration: "21:30", type: "video", preview: false },
        { id: "l10", title: "Relations & Eager Loading", duration: "18:45", type: "video", preview: false },
        { id: "l11", title: "Transactions & Performance", duration: "25:10", type: "video", preview: false },
        { id: "l12", title: "Quiz: Prisma Patterns", duration: "10:00", type: "quiz", preview: false },
      ]},
      { id: "m4", title: "tRPC & Type-Safe APIs", lessons: [
        { id: "l13", title: "Router Architecture", duration: "20:15", type: "video", preview: false },
        { id: "l14", title: "Subscriptions & Real-time", duration: "23:40", type: "video", preview: false },
        { id: "l15", title: "End-to-End Type Safety", duration: "30:00", type: "video", preview: false },
        { id: "l16", title: "Capstone: Full-Stack App", duration: "90:00", type: "project", preview: false },
      ]},
    ],
    whatYouLearn: ["Build production-grade Next.js applications", "Design type-safe APIs with tRPC", "Master Prisma ORM with complex schemas", "Implement authentication & authorization", "Deploy with CI/CD pipelines", "Write comprehensive tests"],
    prerequisites: ["JavaScript fundamentals", "Basic TypeScript knowledge", "Familiarity with React"],
    tags: ["TypeScript", "Next.js", "Prisma", "tRPC", "Full-Stack"],
    featured: true, popular: true, lastUpdated: "January 2025", language: "English",
  },
  {
    id: "crs2", title: "AI Agents with Python: LLM Orchestration",
    subtitle: "Design autonomous agents with LangChain, CrewAI, and custom tooling",
    description: "Build sophisticated AI agent systems that reason, plan, and execute tasks autonomously.",
    category: "AI & Machine Learning", level: "Advanced", price: 16990, originalPrice: 28490,
    rating: 4.8, reviews: 1923, students: 12800, duration: "38 hours", lessons: 152, image: "",
    instructor: instructors[1],
    curriculum: [
      { id: "m1", title: "LLM Fundamentals & Prompt Engineering", lessons: [
        { id: "l1", title: "Transformer Architecture Review", duration: "22:00", type: "video", preview: true },
        { id: "l2", title: "Advanced Prompting Strategies", duration: "18:30", type: "video", preview: true },
        { id: "l3", title: "Function Calling & Structured Output", duration: "25:15", type: "video", preview: false },
        { id: "l4", title: "Lab: Prompt Optimization", duration: "30:00", type: "project", preview: false },
      ]},
      { id: "m2", title: "Agent Architectures", lessons: [
        { id: "l5", title: "ReAct Pattern Implementation", duration: "20:45", type: "video", preview: false },
        { id: "l6", title: "Planning & Decomposition", duration: "24:00", type: "video", preview: false },
        { id: "l7", title: "Multi-Agent Coordination", duration: "28:30", type: "video", preview: false },
        { id: "l8", title: "Build a Research Agent", duration: "60:00", type: "project", preview: false },
      ]},
      { id: "m3", title: "Tool Use & Integrations", lessons: [
        { id: "l9", title: "Custom Tool Development", duration: "22:15", type: "video", preview: false },
        { id: "l10", title: "Web Scraping & APIs", duration: "19:40", type: "video", preview: false },
        { id: "l11", title: "Code Execution Sandboxes", duration: "26:00", type: "video", preview: false },
        { id: "l12", title: "Quiz: Tool Patterns", duration: "10:00", type: "quiz", preview: false },
      ]},
    ],
    whatYouLearn: ["Design multi-agent systems", "Implement tool use and function calling", "Build autonomous research agents", "Deploy AI systems to production", "Monitor agent performance", "Optimize LLM costs"],
    prerequisites: ["Python proficiency", "Basic ML knowledge", "Familiarity with APIs"],
    tags: ["Python", "LangChain", "CrewAI", "LLM", "AI Agents"],
    featured: true, popular: true, lastUpdated: "February 2025", language: "English",
  },
  {
    id: "crs3", title: "Cloud-Native Kubernetes: Production Mastery",
    subtitle: "Deploy, scale, and operate containerized workloads at enterprise scale",
    description: "Design resilient cloud-native architectures and operate K8s clusters serving millions.",
    category: "Cloud & DevOps", level: "Advanced", price: 13990, originalPrice: 25490,
    rating: 4.9, reviews: 1567, students: 9200, duration: "35 hours", lessons: 140, image: "",
    instructor: instructors[2],
    curriculum: [
      { id: "m1", title: "Kubernetes Architecture", lessons: [
        { id: "l1", title: "Control Plane Internals", duration: "25:00", type: "video", preview: true },
        { id: "l2", title: "etcd & Consensus", duration: "20:30", type: "video", preview: true },
        { id: "l3", title: "Scheduler & Admission Control", duration: "22:15", type: "video", preview: false },
      ]},
      { id: "m2", title: "GitOps & CI/CD", lessons: [
        { id: "l4", title: "ArgoCD Setup & Patterns", duration: "28:00", type: "video", preview: false },
        { id: "l5", title: "Progressive Delivery", duration: "24:30", type: "video", preview: false },
        { id: "l6", title: "Build a Deployment Pipeline", duration: "45:00", type: "project", preview: false },
      ]},
      { id: "m3", title: "Service Mesh & Observability", lessons: [
        { id: "l7", title: "Istio Configuration", duration: "26:00", type: "video", preview: false },
        { id: "l8", title: "Distributed Tracing", duration: "22:45", type: "video", preview: false },
        { id: "l9", title: "Prometheus & Grafana", duration: "30:00", type: "video", preview: false },
      ]},
    ],
    whatYouLearn: ["Operate production Kubernetes clusters", "Implement GitOps workflows", "Design service mesh architectures", "Build observability stacks", "Handle multi-tenancy & RBAC", "Auto-scaling strategies"],
    prerequisites: ["Linux fundamentals", "Docker basics", "Cloud platform experience"],
    tags: ["Kubernetes", "Docker", "GitOps", "Istio", "Cloud Native"],
    featured: true, popular: true, lastUpdated: "December 2024", language: "English",
  },
  {
    id: "crs4", title: "Rust Systems Programming: Performance & Safety",
    subtitle: "Write zero-cost abstractions for systems that cannot fail",
    description: "Master Rust's ownership model, unsafe code, and concurrent patterns for high-performance systems.",
    category: "Systems Programming", level: "Intermediate", price: 10990, originalPrice: 18490,
    rating: 4.7, reviews: 1245, students: 8100, duration: "30 hours", lessons: 128, image: "",
    instructor: instructors[3],
    curriculum: [
      { id: "m1", title: "Ownership & Borrowing", lessons: [
        { id: "l1", title: "Lifetime Annotations Deep Dive", duration: "24:00", type: "video", preview: true },
        { id: "l2", title: "Interior Mutability Patterns", duration: "20:30", type: "video", preview: true },
        { id: "l3", title: "Smart Pointers & Rc/Arc", duration: "22:00", type: "video", preview: false },
      ]},
      { id: "m2", title: "Async Rust & Tokio", lessons: [
        { id: "l4", title: "Future & Async/Await Internals", duration: "26:00", type: "video", preview: false },
        { id: "l5", title: "Tokio Runtime Architecture", duration: "24:30", type: "video", preview: false },
        { id: "l6", title: "Build a Web Crawler", duration: "50:00", type: "project", preview: false },
      ]},
    ],
    whatYouLearn: ["Master Rust ownership and lifetimes", "Write async code with Tokio", "Build high-performance services", "Understand unsafe Rust and FFI", "Design zero-cost abstractions"],
    prerequisites: ["C or C++ fundamentals", "Understanding of memory management"],
    tags: ["Rust", "Tokio", "Systems", "Performance", "Async"],
    featured: false, popular: true, lastUpdated: "November 2024", language: "English",
  },
  {
    id: "crs5", title: "Next.js 15 Masterclass: React Server Components",
    subtitle: "The complete guide to the React framework powering the modern web",
    description: "Everything about Next.js 15 with App Router, Server Components, and Partial Prerendering.",
    category: "Web Development", level: "Beginner", price: 9490, originalPrice: 16990,
    rating: 4.8, reviews: 3200, students: 22100, duration: "28 hours", lessons: 115, image: "",
    instructor: instructors[0],
    curriculum: [
      { id: "m1", title: "App Router Fundamentals", lessons: [
        { id: "l1", title: "File-based Routing & Layouts", duration: "18:00", type: "video", preview: true },
        { id: "l2", title: "Server Components vs Client", duration: "22:30", type: "video", preview: true },
        { id: "l3", title: "Data Fetching Patterns", duration: "20:00", type: "video", preview: false },
      ]},
      { id: "m2", title: "Server Actions & Mutations", lessons: [
        { id: "l4", title: "Forms & Validation", duration: "19:45", type: "video", preview: false },
        { id: "l5", title: "Optimistic Updates", duration: "21:00", type: "video", preview: false },
        { id: "l6", title: "Build a CRUD App", duration: "45:00", type: "project", preview: false },
      ]},
      { id: "m3", title: "Performance & Deployment", lessons: [
        { id: "l7", title: "Partial Prerendering", duration: "24:00", type: "video", preview: false },
        { id: "l8", title: "Image Optimization", duration: "16:30", type: "video", preview: false },
        { id: "l9", title: "Deploy to Vercel", duration: "20:00", type: "video", preview: false },
      ]},
    ],
    whatYouLearn: ["Build apps with App Router", "Master Server Components", "Use Server Actions", "Implement authentication", "Optimize Core Web Vitals", "Deploy to production"],
    prerequisites: ["React basics", "JavaScript ES6+", "HTML/CSS fundamentals"],
    tags: ["Next.js", "React", "Server Components", "Full-Stack", "Vercel"],
    featured: true, popular: true, lastUpdated: "January 2025", language: "English",
  },
  {
    id: "crs6", title: "React Native: Cross-Platform Mobile Mastery",
    subtitle: "Ship iOS and Android apps from a single codebase with Expo",
    description: "Build polished mobile applications with React Native and Expo.",
    category: "Mobile Development", level: "Intermediate", price: 11790, originalPrice: 19490,
    rating: 4.7, reviews: 1890, students: 11500, duration: "32 hours", lessons: 142, image: "",
    instructor: instructors[4],
    curriculum: [
      { id: "m1", title: "Expo & Navigation", lessons: [
        { id: "l1", title: "Project Setup & Dev Environment", duration: "16:00", type: "video", preview: true },
        { id: "l2", title: "React Navigation Patterns", duration: "22:30", type: "video", preview: true },
        { id: "l3", title: "Tab & Stack Navigation", duration: "18:00", type: "video", preview: false },
      ]},
      { id: "m2", title: "Animations & Gestures", lessons: [
        { id: "l4", title: "Reanimated 3 Basics", duration: "24:00", type: "video", preview: false },
        { id: "l5", title: "Gesture Handler Patterns", duration: "20:30", type: "video", preview: false },
        { id: "l6", title: "Build a Smooth Onboarding", duration: "40:00", type: "project", preview: false },
      ]},
    ],
    whatYouLearn: ["Build cross-platform mobile apps", "Implement smooth animations", "Write native modules", "Handle offline data", "Ship to app stores"],
    prerequisites: ["React fundamentals", "JavaScript/TypeScript"],
    tags: ["React Native", "Expo", "Mobile", "iOS", "Android"],
    featured: false, popular: true, lastUpdated: "October 2024", language: "English",
  },
  {
    id: "crs7", title: "UI/UX Engineering for Developers",
    subtitle: "Design systems, motion, and interfaces that delight users",
    description: "Bridge design and code with visual hierarchy, micro-interactions, and scalable design systems.",
    category: "UI/UX Design", level: "Beginner", price: 0, originalPrice: 0,
    rating: 4.8, reviews: 2100, students: 14200, duration: "24 hours", lessons: 98, image: "",
    instructor: instructors[4],
    curriculum: [
      { id: "m1", title: "Visual Design Fundamentals", lessons: [
        { id: "l1", title: "Color Theory for Engineers", duration: "20:00", type: "video", preview: true },
        { id: "l2", title: "Typography & Spacing Systems", duration: "18:30", type: "video", preview: true },
        { id: "l3", title: "Layout & Visual Hierarchy", duration: "22:00", type: "video", preview: false },
      ]},
      { id: "m2", title: "Interaction Design", lessons: [
        { id: "l4", title: "Micro-interactions with Framer Motion", duration: "26:00", type: "video", preview: false },
        { id: "l5", title: "State Machines for UI", duration: "20:30", type: "video", preview: false },
        { id: "l6", title: "Build a Design System", duration: "55:00", type: "project", preview: false },
      ]},
    ],
    whatYouLearn: ["Apply design principles in code", "Build scalable design systems", "Create micro-interactions", "Ensure WCAG accessibility", "Master responsive layouts"],
    prerequisites: ["HTML/CSS basics", "Some JavaScript"],
    tags: ["UI Design", "UX", "Design Systems", "Accessibility", "Motion"],
    featured: true, popular: false, lastUpdated: "November 2024", language: "English",
  },
  {
    id: "crs8", title: "Distributed Systems with Go",
    subtitle: "Build fault-tolerant microservices with gRPC, Raft, and event sourcing",
    description: "Architect distributed systems that remain available under failure.",
    category: "Systems Programming", level: "Advanced", price: 15290, originalPrice: 25490,
    rating: 4.7, reviews: 890, students: 5600, duration: "36 hours", lessons: 148, image: "",
    instructor: instructors[3],
    curriculum: [
      { id: "m1", title: "Go Concurrency Patterns", lessons: [
        { id: "l1", title: "Goroutines & Channels", duration: "22:00", type: "video", preview: true },
        { id: "l2", title: "Context & Cancellation", duration: "18:30", type: "video", preview: false },
        { id: "l3", title: "Worker Pool Patterns", duration: "20:00", type: "video", preview: false },
      ]},
      { id: "m2", title: "gRPC & Service Mesh", lessons: [
        { id: "l4", title: "Protocol Buffers & Code Gen", duration: "24:00", type: "video", preview: false },
        { id: "l5", title: "Interceptors & Middleware", duration: "20:30", type: "video", preview: false },
        { id: "l6", title: "Build a Microservice", duration: "50:00", type: "project", preview: false },
      ]},
      { id: "m3", title: "Consensus & Replication", lessons: [
        { id: "l7", title: "Raft Algorithm", duration: "35:00", type: "video", preview: false },
        { id: "l8", title: "Event Sourcing Patterns", duration: "26:00", type: "video", preview: false },
        { id: "l9", title: "Capstone: Distributed KV Store", duration: "90:00", type: "project", preview: false },
      ]},
    ],
    whatYouLearn: ["Design fault-tolerant systems", "Implement Raft consensus", "Build gRPC microservices", "Handle distributed transactions", "Use event sourcing"],
    prerequisites: ["Go proficiency", "Networking fundamentals"],
    tags: ["Go", "gRPC", "Distributed Systems", "Raft", "Microservices"],
    featured: false, popular: false, lastUpdated: "September 2024", language: "English",
  },
]

export const whyDevora = [
  { title: "Interactive Sandboxes", description: "Write and run code directly in your browser with instant feedback.", icon: "Terminal" },
  { title: "Real-World PR Reviews", description: "Submit projects and receive code reviews from senior engineers.", icon: "GitPullRequest" },
  { title: "AI Learning Companion", description: "Get personalized hints and code suggestions from our AI tutor.", icon: "Brain" },
  { title: "Verified Portfolio Proofs", description: "Complete capstone projects that become verifiable credentials.", icon: "Award" },
]

export const testimonials = [
  { name: "Alex Kim", role: "SWE @ Google", avatar: "AK", text: "DEVORA's project-based approach got me from bootcamp to Google in 8 months." },
  { name: "Priya Sharma", role: "ML Engineer @ Meta", avatar: "PS", text: "The AI Agents course is the most comprehensive I've seen." },
  { name: "Tom Anderson", role: "Platform Lead @ Netflix", avatar: "TA", text: "Finally a Kubernetes course that goes beyond tutorials." },
]

export const faqs = [
  { q: "How long do I have access?", a: "Lifetime access. Once enrolled, revisit any lesson forever." },
  { q: "Are projects portfolio-ready?", a: "Yes. Students have used DEVORA projects in interviews at top companies." },
  { q: "Can I get a certificate?", a: "Every course includes a verified certificate with a unique credential ID." },
  { q: "What if I get stuck?", a: "AI tutor for hints, community forums, and instructor office hours." },
]

// Lesson content for the learning experience (seed only; the real backend stores this in PostgreSQL)
export interface SeedLessonContent {
  body: string
  codeSnippet?: string
  language?: string
  explanations?: { am?: string; om?: string }
  quiz?: { question: string; options: string[]; correct: number }[]
  exercises?: string[]
  keyTakeaways: string[]
}

export const lessonContents: Record<string, SeedLessonContent> = {
  l1: {
    body: "Generics allow you to write reusable, type-safe code. This lesson covers conditional types, the infer keyword, and recursive generics that power modern TypeScript libraries.",
    codeSnippet: `type Unwrap<T> = T extends Promise<infer U> ? Unwrap<U> : T;`,
    language: "typescript",
    explanations: {
      am: "ጄኔሪክስ እንደገና ጥቅም ላይ የሚውል እና የአይነት-ደህንነት ያለው ኮድ ለመጻፍ ያስችላሉ። ይህ ትምህርት የሁኔታዊ አይነቶችን፣ የinfer ቁልፍ ቃልን እና ተደጋጋሚ ጄኔሪክስን ይሸፍናል።",
      om: "Generics koodii irra deebi'amee fayyadamuu danda'u fi type-safe ta'e barreessuuf isin dandeessisu. Barumsi kun conditional types, jecha iccitii infer, fi recursive generics ni hammata.",
    },
    keyTakeaways: ["Conditional types use extends to branch", "infer extracts types from constraints", "Recursive generics unwrap nested Promises"],
    exercises: ["Create a DeepPartial<T> utility", "Build a Flatten<T> type"],
  },
  l2: {
    body: "Mapped types transform every property in a type, while template literal types enable string manipulation at the type level.",
    explanations: {
      am: "Mapped types በአንድ አይነት ውስጥ ያለውን እያንዳንዱን ንብረት ይለውጣሉ። Template literal types በአይነት ደረጃ የጽሑፍ ማሻሻያ ያስችላሉ።",
      om: "Mapped types qabiyyee type keessaa hunda jijjiiru. Template literal types fooyya'insa barreeffamaa sadarkaa type irratti dandeessisu.",
    },
    codeSnippet: `type EventName<T extends string> = \`on\${Capitalize<T>}\`;`,
    language: "typescript",
    keyTakeaways: ["Mapped types iterate over union keys", "Template literals enable type-level strings", "Capitalize/Lowercase/Uppercase are built-in"],
    exercises: ["Create a Getters<T> mapped type"],
  },
  l3: {
    body: "Type guards narrow union types at runtime using typeof, instanceof, custom predicates, and discriminated unions.",
    codeSnippet: `function isString(val: unknown): val is string { return typeof val === "string"; }`,
    language: "typescript",
    keyTakeaways: ["Discriminated unions enable exhaustive narrowing", "Custom predicates (val is T) give control", "unknown + narrowing beats any + assertions"],
    exercises: ["Write a type guard for non-empty arrays"],
  },
  l4: {
    body: "Build a type-safe utility library with DeepPartial, Omit, Pick, and custom conditional types handling edge cases.",
    keyTakeaways: ["Apply all module concepts", "Test with expect-type", "Document public API"],
    exercises: ["Implement SafeAssign<T, U>", "Build a Router type inferring params"],
  },
  l5: {
    body: "React Server Components run on the server, enabling direct DB access without exposing secrets and reducing client bundle size.",
    explanations: {
      am: "React Server Components በሰርቨር ላይ ይሰራሉ። ቀጥተኛ የDB መዳረሻ ሳይገልጡ ሚስጥሮችን ያስችላሉ እና የደንበኛ ጥቅል መጠንን ይቀንሳሉ።",
      om: "React Server Components server irratti ni dalagu. DB qaqqabuu kallattii iccitii hin saaxiluuf dandeessisu; bal'ina client bundle ni hir'isu.",
    },
    codeSnippet: `export default async function Dashboard() { const stats = await db.query("SELECT 1"); return <div>{stats}</div>; }`,
    language: "typescript",
    keyTakeaways: ["Server Components can be async", "They reduce client bundle", "Use 'use client' only for interactivity"],
  },
  l6: {
    body: "Next.js Middleware runs on edge infrastructure before requests reach your app, enabling auth redirects and A/B testing.",
    codeSnippet: `export function middleware(req: Request) { if (!req.cookies.get("session")) return NextResponse.redirect(new URL("/login", req.url)); }`,
    language: "typescript",
    keyTakeaways: ["Middleware runs on edge for <50ms", "Use matcher config to limit routes", "Can modify headers, redirect, or rewrite"],
  },
  l7: {
    body: "API routes in Next.js App Router use standard Request/Response APIs with Zod validation and proper status codes.",
    codeSnippet: `export async function POST(req: Request) { const body = schema.parse(await req.json()); return Response.json(body, { status: 201 }); }`,
    language: "typescript",
    keyTakeaways: ["Route handlers use Web APIs", "Validate with Zod before processing", "Return proper HTTP status codes"],
  },
  l8: {
    body: "Build a complete SaaS dashboard combining Server Components, API routes, Prisma, and Tailwind CSS.",
    keyTakeaways: ["Structure multi-page apps", "Implement role-based access", "Add real-time data with SSE"],
    exercises: ["Add billing with Stripe", "Implement CSV export"],
  },
  l9: {
    body: "Prisma schema design involves modeling relationships, indexes, and enums for complex application domains.",
    codeSnippet: `model User { id String @id @default(cuid()) email String @unique posts Post[] }`,
    language: "prisma",
    keyTakeaways: ["Use cuid() for distributed IDs", "Define relations with @relation", "Enums provide type-safe values"],
  },
  l10: {
    body: "Prisma relations enable eager loading with include/select, nested writes, and filtering across joins.",
    codeSnippet: `const users = await prisma.user.findMany({ include: { posts: { where: { published: true } } } });`,
    language: "typescript",
    keyTakeaways: ["include fetches relations in one query", "Use select for field control", "Nested where filters within relations"],
  },
  l11: {
    body: "Prisma transactions ensure atomicity across multiple operations with interactive transaction support.",
    codeSnippet: `await prisma.$transaction(async (tx) => { await tx.order.create({ data }); await tx.inventory.update({ where, data: { stock: { decrement: 1 } } }); });`,
    language: "typescript",
    keyTakeaways: ["Interactive transactions provide tx client", "All succeed or all rollback", "Use $transaction array for simple batches"],
  },
  l12: {
    body: "Test your understanding of Prisma patterns including schema design, relation loading, and transactions.",
    quiz: [
      { question: "What does include do in Prisma?", options: ["Filters results", "Eager-loads relations", "Creates indexes", "Defines types"], correct: 1 },
      { question: "Which ID works best for distributed systems?", options: ["Auto-increment", "UUID/cuid", "Composite key", "Serial"], correct: 1 },
      { question: "If one $transaction op fails?", options: ["Partial commit", "All rollback", "Retry", "Log only"], correct: 1 },
    ],
    keyTakeaways: ["Review all module patterns", "Identify production pitfalls"],
  },
  l13: {
    body: "tRPC routers organize APIs into typed procedures with middleware composition and auth separation.",
    codeSnippet: `const appRouter = router({ users: router({ list: publicProcedure.query(({ ctx }) => ctx.db.user.findMany()) }) });`,
    language: "typescript",
    keyTakeaways: ["Router composition creates namespaces", "publicProcedure vs protectedProcedure", "Input validation with Zod"],
  },
  l14: {
    body: "tRPC subscriptions enable real-time bidirectional communication via WebSocket for live updates.",
    codeSnippet: `const onMessage = subscription({ subscribe: async function* ({ input }) { for await (const msg of bus.listen(input.roomId)) yield msg; } });`,
    language: "typescript",
    keyTakeaways: ["Subscriptions use async generators", "Client receives via WebSocket", "Perfect for collaborative features"],
  },
  l15: {
    body: "End-to-end type safety: changing a DB schema surfaces type errors in UI. Types flow DB -> Prisma -> tRPC -> React.",
    keyTakeaways: ["One source of truth eliminates drift", "IDE autocomplete across the stack", "No API contract mismatches"],
    exercises: ["Add a field and trace type propagation"],
  },
  l16: {
    body: "Capstone: build a full-stack app with type-safe DB, tRPC API, Next.js pages, and polished UI.",
    keyTakeaways: ["Apply full-stack type safety", "Handle auth, validation, errors", "Deploy with CI/CD"],
    exercises: ["Implement a project management tool"],
  },
}


export const playgroundChallenges: PlaygroundChallenge[] = [
  {
    id: "pg1",
    title: "Glassmorphism Card",
    description: "Build a frosted-glass card with backdrop blur and gradient overlay.",
    starterHtml: `<div class="card">
  <h2>Welcome</h2>
  <p>A glass card</p>
  <button class="btn">Explore</button>
</div>`,
    starterCss: `.card {
  /* Add glassmorphism styles */
  padding: 2rem;
  border-radius: 16px;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
}`,
    starterJs: `const card = document.querySelector('.card');
// Add hover effects`,
    tests: [
      { name: "Has backdrop-filter", expected: "blur", check: "backdrop-filter" },
      { name: "Has border-radius", expected: "16px", check: "border-radius" },
    ],
  },
  {
    id: "pg2",
    title: "Interactive Counter",
    description: "Create a counter with increment, decrement, and reset buttons.",
    starterHtml: `<div class="counter">
  <button id="dec">-</button>
  <span id="value">0</span>
  <button id="inc">+</button>
</div>
<button id="reset">Reset</button>`,
    starterCss: `.counter {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

#value {
  font-size: 2rem;
  font-weight: bold;
}`,
    starterJs: `let count = 0;
const value = document.getElementById('value');

document.getElementById('inc').onclick = () => {
  // increment
};`,
    tests: [
      { name: "Counter exists", expected: "true", check: "getElementById" },
      { name: "Click handler", expected: "true", check: "onclick" },
    ],
  },
  {
    id: "pg3",
    title: "Dynamic Todo App",
    description: "Build a todo list with add, complete, and delete functionality.",
    starterHtml: `<div class="todo-app">
  <h1>Todos</h1>
  <input id="input" placeholder="Add task..." />
  <button id="add">Add</button>
  <ul id="list"></ul>
</div>`,
    starterCss: `.todo-app {
  max-width: 400px;
  margin: 0 auto;
}

li {
  padding: 8px;
  margin: 4px 0;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
}

li.done {
  text-decoration: line-through;
  opacity: 0.6;
}`,
    starterJs: `const input = document.getElementById('input');
const list = document.getElementById('list');

document.getElementById('add').onclick = () => {
  const text = input.value.trim();
  if (!text) return;
  // create and append li
};`,
    tests: [
      { name: "Input accessed", expected: "true", check: "getElementById" },
      { name: "Add handler", expected: "true", check: "onclick" },
    ],
  },
]

// Instructor analytics
export const instructorStats = {
  totalRevenue: 124850,
  activeStudents: 3842,
  avgRating: 4.8,
  monthlyGrowth: 12.4,
  revenueByMonth: [8200, 9100, 11400, 10800, 12200, 13100, 14500, 13800, 15200, 16100, 14900, 17300],
  enrollmentByMonth: [180, 220, 310, 280, 350, 420, 380, 450, 510, 480, 530, 590],
  topCourses: [
    { id: "crs1", enrollments: 1240, revenue: 42300 },
    { id: "crs5", enrollments: 980, revenue: 31200 },
    { id: "crs2", enrollments: 620, revenue: 28400 },
  ],
}

