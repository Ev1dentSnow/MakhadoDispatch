const dotenv = require("dotenv");
import { Client, GatewayIntentBits, Collection, ActivityType } from "discord.js";
import loadCommands from "./loaders/loadCommands";
import fs from "fs";
import yaml from "js-yaml";
import { handleInteraction } from "./interactions/interactionHandler";
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
		booking: {
			booked: boolean
			callsign: null | string
			departureICAO: null | string
			arrivalICAO: null | string
			etd: null | string
			pilotUserID: null | string
		}
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
	presence: {activities: [{ name: "and winning against Bonair's fleet", type: ActivityType.Competing }]},
};

//@ts-ignore
const client: DiscordClient = new Client(clientOptions);
client.commands = loadCommands();

// Create fleet YAML file if for some reason it does not exist
const dir = "dist/config";
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
	const yamlTemplate = { lastStatusChannelID: null, lastStatusMessageID: null, aircraft: [] };
	fs.writeFileSync("dist/config/fleet.yaml", yaml.dump(yamlTemplate));
}

client.once("ready", () => {
	console.log("Makhado Dispatch connected to Discord");
});

client.on("interactionCreate", async interaction => {
	await handleInteraction(interaction, client);
});

client.login(process.env.TOKEN);