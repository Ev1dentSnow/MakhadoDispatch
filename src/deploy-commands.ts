const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const dotenv = require("dotenv");
import { Routes } from "discord-api-types/v9";
const fs = require("fs");
dotenv.config({ path: ".././.env" });
const TOKEN = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const commands = [];
const commandFiles = fs.readdirSync("./commands").filter((file: any) => file.endsWith(".js"));
for (const file of commandFiles) {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
const rest = new rest_1.REST({ version: "9" }).setToken(TOKEN);
(async () => {
	try {
		console.log("Started refreshing application public (/) Commands.");
		await rest.put(Routes.applicationCommands(<string>clientId), { body: commands });
		console.log("Successfully reloaded application public (/) Commands.");
	}
	catch (error) {
		console.error(error);
	}
})();