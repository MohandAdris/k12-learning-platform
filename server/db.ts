import { eq, and, desc, asc, sql, inArray, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  schools, 
  courses, 
  units, 
  lectures, 
  attachments,
  interactiveGames,
  unitGames,
  enrollments,
  progress,
  gameSessions,
  auditLogs,
  analyticsEvents,
  refreshTokens,
  systemConfig,
  translationCache,
  InsertSchool,
  InsertCourse,
  InsertUnit,
  InsertLecture,
  InsertAttachment,
  InsertInteractiveGame,
  InsertUnitGame,
  InsertEnrollment,
  InsertProgress,
  InsertGameSession,
  InsertAuditLog,
  InsertAnalyticsEvent,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      externalId: user.externalId,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const updateSet: Record<string, unknown> = {
      externalId: user.externalId,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    if (user.email !== undefined) {
      const normalized = user.email ?? null;
      values.email = normalized;
      updateSet.email = normalized;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'ADMIN';
      updateSet.role = 'ADMIN';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByExternalId(externalId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.externalId, externalId)).limit(1);
  return result[0];
}

export async function updateUserLanguage(userId: number, language: 'en' | 'ar' | 'he') {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set({ preferredLanguage: language }).where(eq(users.id, userId));
}

export async function getStudents(filters?: { schoolId?: number; search?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(users.role, 'STUDENT')];
  
  if (filters?.schoolId) {
    conditions.push(eq(users.schoolId, filters.schoolId));
  }
  
  if (filters?.search) {
    conditions.push(
      or(
        like(users.firstName, `%${filters.search}%`),
        like(users.lastName, `%${filters.search}%`),
        like(users.externalId, `%${filters.search}%`)
      )!
    );
  }
  
  let query = db.select().from(users).where(and(...conditions));
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }
  
  return await query;
}

// ============================================
// SCHOOL MANAGEMENT
// ============================================

export async function createSchool(school: InsertSchool) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(schools).values(school);
  return result;
}

export async function getSchools() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(schools).orderBy(asc(schools.name));
}

export async function getSchoolById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(schools).where(eq(schools.id, id)).limit(1);
  return result[0];
}

export async function updateSchool(id: number, data: Partial<InsertSchool>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(schools).set(data).where(eq(schools.id, id));
}

export async function deleteSchool(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(schools).where(eq(schools.id, id));
}

// ============================================
// COURSE MANAGEMENT
// ============================================

export async function createCourse(course: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(courses).values(course);
  return result;
}

export async function getCourses(filters?: { 
  visibility?: 'PUBLIC' | 'PRIVATE'; 
  createdBy?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(courses);
  
  const conditions = [];
  
  if (filters?.visibility) {
    conditions.push(eq(courses.visibility, filters.visibility));
  }
  
  if (filters?.createdBy) {
    conditions.push(eq(courses.createdBy, filters.createdBy));
  }
  
  if (filters?.search) {
    conditions.push(
      or(
        like(courses.title, `%${filters.search}%`),
        like(courses.description, `%${filters.search}%`)
      )
    );
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  query = query.orderBy(desc(courses.createdAt)) as any;
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }
  
  return await query;
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result[0];
}

export async function updateCourse(id: number, data: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(courses).where(eq(courses.id, id));
}

export async function publishCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(courses).set({ publishedAt: new Date() }).where(eq(courses.id, id));
}

// ============================================
// UNIT MANAGEMENT
// ============================================

export async function createUnit(unit: InsertUnit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(units).values(unit);
  return result;
}

export async function getUnitsByCourseId(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(units).where(eq(units.courseId, courseId)).orderBy(asc(units.order));
}

export async function getUnitById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(units).where(eq(units.id, id)).limit(1);
  return result[0];
}

export async function updateUnit(id: number, data: Partial<InsertUnit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(units).set(data).where(eq(units.id, id));
}

export async function deleteUnit(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(units).where(eq(units.id, id));
}

// ============================================
// LECTURE MANAGEMENT
// ============================================

export async function createLecture(lecture: InsertLecture) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(lectures).values(lecture);
  return result;
}

export async function getLecturesByUnitId(unitId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(lectures).where(eq(lectures.unitId, unitId)).orderBy(asc(lectures.order));
}

export async function getLectureById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(lectures).where(eq(lectures.id, id)).limit(1);
  return result[0];
}

export async function updateLecture(id: number, data: Partial<InsertLecture>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(lectures).set(data).where(eq(lectures.id, id));
}

export async function deleteLecture(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(lectures).where(eq(lectures.id, id));
}

// ============================================
// ATTACHMENT MANAGEMENT
// ============================================

export async function createAttachment(attachment: InsertAttachment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(attachments).values(attachment);
  return result;
}

export async function getAttachmentsByLectureId(lectureId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(attachments).where(eq(attachments.lectureId, lectureId));
}

export async function deleteAttachment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(attachments).where(eq(attachments.id, id));
}

// ============================================
// GAME MANAGEMENT
// ============================================

export async function createGame(game: InsertInteractiveGame) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(interactiveGames).values(game);
  return result;
}

export async function getGames() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(interactiveGames).orderBy(desc(interactiveGames.createdAt));
}

export async function getGameById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(interactiveGames).where(eq(interactiveGames.id, id)).limit(1);
  return result[0];
}

export async function linkGameToUnit(unitGame: InsertUnitGame) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(unitGames).values(unitGame);
  return result;
}

export async function getGamesByUnitId(unitId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      unitGame: unitGames,
      game: interactiveGames,
    })
    .from(unitGames)
    .leftJoin(interactiveGames, eq(unitGames.gameId, interactiveGames.id))
    .where(eq(unitGames.unitId, unitId))
    .orderBy(asc(unitGames.order));
}

// ============================================
// ENROLLMENT & PROGRESS
// ============================================

export async function enrollStudent(enrollment: InsertEnrollment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(enrollments).values(enrollment);
  return result;
}

export async function getEnrollmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      enrollment: enrollments,
      course: courses,
    })
    .from(enrollments)
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.createdAt));
}

export async function getEnrollmentsByCourseId(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      enrollment: enrollments,
      user: users,
    })
    .from(enrollments)
    .leftJoin(users, eq(enrollments.userId, users.id))
    .where(eq(enrollments.courseId, courseId));
}

export async function updateProgress(progressData: InsertProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(progress).values(progressData).onDuplicateKeyUpdate({
    set: {
      positionSec: progressData.positionSec,
      completed: progressData.completed,
      watchedLanguage: progressData.watchedLanguage,
    },
  });
}

export async function getProgressByUserAndLecture(userId: number, lectureId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.lectureId, lectureId)))
    .limit(1);
  
  return result[0];
}

export async function getProgressByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(progress).where(eq(progress.userId, userId));
}

// ============================================
// GAME SESSIONS
// ============================================

export async function createGameSession(session: InsertGameSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(gameSessions).values(session);
  return result;
}

export async function updateGameSession(id: number, data: Partial<InsertGameSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(gameSessions).set(data).where(eq(gameSessions.id, id));
}

export async function getGameSessionsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(gameSessions).where(eq(gameSessions.userId, userId)).orderBy(desc(gameSessions.createdAt));
}

// ============================================
// ANALYTICS
// ============================================

export async function logAnalyticsEvent(event: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(analyticsEvents).values(event);
}

export async function getAnalyticsEvents(filters?: {
  userId?: number;
  eventType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(analyticsEvents);
  
  const conditions = [];
  
  if (filters?.userId) {
    conditions.push(eq(analyticsEvents.userId, filters.userId));
  }
  
  if (filters?.eventType) {
    conditions.push(eq(analyticsEvents.eventType, filters.eventType));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  query = query.orderBy(desc(analyticsEvents.timestamp)) as any;
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  return await query;
}

export async function getCourseAnalytics(courseId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const enrollmentCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(enrollments)
    .where(eq(enrollments.courseId, courseId));
  
  const completionCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(enrollments)
    .where(and(eq(enrollments.courseId, courseId), eq(enrollments.status, 'COMPLETED')));
  
  return {
    enrollments: enrollmentCount[0]?.count || 0,
    completions: completionCount[0]?.count || 0,
    completionRate: enrollmentCount[0]?.count 
      ? ((completionCount[0]?.count || 0) / enrollmentCount[0].count) * 100 
      : 0,
  };
}

// ============================================
// AUDIT LOGS
// ============================================

export async function logAudit(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(auditLogs).values(log);
}

export async function getAuditLogs(filters?: {
  actorUserId?: number;
  entityType?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(auditLogs);
  
  const conditions = [];
  
  if (filters?.actorUserId) {
    conditions.push(eq(auditLogs.actorUserId, filters.actorUserId));
  }
  
  if (filters?.entityType) {
    conditions.push(eq(auditLogs.entityType, filters.entityType));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  query = query.orderBy(desc(auditLogs.createdAt)) as any;
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }
  
  return await query;
}

