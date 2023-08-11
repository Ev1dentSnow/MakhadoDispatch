const dotenv = require("dotenv");
import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import path from "path";
dotenv.config({path: path.join(__dirname, "../.env")});

const client = new SapphireClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.login(process.env.TOKEN);