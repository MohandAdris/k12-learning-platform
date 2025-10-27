import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const languageSchema = z.enum(['en', 'ar', 'he']);
const userRoleSchema = z.enum(['STUDENT', 'TEACHER', 'ADMIN']);
const courseVisibilitySchema = z.enum(['PUBLIC', 'PRIVATE']);
const enrollmentStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'DROPPED']);
const gameTypeSchema = z.enum(['LTI', 'SCORM', 'XAPI', 'HTML5']);

// ============================================
// HELPER PROCEDURES
// ============================================

const teacherProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'TEACHER' && ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Teacher access required' });
  }
  return next({ ctx });
});

const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'STUDENT' && ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Student access required' });
  }
  return next({ ctx });
});

// ============================================
// MAIN ROUTER
// ============================================

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    
    updateLanguage: protectedProcedure
      .input(z.object({ language: languageSchema }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserLanguage(ctx.user.id, input.language);
        return { success: true };
      }),
  }),

  // ============================================
  // SCHOOL MANAGEMENT (TEACHER/ADMIN)
  // ============================================
  
  schools: router({
    list: teacherProcedure.query(async () => {
      return await db.getSchools();
    }),
    
    get: teacherProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const school = await db.getSchoolById(input.id);
        if (!school) throw new TRPCError({ code: 'NOT_FOUND' });
        return school;
      }),
    
    create: teacherProcedure
      .input(z.object({
        name: z.string(),
        nameAr: z.string().optional(),
        nameHe: z.string().optional(),
        region: z.string().optional(),
        contactEmail: z.string().email().optional(),
        meta: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSchool(input);
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'CREATE',
          entityType: 'School',
        });
        return { success: true };
      }),
    
    update: teacherProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        nameAr: z.string().optional(),
        nameHe: z.string().optional(),
        region: z.string().optional(),
        contactEmail: z.string().email().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateSchool(id, data);
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'UPDATE',
          entityType: 'School',
          entityId: id,
        });
        return { success: true };
      }),
    
    delete: teacherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteSchool(input.id);
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'DELETE',
          entityType: 'School',
          entityId: input.id,
        });
        return { success: true };
      }),
  }),

  // ============================================
  // USER MANAGEMENT
  // ============================================

  users: router({
    updateProfile: protectedProcedure
      .input(z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        preferredLanguage: z.enum(['en', 'ar', 'he']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateUser(ctx.user.id, input);
      }),
  }),

  // ============================================
  // COURSE MANAGEMENT
  // ============================================

  courses: router({
    list: protectedProcedure
      .input(z.object({
        visibility: courseVisibilitySchema.optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const filters: any = { ...input };
        
        // Students only see public courses
        if (ctx.user.role === 'STUDENT') {
          filters.visibility = 'PUBLIC';
        }
        
        return await db.getCourses(filters);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const course = await db.getCourseById(input.id);
        if (!course) throw new TRPCError({ code: 'NOT_FOUND' });
        
        const units = await db.getUnitsByCourseId(input.id);
        
        // Fetch lectures for each unit
        const unitsWithLectures = await Promise.all(
          units.map(async (unit) => {
            const lectures = await db.getLecturesByUnitId(unit.id);
            return { ...unit, lectures };
          })
        );
        
        return { course, units: unitsWithLectures };
      }),
    
    preview: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const course = await db.getCourseById(input.id);
        if (!course) throw new TRPCError({ code: 'NOT_FOUND' });
        
        const units = await db.getUnitsByCourseId(input.id);
        
        return {
          description: course.description,
          descriptionAr: course.descriptionAr,
          descriptionHe: course.descriptionHe,
          estimatedDuration: course.estimatedDuration,
          unitCount: units.length,
          learningOutcomes: course.learningOutcomes,
        };
      }),
    
    create: teacherProcedure
      .input(z.object({
        title: z.string(),
        titleAr: z.string().optional(),
        titleHe: z.string().optional(),
        description: z.string(),
        descriptionAr: z.string().optional(),
        descriptionHe: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        tags: z.array(z.string()),
        tagsAr: z.array(z.string()).optional(),
        tagsHe: z.array(z.string()).optional(),
        visibility: courseVisibilitySchema,
        prerequisites: z.string().optional(),
        prerequisitesAr: z.string().optional(),
        prerequisitesHe: z.string().optional(),
        learningOutcomes: z.string().optional(),
        learningOutcomesAr: z.string().optional(),
        learningOutcomesHe: z.string().optional(),
        estimatedDuration: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const courseId = await db.createCourse({
          ...input,
          tagsAr: input.tagsAr || [],
          tagsHe: input.tagsHe || [],
          createdBy: ctx.user.id,
        });
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'CREATE',
          entityType: 'Course',
        });
        
        return { success: true, id: courseId };
      }),
    
    update: teacherProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        titleAr: z.string().optional(),
        titleHe: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionHe: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        tags: z.array(z.string()).optional(),
        tagsAr: z.array(z.string()).optional(),
        tagsHe: z.array(z.string()).optional(),
        visibility: courseVisibilitySchema.optional(),
        prerequisites: z.string().optional(),
        prerequisitesAr: z.string().optional(),
        prerequisitesHe: z.string().optional(),
        learningOutcomes: z.string().optional(),
        learningOutcomesAr: z.string().optional(),
        learningOutcomesHe: z.string().optional(),
        estimatedDuration: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateCourse(id, data);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'UPDATE',
          entityType: 'Course',
          entityId: id,
        });
        
        return { success: true };
      }),
    
    delete: teacherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteCourse(input.id);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'DELETE',
          entityType: 'Course',
          entityId: input.id,
        });
        
        return { success: true };
      }),
    
    publish: teacherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.publishCourse(input.id);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'PUBLISH',
          entityType: 'Course',
          entityId: input.id,
        });
        
        return { success: true };
      }),
  }),

  // ============================================
  // UNIT MANAGEMENT
  // ============================================
  
  units: router({
    list: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUnitsByCourseId(input.courseId);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const unit = await db.getUnitById(input.id);
        if (!unit) throw new TRPCError({ code: 'NOT_FOUND' });
        
        const lectures = await db.getLecturesByUnitId(input.id);
        const games = await db.getGamesByUnitId(input.id);
        
        return { unit, lectures, games };
      }),
    
    create: teacherProcedure
      .input(z.object({
        courseId: z.number(),
        title: z.string(),
        titleAr: z.string().optional(),
        titleHe: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionHe: z.string().optional(),
        order: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createUnit(input);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'CREATE',
          entityType: 'Unit',
        });
        
        return { success: true };
      }),
    
    update: teacherProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        titleAr: z.string().optional(),
        titleHe: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionHe: z.string().optional(),
        order: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateUnit(id, data);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'UPDATE',
          entityType: 'Unit',
          entityId: id,
        });
        
        return { success: true };
      }),
    
    delete: teacherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteUnit(input.id);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'DELETE',
          entityType: 'Unit',
          entityId: input.id,
        });
        
        return { success: true };
      }),
  }),

  // ============================================
  // LECTURE MANAGEMENT
  // ============================================
  
  lectures: router({
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const lecture = await db.getLectureById(input.id);
        if (!lecture) throw new TRPCError({ code: 'NOT_FOUND' });
        
        const attachments = await db.getAttachmentsByLectureId(input.id);
        
        return { lecture, attachments };
      }),
    
    create: teacherProcedure
      .input(z.object({
        unitId: z.number(),
        title: z.string(),
        titleAr: z.string().optional(),
        titleHe: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionHe: z.string().optional(),
        order: z.number(),
        videoUrl: z.string(),
        videoUrlAr: z.string().optional(),
        videoUrlHe: z.string().optional(),
        durationSec: z.number(),
        captionsUrl: z.string().optional(),
        captionsUrlAr: z.string().optional(),
        captionsUrlHe: z.string().optional(),
        summaryMarkdown: z.string().optional(),
        summaryMarkdownAr: z.string().optional(),
        summaryMarkdownHe: z.string().optional(),
        references: z.any().optional(),
        availableFrom: z.date().optional(),
        availableUntil: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createLecture(input);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'CREATE',
          entityType: 'Lecture',
        });
        
        return { success: true };
      }),
    
    update: teacherProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        titleAr: z.string().optional(),
        titleHe: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionHe: z.string().optional(),
        order: z.number().optional(),
        videoUrl: z.string().optional(),
        videoUrlAr: z.string().optional(),
        videoUrlHe: z.string().optional(),
        durationSec: z.number().optional(),
        captionsUrl: z.string().optional(),
        captionsUrlAr: z.string().optional(),
        captionsUrlHe: z.string().optional(),
        summaryMarkdown: z.string().optional(),
        summaryMarkdownAr: z.string().optional(),
        summaryMarkdownHe: z.string().optional(),
        references: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateLecture(id, data);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'UPDATE',
          entityType: 'Lecture',
          entityId: id,
        });
        
        return { success: true };
      }),
    
    delete: teacherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteLecture(input.id);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'DELETE',
          entityType: 'Lecture',
          entityId: input.id,
        });
        
        return { success: true };
      }),
    
    getUploadUrl: teacherProcedure
      .input(z.object({
        fileName: z.string(),
        fileType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate a unique file key
        const timestamp = Date.now();
        const fileKey = `videos/${ctx.user.id}/${timestamp}-${input.fileName}`;
        
        // In a real implementation, you would generate a presigned URL
        // For now, return a placeholder
        return {
          uploadUrl: `/api/upload/${fileKey}`,
          videoUrl: `/videos/${fileKey}`,
        };
      }),
  }),

  // ============================================
  // ATTACHMENT MANAGEMENT
  // ============================================
  
  attachments: router({
    create: teacherProcedure
      .input(z.object({
        lectureId: z.number(),
        title: z.string(),
        titleAr: z.string().optional(),
        titleHe: z.string().optional(),
        fileUrl: z.string(),
        fileUrlAr: z.string().optional(),
        fileUrlHe: z.string().optional(),
        fileType: z.string(),
        fileSize: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createAttachment(input);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'CREATE',
          entityType: 'Attachment',
        });
        
        return { success: true };
      }),
    
    delete: teacherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteAttachment(input.id);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'DELETE',
          entityType: 'Attachment',
          entityId: input.id,
        });
        
        return { success: true };
      }),
  }),

  // ============================================
  // GAME MANAGEMENT
  // ============================================
  
  games: router({
    list: teacherProcedure.query(async () => {
      return await db.getGames();
    }),
    
    create: teacherProcedure
      .input(z.object({
        title: z.string(),
        titleAr: z.string().optional(),
        titleHe: z.string().optional(),
        type: gameTypeSchema,
        launchUrl: z.string().optional(),
        launchUrlAr: z.string().optional(),
        launchUrlHe: z.string().optional(),
        config: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createGame(input);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'CREATE',
          entityType: 'Game',
        });
        
        return { success: true };
      }),
    
    linkToUnit: teacherProcedure
      .input(z.object({
        unitId: z.number(),
        gameId: z.number(),
        requiredToComplete: z.boolean(),
        scoringRules: z.any().optional(),
        order: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {

        await db.linkGameToUnit(input);
        
        await db.logAudit({
          actorUserId: ctx.user.id,
          action: 'LINK_GAME',
          entityType: 'Unit',
          entityId: input.unitId,
          meta: { gameId: input.gameId },
        });
        
        return { success: true };
      }),
  }),

  // ============================================
  // STUDENT ENROLLMENT & PROGRESS
  // ============================================
  
  enrollment: router({
    enroll: studentProcedure
      .input(z.object({ courseId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.enrollStudent({
          userId: ctx.user.id,
          courseId: input.courseId,
          status: 'ACTIVE',
        });
        
        await db.logAnalyticsEvent({
          userId: ctx.user.id,
          eventType: 'course_enrolled',
          props: { courseId: input.courseId },
        });
        
        return { success: true };
      }),
    
    myEnrollments: studentProcedure.query(async ({ ctx }) => {
      return await db.getEnrollmentsByUserId(ctx.user.id);
    }),
  }),

  progress: router({
    update: studentProcedure
      .input(z.object({
        lectureId: z.number(),
        positionSec: z.number(),
        completed: z.boolean(),
        watchedLanguage: languageSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateProgress({
          userId: ctx.user.id,
          lectureId: input.lectureId,
          positionSec: input.positionSec,
          completed: input.completed,
          watchedLanguage: input.watchedLanguage,
        });
        
        if (input.completed) {
          await db.logAnalyticsEvent({
            userId: ctx.user.id,
            eventType: 'lecture_completed',
            props: { lectureId: input.lectureId },
          });
        }
        
        return { success: true };
      }),
    
    get: studentProcedure
      .input(z.object({ lectureId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getProgressByUserAndLecture(ctx.user.id, input.lectureId);
      }),
    
    myProgress: studentProcedure.query(async ({ ctx }) => {
      return await db.getProgressByUserId(ctx.user.id);
    }),
    
    getByCourse: studentProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Get all progress for this user's lectures in this course
        const allProgress = await db.getProgressByUserId(ctx.user.id);
        
        // Get all lectures for this course
        const units = await db.getUnitsByCourseId(input.courseId);
        const lectureIds = new Set<number>();
        for (const unit of units) {
          const lectures = await db.getLecturesByUnitId(unit.id);
          lectures.forEach(l => lectureIds.add(l.id));
        }
        
        // Filter progress to only this course's lectures
        const courseProgress = allProgress.filter(p => lectureIds.has(p.lectureId));
        
        // Find the most recently updated progress
        if (courseProgress.length === 0) return null;
        
        const lastProgress = courseProgress.reduce((latest, current) => {
          return new Date(current.lastSeenAt) > new Date(latest.lastSeenAt) ? current : latest;
        });
        
        return lastProgress;
      }),
  }),

  gameSessions: router({
    create: studentProcedure
      .input(z.object({
        gameId: z.number(),
        unitId: z.number(),
        playedLanguage: languageSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createGameSession({
          userId: ctx.user.id,
          gameId: input.gameId,
          unitId: input.unitId,
          playedLanguage: input.playedLanguage,
          completed: false,
        });
        
        await db.logAnalyticsEvent({
          userId: ctx.user.id,
          eventType: 'game_started',
          props: { gameId: input.gameId, unitId: input.unitId },
        });
        
        return { success: true };
      }),
    
    update: studentProcedure
      .input(z.object({
        sessionId: z.number(),
        score: z.number().optional(),
        completed: z.boolean().optional(),
        durationSec: z.number().optional(),
        rawEvents: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { sessionId, ...data } = input;
        
        const updateData: any = { ...data };
        if (data.completed) {
          updateData.completedAt = new Date();
        }
        
        await db.updateGameSession(sessionId, updateData);
        
        if (data.completed) {
          await db.logAnalyticsEvent({
            userId: ctx.user.id,
            eventType: 'game_completed',
            props: { sessionId, score: data.score },
          });
        }
        
        return { success: true };
      }),
  }),

  // ============================================
  // STUDENT MANAGEMENT (TEACHER/ADMIN)
  // ============================================
  
  students: router({
    list: teacherProcedure
      .input(z.object({
        schoolId: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getStudents(input);
      }),
    
    get: teacherProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const student = await db.getUserById(input.id);
        if (!student || student.role !== 'STUDENT') {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        
        const enrollments = await db.getEnrollmentsByUserId(input.id);
        const progress = await db.getProgressByUserId(input.id);
        const gameSessions = await db.getGameSessionsByUser(input.id);
        
        return {
          student,
          enrollments,
          progress,
          gameSessions,
        };
      }),
  }),

  // ============================================
  // ANALYTICS (TEACHER/ADMIN)
  // ============================================
  
  analytics: router({
    overview: teacherProcedure
      .input(z.object({
        range: z.enum(['7d', '30d', '90d', '1y']).optional(),
      }))
      .query(async () => {
        // Placeholder for analytics overview
        return {
          courseCount: 0,
          studentCount: 0,
          schoolCount: 0,
          dau: 0,
          mau: 0,
          averageWatchTime: 0,
          completionRate: 0,
          gamePlayRate: 0,
        };
      }),
    
    course: teacherProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCourseAnalytics(input.courseId);
      }),
    
    events: teacherProcedure
      .input(z.object({
        userId: z.number().optional(),
        eventType: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAnalyticsEvents(input);
      }),
  }),

  // ============================================
  // AUDIT LOGS (ADMIN)
  // ============================================
  
  auditLogs: router({
    list: adminProcedure
      .input(z.object({
        actorUserId: z.number().optional(),
        entityType: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAuditLogs(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;

