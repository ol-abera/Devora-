/** Static marketing copy. Not backend data. */

export const whyDevora = [
  { title: "Interactive Sandboxes", description: "Write and run code directly in your browser with instant feedback.", icon: "Terminal" },
  { title: "Pay Per Course", description: "Buy only the courses you need, in ETB, with Chapa. No forced subscription.", icon: "GitPullRequest" },
  { title: "AI Learning Companion", description: "Get hints and explanations from the AI tutor inside every lesson.", icon: "Brain" },
  { title: "Verifiable Certificates", description: "Finish a course and get a certificate with a public credential ID.", icon: "Award" },
]

export const faqs = [
  { q: "How long do I have access?", a: "Lifetime access. Once enrolled, revisit any lesson forever." },
  { q: "How do I pay?", a: "Pay in ETB with Chapa. Your course opens only after the payment is verified." },
  { q: "Can I get a certificate?", a: "Every course includes a certificate with a unique credential ID that anyone can verify." },
  { q: "What if I get stuck?", a: "Ask the AI tutor inside any lesson, or revisit the lesson exercises." },
  { q: "Is there a free plan?", a: "Yes. The Free plan lets you explore selected courses and the coding playground. Upgrade anytime." },
  { q: "Do you support Amharic and Afaan Oromo?", a: "Yes. The platform and AI tutor support English, Amharic, and Afaan Oromo." },
]

export const successStories = [
  {
    name: "Hana Mekonnen",
    role: "Frontend Developer · Addis Ababa",
    quote: "I went from zero coding experience to landing my first internship in six months. The AI tutor felt like a patient mentor at 2 a.m.",
    metric: "6 months",
    metricLabel: "to first internship",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Yonas Tadesse",
    role: "Full-Stack Engineer · Bahir Dar",
    quote: "Paying course by course in ETB removed the biggest barrier. I only bought what I needed and finished every one.",
    metric: "4 courses",
    metricLabel: "completed",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Sara Alemu",
    role: "Data Analyst · Hawassa",
    quote: "The certificates are actually verifiable. My employer checked the credential ID on the spot during the interview.",
    metric: "2 offers",
    metricLabel: "within 3 weeks",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
]

export const testimonials = [
  {
    name: "Dawit Kebede",
    course: "React & TypeScript",
    text: "Clean lessons, real projects, and an AI that actually helps instead of just dumping answers. Best learning experience I've had online.",
    rating: 5,
  },
  {
    name: "Liya Getachew",
    course: "Python for Beginners",
    text: "I love that everything is in ETB and works with Chapa. No foreign card headaches. The playground is addictive.",
    rating: 5,
  },
  {
    name: "Abel Mulugeta",
    course: "Node.js Backend",
    text: "The instructor dashboard and course builder are surprisingly polished. I published my first course in a weekend.",
    rating: 5,
  },
  {
    name: "Meron Assefa",
    course: "UI Design Basics",
    text: "Warm community feel, clear progress tracking, and certificates that look professional. Highly recommend.",
    rating: 5,
  },
]

export const plans = [
  {
    id: "free",
    name: "Free",
    price: "0",
    period: "forever",
    description: "Start exploring without any commitment.",
    features: [
      "Access to free courses",
      "Coding playground",
      "Basic AI tutor messages",
      "Community access",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: "499",
    period: "per month",
    description: "For focused learners who want more.",
    features: [
      "Everything in Free",
      "Unlimited course previews",
      "Priority AI tutor",
      "Downloadable resources",
      "Progress analytics",
    ],
    cta: "Start Plus",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "1,299",
    period: "per month",
    description: "Full power for serious builders.",
    features: [
      "Everything in Plus",
      "All premium courses",
      "Verified certificates",
      "1-on-1 mentor sessions",
      "Career path guidance",
      "Early access to new content",
    ],
    cta: "Go Pro",
    highlighted: false,
  },
]
