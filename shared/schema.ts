import { pgTable, uuid, text, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const analysisResults = pgTable("analysis_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  fileUrl: text("file_url").notNull(),
  jsonResponse: jsonb("json_response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  status: text("status").default("pending"),
  analysisSummary: text("analysis_summary"),
  tokenUsage: jsonb("token_usage"),
  startedProcessingAt: timestamp("started_processing_at"),
  analyzedAt: timestamp("analyzed_at"),
  errorMessage: text("error_message"),
});

export const recommendedActions = pgTable("recommended_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  analysisId: uuid("analysis_id").notNull().references(() => analysisResults.id, { onDelete: "cascade" }),
  priority: text("priority"),
  action: text("action").notNull(),
  product: text("product"),
  impact: text("impact"),
  timeline: text("timeline"),
  moveFrom: text("move_from"),
  moveTo: text("move_to"),
  quantityToMove: integer("quantity_to_move"),
  sku: text("sku"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  analysisId: uuid("analysis_id").notNull().references(() => analysisResults.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = typeof analysisResults.$inferInsert;
export type RecommendedAction = typeof recommendedActions.$inferSelect;
export type InsertRecommendedAction = typeof recommendedActions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
