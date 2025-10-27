import { drizzle } from "drizzle-orm/mysql2";
import { courses, units, lectures, schools } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log("🌱 Starting seed...");

  // Create a sample school
  const [school] = await db.insert(schools).values({
    name: "International Academy",
    nameAr: "الأكاديمية الدولية",
    nameHe: "האקדמיה הבינלאומית",
    region: "Middle East",
    contactEmail: "info@intl-academy.edu",
  });
  
  console.log("✅ Created school");

  // Create sample courses
  const courseData = [
    {
      title: "Introduction to Mathematics",
      titleAr: "مقدمة في الرياضيات",
      titleHe: "מבוא למתמטיקה",
      description: "Learn the fundamentals of mathematics including algebra, geometry, and basic calculus.",
      descriptionAr: "تعلم أساسيات الرياضيات بما في ذلك الجبر والهندسة وحساب التفاضل والتكامل الأساسي.",
      descriptionHe: "למד את יסודות המתמטיקה כולל אלגברה, גיאומטריה וחשבון בסיסי.",
      visibility: "PUBLIC" as const,
      thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop",
      learningOutcomes: "- Understand basic algebraic concepts\n- Solve geometric problems\n- Apply mathematical thinking",
      learningOutcomesAr: "- فهم المفاهيم الجبرية الأساسية\n- حل المسائل الهندسية\n- تطبيق التفكير الرياضي",
      learningOutcomesHe: "- הבן מושגי אלגברה בסיסיים\n- פתור בעיות גיאומטריות\n- יישם חשיבה מתמטית",
      estimatedDuration: 120,
      tags: ["Mathematics", "Algebra", "Geometry"],
      tagsAr: ["رياضيات", "جبر", "هندسة"],
      tagsHe: ["מתמטיקה", "אלגברה", "גיאומטריה"],
      createdBy: 1,
    },
    {
      title: "English Literature",
      titleAr: "الأدب الإنجليزي",
      titleHe: "ספרות אנגלית",
      description: "Explore classic and contemporary English literature, poetry, and prose.",
      descriptionAr: "استكشف الأدب الإنجليزي الكلاسيكي والمعاصر والشعر والنثر.",
      descriptionHe: "חקור ספרות אנגלית קלאסית ועכשווית, שירה ופרוזה.",
      visibility: "PUBLIC" as const,
      thumbnailUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop",
      learningOutcomes: "- Analyze literary texts\n- Understand literary devices\n- Write critical essays",
      learningOutcomesAr: "- تحليل النصوص الأدبية\n- فهم الأدوات الأدبية\n- كتابة المقالات النقدية",
      learningOutcomesHe: "- נתח טקסטים ספרותיים\n- הבן אמצעים ספרותיים\n- כתוב חיבורים ביקורתיים",
      estimatedDuration: 90,
      tags: ["Literature", "English", "Writing"],
      tagsAr: ["أدب", "إنجليزي", "كتابة"],
      tagsHe: ["ספרות", "אנגלית", "כתיבה"],
      createdBy: 1,
    },
    {
      title: "World History",
      titleAr: "التاريخ العالمي",
      titleHe: "היסטוריה עולמית",
      description: "Journey through major historical events and civilizations that shaped our world.",
      descriptionAr: "رحلة عبر الأحداث التاريخية الكبرى والحضارات التي شكلت عالمنا.",
      descriptionHe: "מסע דרך אירועים היסטוריים מרכזיים ותרבויות שעיצבו את עולמנו.",
      visibility: "PUBLIC" as const,
      thumbnailUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=400&fit=crop",
      learningOutcomes: "- Understand historical context\n- Analyze cause and effect\n- Connect past to present",
      learningOutcomesAr: "- فهم السياق التاريخي\n- تحليل السبب والنتيجة\n- ربط الماضي بالحاضر",
      learningOutcomesHe: "- הבן הקשר היסטורי\n- נתח סיבה ותוצאה\n- חבר עבר להווה",
      estimatedDuration: 100,
      tags: ["History", "Social Studies", "Culture"],
      tagsAr: ["تاريخ", "دراسات اجتماعية", "ثقافة"],
      tagsHe: ["היסטוריה", "לימודי חברה", "תרבות"],
      createdBy: 1,
    },
    {
      title: "Introduction to Science",
      titleAr: "مقدمة في العلوم",
      titleHe: "מבוא למדע",
      description: "Discover the wonders of physics, chemistry, and biology through hands-on experiments.",
      descriptionAr: "اكتشف عجائب الفيزياء والكيمياء والأحياء من خلال التجارب العملية.",
      descriptionHe: "גלה את פלאי הפיזיקה, הכימיה והביולוגיה דרך ניסויים מעשיים.",
      visibility: "PUBLIC" as const,
      thumbnailUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop",
      learningOutcomes: "- Apply scientific method\n- Conduct experiments\n- Understand natural phenomena",
      learningOutcomesAr: "- تطبيق الطريقة العلمية\n- إجراء التجارب\n- فهم الظواهر الطبيعية",
      learningOutcomesHe: "- יישם שיטה מדעית\n- בצע ניסויים\n- הבן תופעות טבע",
      estimatedDuration: 110,
      tags: ["Science", "Physics", "Chemistry", "Biology"],
      tagsAr: ["علوم", "فيزياء", "كيمياء", "أحياء"],
      tagsHe: ["מדע", "פיזיקה", "כימיה", "ביולוגיה"],
      createdBy: 1,
    },
  ];

  for (const course of courseData) {
    const [insertedCourse] = await db.insert(courses).values(course);
    console.log(`✅ Created course: ${course.title}`);

    // Create units for each course
    const unitData = [
      {
        courseId: insertedCourse.insertId,
        title: "Unit 1: Fundamentals",
        titleAr: "الوحدة 1: الأساسيات",
        titleHe: "יחידה 1: יסודות",
        description: "Introduction to core concepts and foundational knowledge.",
        descriptionAr: "مقدمة للمفاهيم الأساسية والمعرفة التأسيسية.",
        descriptionHe: "מבוא למושגי ליבה וידע יסודי.",
        order: 1,
      },
      {
        courseId: insertedCourse.insertId,
        title: "Unit 2: Intermediate Topics",
        titleAr: "الوحدة 2: مواضيع متوسطة",
        titleHe: "יחידה 2: נושאים בינוניים",
        description: "Building on fundamentals with more complex topics.",
        descriptionAr: "البناء على الأساسيات بمواضيع أكثر تعقيداً.",
        descriptionHe: "בניה על יסודות עם נושאים מורכבים יותר.",
        order: 2,
      },
      {
        courseId: insertedCourse.insertId,
        title: "Unit 3: Advanced Concepts",
        titleAr: "الوحدة 3: مفاهيم متقدمة",
        titleHe: "יחידה 3: מושגים מתקדמים",
        description: "Mastering advanced topics and real-world applications.",
        descriptionAr: "إتقان المواضيع المتقدمة والتطبيقات الواقعية.",
        descriptionHe: "שליטה בנושאים מתקדמים ויישומים מעשיים.",
        order: 3,
      },
    ];

    for (const unit of unitData) {
      const [insertedUnit] = await db.insert(units).values(unit);
      console.log(`  ✅ Created unit: ${unit.title}`);

      // Create lectures for each unit
      const lectureData = [
        {
          unitId: insertedUnit.insertId,
          title: "Lecture 1: Introduction",
          titleAr: "المحاضرة 1: مقدمة",
          titleHe: "הרצאה 1: מבוא",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSec: 900,
          order: 1,
          summaryMarkdown: "An introductory lecture covering the basics.",
          summaryMarkdownAr: "محاضرة تمهيدية تغطي الأساسيات.",
          summaryMarkdownHe: "הרצאת מבוא המכסה את היסודות.",
        },
        {
          unitId: insertedUnit.insertId,
          title: "Lecture 2: Deep Dive",
          titleAr: "المحاضرة 2: غوص عميق",
          titleHe: "הרצאה 2: צלילה עמוקה",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSec: 1200,
          order: 2,
          summaryMarkdown: "A detailed exploration of key concepts.",
          summaryMarkdownAr: "استكشاف مفصل للمفاهيم الرئيسية.",
          summaryMarkdownHe: "חקירה מפורטת של מושגי מפתח.",
        },
        {
          unitId: insertedUnit.insertId,
          title: "Lecture 3: Practice & Review",
          titleAr: "المحاضرة 3: ممارسة ومراجعة",
          titleHe: "הרצאה 3: תרגול וסקירה",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSec: 1080,
          order: 3,
          summaryMarkdown: "Practice exercises and review of learned material.",
          summaryMarkdownAr: "تمارين عملية ومراجعة للمواد المتعلمة.",
          summaryMarkdownHe: "תרגילי תרגול וסקירה של החומר שנלמד.",
        },
      ];

      for (const lecture of lectureData) {
        await db.insert(lectures).values(lecture);
        console.log(`    ✅ Created lecture: ${lecture.title}`);
      }
    }
  }

  console.log("\n🎉 Seed completed successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

