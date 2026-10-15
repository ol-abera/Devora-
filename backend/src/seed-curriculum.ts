
import { prisma } from "./lib/prisma";

async function main() {
  const course = await prisma.course.findUnique({
    where: {
      slug: "web-development-basics",
    },
  });

  if (!course) {
    throw new Error(
      "Course not found. Run the sample course script first."
    );
  }

  const section = await prisma.section.upsert({
    where: {
      courseId_position: {
        courseId: course.id,
        position: 1,
      },
    },
    update: {},
    create: {
      title: "Introduction to Web Development",
      position: 1,
      courseId: course.id,
    },
  });

  const lessons = [
    {
      title: "How the Web Works",
      description: "Understand websites, browsers, and web servers.",
      duration: "5:00",
      type: "VIDEO" as const,
      position: 1,
      isFree: true,
    },
    {
      title: "Setting Up Your Environment",
      description: "Learn what tools you need to start building websites.",
      duration: "8:00",
     type: "READING" as const,
      position: 2,
      isFree: true,
    },
  ];


for (const lesson of lessons) {
  const existingLesson = await prisma.lesson.findFirst({
    where: {
      sectionId: section.id,
      position: lesson.position,
    },
  });

  if (existingLesson) {
    await prisma.lesson.update({
      where: {
        id: existingLesson.id,
      },
      data: lesson,
    });
  } else {
    await prisma.lesson.create({
      data: {
        ...lesson,
        sectionId: section.id,
      },
    });
  }
}


  console.log("Curriculum created successfully!");
  console.log("Section:", section.title);
  console.log("Lessons:", lessons.map((lesson) => lesson.title));
}

main()
  .catch((error) => {
    console.error("Failed to create curriculum:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
