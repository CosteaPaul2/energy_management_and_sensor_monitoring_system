export type MessageType = "CHAT" | "JOIN" | "LEAVE";

export interface ChatMessage {
    sender: string;
    content: string;
    type: MessageType;
    messageId?: string; 
}