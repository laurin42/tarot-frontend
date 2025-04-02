import { ISelectedAndShownCard } from "@/constants/tarotcards";

export interface ApiErrorResponse {
  error: string;
  status?: number;
}

export interface CardExplanationResponse {
  explanation: string;
  goalsIncluded: boolean;
}

export interface SummaryResponse {
  success: boolean;
  summary: string;
  cards: string[];
  profileInfoIncluded: {
    goals: boolean;
    gender: boolean;
    zodiac: boolean;
    age: boolean;
  };
}

export interface ReadingSummaryResponse {
  id: number;
  name: string;
  description: string;
  sessionId: string;
  position: number;
  createdAt: string;
}

export interface CardResponse {
  card: ISelectedAndShownCard;
}