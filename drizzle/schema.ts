import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, float, json, index, unique } from "drizzle-orm/mysql-core";

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = mysqlEnum("user_role", ["STUDENT", "TEACHER", "ADMIN"]);
export const languageEnum = mysqlEnum("language", ["en", "ar", "he"]);
export const courseVisibilityEnum = mysqlEnum("course_visibility", ["PUBLIC", "PRIVATE"]);
export const enrollmentStatusEnum = mysqlEnum("enrollment_status", ["ACTIVE", "COMPLETED", "DROPPED"]);
export const gameTypeEnum = mysqlEnum("game_type", ["LTI", "SCORM", "XAPI", "HTML5"]);

// ============================================
// USER MANAGEMENT & AUTHENTICATION
// ============================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  role: userRoleEnum.notNull().default("STUDENT"),
  externalId: varchar("external_id", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  passwordHash: text("password_hash").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  schoolId: int("school_id"),
  preferredLanguage: languageEnum.notNull().default("en"),
  failedLoginAttempts: int("failed_login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  twoFactorSecret: varchar("two_factor_secret", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
}, (table) => ({
  externalIdIdx: index("external_id_idx").on(table.externalId),
  emailIdx: index("email_idx").on(table.email),
  schoolIdIdx: index("school_id_idx").on(table.schoolId),
  roleIdx: index("role_idx").on(table.role),
}));

export const refreshTokens = mysqlTable("refresh_tokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  userId: int("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  tokenIdx: index("token_idx").on(table.token),
}));

export const schools = mysqlTable("schools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  nameHe: varchar("name_he", { length: 255 }),
  region: varchar("region", { length: 100 }),
  contactEmail: varchar("contact_email", { length: 320 }),
  meta: json("meta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("name_idx").on(table.name),
}));

// ============================================
// COURSE CONTENT STRUCTURE
// ============================================

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  titleHe: varchar("title_he", { length: 255 }),
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),
  descriptionHe: text("description_he"),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  tags: json("tags").$type<string[]>().notNull(),
  tagsAr: json("tags_ar").$type<string[]>().notNull(),
  tagsHe: json("tags_he").$type<string[]>().notNull(),
  visibility: courseVisibilityEnum.notNull().default("PUBLIC"),
  prerequisites: text("prerequisites"),
  prerequisitesAr: text("prerequisites_ar"),
  prerequisitesHe: text("prerequisites_he"),
  learningOutcomes: text("learning_outcomes"),
  learningOutcomesAr: text("learning_outcomes_ar"),
  learningOutcomesHe: text("learning_outcomes_he"),
  estimatedDuration: int("estimated_duration"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("published_at"),
}, (table) => ({
  createdByIdx: index("created_by_idx").on(table.createdBy),
  visibilityIdx: index("visibility_idx").on(table.visibility),
}));

export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("course_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  titleHe: varchar("title_he", { length: 255 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  descriptionHe: text("description_he"),
  order: int("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  courseIdOrderIdx: index("course_id_order_idx").on(table.courseId, table.order),
}));

export const lectures = mysqlTable("lectures", {
  id: int("id").autoincrement().primaryKey(),
  unitId: int("unit_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  titleHe: varchar("title_he", { length: 255 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  descriptionHe: text("description_he"),
  order: int("order").notNull(),
  videoUrl: varchar("video_url", { length: 500 }).notNull(),
  videoUrlAr: varchar("video_url_ar", { length: 500 }),
  videoUrlHe: varchar("video_url_he", { length: 500 }),
  durationSec: int("duration_sec").notNull(),
  captionsUrl: varchar("captions_url", { length: 500 }),
  captionsUrlAr: varchar("captions_url_ar", { length: 500 }),
  captionsUrlHe: varchar("captions_url_he", { length: 500 }),
  summaryMarkdown: text("summary_markdown"),
  summaryMarkdownAr: text("summary_markdown_ar"),
  summaryMarkdownHe: text("summary_markdown_he"),
  references: json("references"),
  availableFrom: timestamp("available_from"),
  availableUntil: timestamp("available_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  unitIdOrderIdx: index("unit_id_order_idx").on(table.unitId, table.order),
}));

export const attachments = mysqlTable("attachments", {
  id: int("id").autoincrement().primaryKey(),
  lectureId: int("lecture_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  titleHe: varchar("title_he", { length: 255 }),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileUrlAr: varchar("file_url_ar", { length: 500 }),
  fileUrlHe: varchar("file_url_he", { length: 500 }),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: int("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  lectureIdIdx: index("lecture_id_idx").on(table.lectureId),
}));

// ============================================
// INTERACTIVE GAMES
// ============================================

export const interactiveGames = mysqlTable("interactive_games", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  titleHe: varchar("title_he", { length: 255 }),
  type: gameTypeEnum.notNull(),
  launchUrl: varchar("launch_url", { length: 500 }),
  launchUrlAr: varchar("launch_url_ar", { length: 500 }),
  launchUrlHe: varchar("launch_url_he", { length: 500 }),
  config: json("config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const unitGames = mysqlTable("unit_games", {
  id: int("id").autoincrement().primaryKey(),
  unitId: int("unit_id").notNull(),
  gameId: int("game_id").notNull(),
  requiredToComplete: boolean("required_to_complete").notNull().default(false),
  scoringRules: json("scoring_rules"),
  order: int("order").notNull().default(0),
}, (table) => ({
  unitIdIdx: index("unit_id_idx").on(table.unitId),
  gameIdIdx: index("game_id_idx").on(table.gameId),
}));

// ============================================
// STUDENT PROGRESS & ENGAGEMENT
// ============================================

export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  courseId: int("course_id").notNull(),
  status: enrollmentStatusEnum.notNull().default("ACTIVE"),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userCourseUnique: unique("user_course_unique").on(table.userId, table.courseId),
  userIdIdx: index("user_id_idx").on(table.userId),
  courseIdIdx: index("course_id_idx").on(table.courseId),
  statusIdx: index("status_idx").on(table.status),
}));

export const progress = mysqlTable("progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  lectureId: int("lecture_id").notNull(),
  positionSec: int("position_sec").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  watchedLanguage: languageEnum.notNull().default("en"),
  lastSeenAt: timestamp("last_seen_at").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userLectureUnique: unique("user_lecture_unique").on(table.userId, table.lectureId),
  userIdIdx: index("user_id_idx").on(table.userId),
  lectureIdIdx: index("lecture_id_idx").on(table.lectureId),
  completedIdx: index("completed_idx").on(table.completed),
}));

export const gameSessions = mysqlTable("game_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  gameId: int("game_id").notNull(),
  unitId: int("unit_id").notNull(),
  score: float("score"),
  completed: boolean("completed").notNull().default(false),
  durationSec: int("duration_sec"),
  rawEvents: json("raw_events"),
  playedLanguage: languageEnum.notNull().default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  gameIdIdx: index("game_id_idx").on(table.gameId),
  unitIdIdx: index("unit_id_idx").on(table.unitId),
  completedIdx: index("completed_idx").on(table.completed),
}));

// ============================================
// AUDIT & ANALYTICS
// ============================================

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorUserId: int("actor_user_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: int("entity_id"),
  meta: json("meta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  actorUserIdIdx: index("actor_user_id_idx").on(table.actorUserId),
  entityTypeIdIdx: index("entity_type_id_idx").on(table.entityType, table.entityId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  sessionId: varchar("session_id", { length: 100 }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  props: json("props"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  sessionIdIdx: index("session_id_idx").on(table.sessionId),
  eventTypeIdx: index("event_type_idx").on(table.eventType),
  timestampIdx: index("timestamp_idx").on(table.timestamp),
}));

// ============================================
// SYSTEM CONFIGURATION
// ============================================

export const systemConfig = mysqlTable("system_config", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: json("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const translationCache = mysqlTable("translation_cache", {
  id: int("id").autoincrement().primaryKey(),
  sourceText: text("source_text").notNull(),
  sourceLang: varchar("source_lang", { length: 10 }).notNull(),
  targetLang: varchar("target_lang", { length: 10 }).notNull(),
  translation: text("translation").notNull(),
  context: varchar("context", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  sourceLangTargetLangIdx: index("source_lang_target_lang_idx").on(table.sourceLang, table.targetLang),
}));

// ============================================
// TYPE EXPORTS
// ============================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;
export type Lecture = typeof lectures.$inferSelect;
export type InsertLecture = typeof lectures.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;
export type InteractiveGame = typeof interactiveGames.$inferSelect;
export type InsertInteractiveGame = typeof interactiveGames.$inferInsert;
export type UnitGame = typeof unitGames.$inferSelect;
export type InsertUnitGame = typeof unitGames.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = typeof progress.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

