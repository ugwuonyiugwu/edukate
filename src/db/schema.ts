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
  points: integer("points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]);

// --- NEW TABLE: LIBRARIES ---
export const libraries = pgTable("libraries", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(), // One library per user
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
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  downloads: integer("dowloads").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  // LINK DOCUMENTS TO LIBRARY
  libraryId: integer("library_id").references(() => libraries.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- RELATIONSHIPS (For easy counting/fetching) ---
export const libraryRelations = relations(libraries, ({ many }) => ({
  documents: many(documents),
}));

export const documentRelations = relations(documents, ({ one }) => ({
  library: one(libraries, {
    fields: [documents.libraryId],
    references: [libraries.id],
  }),
}));