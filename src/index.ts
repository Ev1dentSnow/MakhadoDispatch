const dotenv = require("dotenv");
import { Client, GatewayIntentBits, Collection, ActivityType } from "discord.js";
import loadCommands from "./loaders/loadCommands";
import fs from "fs";
import yaml from "js-yaml";
import { handleInteraction } from "./interactions/interactionHandler";
import path from "path";
dotenv.config({path: ".env"});

// TYPE DEFINITIONS
export interface DiscordClient extends Client<boolean> {
	commands: Collection<any, any>
}

export interface Aircraft {
	[registration: string]: {
		icao: string
		status: string
		lastStatusEditUserID: string
	}
}

export interface YamlDoc {
	lastStatusChannelID: null | string
	lastStatusMessageID: null | string
	aircraft: Array<Aircraft>
}
// END TYPE DEFINITIONS

const clientOptions: any = {
	intents: [GatewayIntentBits.Guilds],
	presence: {activities: [{ name: "over Makhado's fleet", type: ActivityType.Watching }]},
};

//@ts-ignore
const client: DiscordClient = new Client(clientOptions);
client.commands = loadCommands();

// Create fleet YAML file if for some reason it does not exist
const dir = path.join(__dirname, "/config");
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
	const yamlTemplate = { lastStatusChannelID: null, lastStatusMessageID: null, aircraft: [] };
	fs.writeFileSync(path.join(dir, "/fleet.yaml"), yaml.dump(yamlTemplate));
}

client.once("ready", () => {
	console.log("Makhado Dispatch connected to Discord");
});

client.on("interactionCreate", async interaction => {
	await handleInteraction(interaction, client);
});

client.login(process.env.TOKEN);