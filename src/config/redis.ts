import { createClient } from "redis";

const client = createClient();

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
