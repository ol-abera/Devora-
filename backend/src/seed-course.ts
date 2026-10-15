
import { prisma } from "./lib/prisma";

async function main() {
  const instructor = await prisma.user.upsert({
    where: {
      email: "instructor@devora.local",
    },
    update: {},
    create: {
      name: "Devora Instructor",
      email: "instructor@devora.local",
      role: "INSTRUCTOR",
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  const course = await prisma.course.upsert({
    where: {
      slug: "web-development-basics",
    },
    update: {},
    create: {
      title: "Web Development Basics",
      subtitle: "Start building websites with HTML, CSS, and JavaScript",
      slug: "web-development-basics",
      description:
        "Learn the fundamentals of web development and build your first website.",
      category: "Web Development",
      level: "BEGINNER",
      price: 0,
      originalPrice: 0,
      currency: "ETB",
      language: "en",
      status: "PUBLISHED",
      tags: ["HTML", "CSS", "JavaScript"],
      whatYouLearn: [
        "Understand HTML structure",
        "Style websites with CSS",
        "Learn JavaScript fundamentals",
      ],
      featured: true,
      duration: "5h",
      instructorId: instructor.id,
    },
  });

  console.log("Sample instructor ready:", instructor.email);
  console.log("Sample course ready:", course.title);
}

main()
  .catch((error) => {
    console.error("Failed to create sample course:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
