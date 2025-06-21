import { Redis } from "@upstash/redis";

export const db = new Redis({
    url:process.env.UPSTASH_REDIS_REST_URL,
    token:process.env.UPSTASH_REDIS_REST_TOKEN
})

db.set("healthcheck", "ok").then(() => console.log("Redis OK")).catch(console.error);
