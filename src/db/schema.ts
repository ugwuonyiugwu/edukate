// @/db/schema.ts
import { pgTable, text, timestamp, uuid, integer, uniqueIndex, date, serial } from "drizzle-orm/pg-core";
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
  points: integer("points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- NEW TABLE: PARTICIPANTS (The Join Table) ---
export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }).notNull(),
  clerkId: text("clerk_id").notNull(), // We use clerkId to match your user identification style
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// --- UPDATED RELATIONSHIPS ---

export const userRelations = relations(users, ({ many }) => ({
  registrations: many(participants),
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