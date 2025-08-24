export type WsIncoming =
    | { type: 'join_room'; roomId: string; userId: string }
    | { type: 'send_message'; roomId: string; userId: string; text: string }
    | { type: 'typing'; roomId: string; userId: string; isTyping: boolean };

export type WsOutgoing =
    | { type: 'user_joined'; userId: string; count: number }
    | { type: 'user_left'; userId: string; count: number }
    | { type: 'new_message'; id: string; roomId: string; userId: string; text: string; sentAt: string }
    | { type: 'typing'; userId: string; isTyping: boolean }
    | { type: 'error'; message: string };
