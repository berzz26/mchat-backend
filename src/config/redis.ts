import { createClient } from "redis";

const REDIS_URL = process.env.UPSTASH_REDIS_URL

if (!REDIS_URL) {
    throw new Error('Redis url not found');
}
const client = createClient({
    url: REDIS_URL
});

client.on("error", (err) => {
    console.error("Redis connection error:", err);
});

client.on("connect", () => {
    console.log("Connected to Redis");
});

// connect once at startup
(async () => {
    await client.connect();
})();

export default client;
