import { 
  analysisResults, 
  recommendedActions,
  chatMessages,
  type AnalysisResult, 
  type InsertAnalysisResult,
  type InsertRecommendedAction,
  type InsertChatMessage,
  type ChatMessage
} from "@shared/schema";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  createAnalysisResult(analysisResult: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResults(): Promise<AnalysisResult[]>;
  getAnalysisResult(id: string): Promise<AnalysisResult | undefined>;
  createAnalysisWithRelations(
    analysisData: InsertAnalysisResult, 
    parsedJson: any
  ): Promise<AnalysisResult>;
  getRecommendedActions(analysisId: string): Promise<any[]>;
  deleteAnalysisResult(id: string): Promise<boolean>;
  createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(analysisId: string): Promise<ChatMessage[]>;

  updateAnalysisResult(id: string, jsonResponse: any): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createAnalysisResult(analysisResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const [result] = await db
      .insert(analysisResults)
      .values(analysisResult)
      .returning();
    return result;
  }

  async createAnalysisWithRelations(
    analysisData: InsertAnalysisResult, 
    parsedJson: any
  ): Promise<AnalysisResult> {
    // Insert the main analysis result
    const [result] = await db
      .insert(analysisResults)
      .values(analysisData)
      .returning();

    // Insert recommended actions into separate table
    if (parsedJson.Recommendations && Array.isArray(parsedJson.Recommendations) && parsedJson.Recommendations.length > 0) {
      const recommendedActionsData = parsedJson.Recommendations.map((rec: any) => {
        // Parse quantity to handle formatted strings like "15,000 units"
        let quantity = null;
        const rawQuantity = rec.quantityToMove || rec.move_quantity;
        if (rawQuantity) {
          // Extract numbers from strings like "15,000 units" or "1,500"
          const numericValue = String(rawQuantity).replace(/[^\d]/g, '');
          quantity = numericValue ? parseInt(numericValue, 10) : null;
        }

        return {
          analysisId: result.id,
          priority: rec.priority,
          action: rec.action,
          product: rec.product,
          impact: rec.impact,
          timeline: rec.timeline,
          moveFrom: rec.moveFrom || rec.from_location || null,
          moveTo: rec.moveTo || rec.to_location || null,
          quantityToMove: quantity,
          sku: rec.sku || null,
          expiryDate: rec.expiry_date || rec.expiryDate || null,
        };
      });

      await db
        .insert(recommendedActions)
        .values(recommendedActionsData);
    }

    return result;
  }

  async getAnalysisResults(): Promise<AnalysisResult[]> {
    return await db
      .select()
      .from(analysisResults)
      .orderBy(desc(analysisResults.createdAt));
  }

  async getAnalysisResult(id: string): Promise<AnalysisResult | undefined> {
    const [result] = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.id, id));
    return result || undefined;
  }

  async getRecommendedActions(analysisId: string): Promise<any[]> {
    return await db
      .select()
      .from(recommendedActions)
      .where(eq(recommendedActions.analysisId, analysisId));
  }

  async deleteAnalysisResult(id: string): Promise<boolean> {
    // First delete related recommended actions and chat messages
    await db.delete(recommendedActions).where(eq(recommendedActions.analysisId, id));
    await db.delete(chatMessages).where(eq(chatMessages.analysisId, id));
    
    // Then delete the analysis result
    const result = await db.delete(analysisResults).where(eq(analysisResults.id, id));
    return result.rowCount > 0;
  }

  async createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage> {
    const [result] = await db
      .insert(chatMessages)
      .values(chatMessage)
      .returning();
    return result;
  }

  async getChatMessages(analysisId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.analysisId, analysisId))
      .orderBy(chatMessages.createdAt);
  }



  async updateAnalysisResult(id: string, jsonResponse: any): Promise<boolean> {
    const result = await db
      .update(analysisResults)
      .set({ jsonResponse })
      .where(eq(analysisResults.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
