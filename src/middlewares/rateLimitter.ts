import { rateLimit } from "express-rate-limit";

//  Global server-wide limiter
export const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 min window
    limit: 5000,             // max 5000 requests total across the server per min
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: () => "GLOBAL", // everyone shares the same bucket
});

//  Auth routes (per IP)
export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 min
    limit: 5,                // 5 attempts / 5min per IP
    standardHeaders: true,
    legacyHeaders: false,
});

//  Room routes
export const createRoomLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hr
    limit: 5,                 // prevent spam creation
    standardHeaders: true,
    legacyHeaders: false,
});

export const joinRoomLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 min
    limit: 20,               // per IP
    standardHeaders: true,
    legacyHeaders: false,
});

export const getRoomLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 min
    limit: 10,               // per IP
    standardHeaders: true,
    legacyHeaders: false,
});

//  Chat routes
export const sendChatLimiter = rateLimit({
    windowMs: 30 * 1000, // 30 sec
    limit: 10,           // ~20 messages/min
    standardHeaders: true,
    legacyHeaders: false,
});

export const getChatLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 min
    limit: 30,               // per IP
    standardHeaders: true,
    legacyHeaders: false,
});
