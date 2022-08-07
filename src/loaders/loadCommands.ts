import path from "path";
import fs from "fs";
import { Collection } from "discord.js";

/**
 * Iterates through all files in commands folder and adds them to a collection
 * @returns commands -> A collection of all command files
 */
const loadCommands = () => {
	const commands = new Collection();
	//@ts-ignore
	const commandFiles = fs.readdirSync(path.join(__dirname, "../commands")).filter(file => file.endsWith(".js"));

	for (const file of commandFiles) {
		const command = require(`${path.join(__dirname, "../commands")}/${file}`);
		// Set a new item in the Collection
		// With the key as the command name and the value as the exported module
		commands.set(command.data.name, command);
	}
	return commands;
};

export default loadCommands;