import dotenv from "dotenv";
import "@sapphire/plugin-scheduled-tasks/register";
import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import { createClient, RedisClientType } from "redis";
import populateAirportDatabase from "./functions/database/populateAirportDatabase";
import path from "path";

dotenv.config({path: path.join(__dirname, "../.env")});

// Initialize redis database
const redisClient = createClient();
redisClient.on("error", err => console.log("Redis Client Error", err));

// Populate/Refresh airport database
(async () => {
	await redisClient.connect();
	await populateAirportDatabase(<RedisClientType>redisClient);
})();

const client = new SapphireClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.login(process.env.TOKEN);