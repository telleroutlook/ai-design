export type ResultItem = {
    type: 'text' | 'image' | 'status';
    content: string;
    alt?: string;
};

// Fix: Add ChatMessage type for use in Chatbot.
export type ChatMessage = {
    id: string;
    role: 'user' | 'model';
    text: string;
};
