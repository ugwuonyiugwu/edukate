// @/db/schema.ts
import { pgTable, text, timestamp, uuid, integer, uniqueIndex, varchar, date, serial, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  username: text("username"),
  imageUrl: text("image_url"),
  firstName: text("first_name"), 
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  school: text("school"),
  gender: text("gender"),
  dateOfBirth: date("date_of_birth"), 
  state: text("state"),
  quizProgress: integer("quiz_progress").default(0).notNull(),
  courseProgress: integer("course_progress").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  role: text("role").default("user").notNull(),
  points: integer("points").default(200).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]);

// --- LIBRARIES & DOCUMENTS ---
export const libraries = pgTable("libraries", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url"),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  downloads: integer("downloads").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  libraryId: integer("library_id").references(() => libraries.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- QUIZZES ---
export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(), 
  time: text("time").notNull(),
  startTime: timestamp("start_time"), 
  status: text("status").default("waiting").notNull(), 
  points: integer("points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- PARTICIPANTS ---

export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }).notNull(),
  clerkId: text("clerk_id").notNull(), 
  score: integer("score").default(0).notNull(), // ADDED
  isEliminated: boolean("is_eliminated").default(false).notNull(), // ADDED
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// --- SUBMISSIONS (Updated for 20 questions & Type Safety) ---
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(), // Updated to uuid
  quizId: uuid("quiz_id") // Changed to uuid to match quizzes.id
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  clerkId: text("clerk_id") // Changed to snake_case for consistency
    .notNull()
    .references(() => users.clerkId),
  questionText: text("question_text").notNull(),
  imageUrl: text("image_url"),
  correctAnswer: text("correct_answer").notNull(),
  wrongAnswer1: text("wrong_answer_1").notNull(),
  wrongAnswer2: text("wrong_answer_2").notNull(),
  wrongAnswer3: text("wrong_answer_3").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- RELATIONSHIPS ---

export const userRelations = relations(users, ({ many }) => ({
  registrations: many(participants),
  submissions: many(submissions), // Added relationship
}));

export const libraryRelations = relations(libraries, ({ many }) => ({
  documents: many(documents),
}));

export const documentRelations = relations(documents, ({ one }) => ({
  library: one(libraries, {
    fields: [documents.libraryId],
    references: [libraries.id],
  }),
}));

export const quizRelations = relations(quizzes, ({ many }) => ({
  participants: many(participants),
  submissions: many(submissions), // Added relationship
}));

export const participantRelations = relations(participants, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [participants.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [participants.clerkId],
    references: [users.clerkId],
  }),
}));

export const submissionRelations = relations(submissions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [submissions.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [submissions.clerkId],
    references: [users.clerkId],
  }),
}));

// --- CLASSES (Updated with Level, Subject, and Date) ---
export const classes = pgTable("classes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  level: varchar("level", { length: 50 }).notNull().default("Basic"),
  examDelayDays: integer("exam_delay_days").default(0).notNull(),  
  pointsRequired: integer("points_required").default(0).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  pdfUrl: text("pdf_url"),
  youtubeUrl: text("youtube_url"),
  clerkId: text("clerk_id").notNull(), 
  createdAt: timestamp("created_at").defaultNow(),
});

// --- CLASS ENROLLMENTS ---
export const classEnrollments = pgTable("class_enrollments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  clerkId: text("clerk_id").notNull().references(() => users.clerkId),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// --- RELATIONSHIPS (Updated) ---
export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.clerkId],
    references: [users.clerkId],
  }),
  enrollments: many(classEnrollments),
}));

export const enrollmentsRelations = relations(classEnrollments, ({ one }) => ({
  class: one(classes, {
    fields: [classEnrollments.classId],
    references: [classes.id],
  }),
  student: one(users, {
    fields: [classEnrollments.clerkId],
    references: [users.clerkId],
  }),
}));