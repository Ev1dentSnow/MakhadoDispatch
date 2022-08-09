import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel, Utils } from "discord.js";
import yaml from "js-yaml";
import fs from "fs";
import { Aircraft, YamlDoc } from "..";
import { buildStatusEmbed } from "../util/embed";
import path from "path";
import { writeFile } from "fs/promises";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("add-aircraft")
		.setDescription("add an aircraft to the fleet list")
		.addStringOption(option =>
			option.setName("icao-aircraft-type")
				.setDescription("The ICAO designator for the aircraft e.g B739ER")
				.setRequired(true))
		.addStringOption(option =>
			option.setName("registration")
				.setDescription("The aircraft registration in capitals e.g ZS-ABC")
				.setRequired(true))
		.addStringOption(option => 
			option.setName("status")
				.setDescription("The status and location of this aircraft")
				.setRequired(true)),

	async execute(interaction: ChatInputCommandInteraction) {
		
		// Enusre only management can use this command
		const requiredRole = "1005835216025305178";
		//|| !interaction.guild?.members.cache.get(interaction.user.id)?.roles.cache.has(requiredRole)
		if (!interaction.guild?.members.cache.get(interaction.user.id)?.roles.cache.has(requiredRole)) {
			await interaction.reply({ content: "This command is for use by management only", ephemeral: true });
			return;
		}

		const ICAO = <string>interaction.options.getString("icao-aircraft-type");
		const registration = <string>interaction.options.getString("registration");
		const status = <string>interaction.options.getString("status");

		const newAircraft: Aircraft = {
			[registration]: {
				icao: ICAO,
				status: status,
				lastStatusEditUserID: interaction.user.id,
			}	
		};

		// Check if aircraft already exists. If not, update the YAML doc
		const dir = path.join(__dirname, "../config/fleet.yaml");
		const yamlDoc = <YamlDoc>yaml.load(fs.readFileSync(dir, "utf-8"));

		yamlDoc.aircraft.forEach(async (element, index) => {
			if (Object.keys(element)[index] === registration) {
				await interaction.reply({ content: "An aircraft with this registration already exists. Use /remove-aircraft to remove it first", ephemeral: true });
				return;
			}
		});
		yamlDoc.aircraft.push(newAircraft);

		// Delete old status embed to make to new one with new aircraft in it. If status message doesn't exist, create a new one without deletion
		if (yamlDoc.lastStatusChannelID != null) {
			if (yamlDoc.lastStatusMessageID != null) {
				const channel = await interaction.client.channels.fetch(<string>yamlDoc.lastStatusChannelID) as TextChannel;
				channel.messages.delete(yamlDoc.lastStatusMessageID)
					.then(item => {
						// Send new embed with updated fleet list
						buildStatusEmbed(yamlDoc)
							.then(async messageComponents => {
								//@ts-ignore
								const messageID = await (await interaction.reply({ embeds: [messageComponents.embed], components: [messageComponents.row], fetchReply: true})).id;
								yamlDoc.lastStatusMessageID = messageID.slice();
								await writeFile(dir, yaml.dump(yamlDoc));
							});
					});
			} else {
				buildStatusEmbed(yamlDoc)
					.then(async messageComponents => {
					//@ts-ignore
						const messageID = await (await interaction.reply({ embeds: [messageComponents.embed], components: [messageComponents.row], fetchReply: true })).id;
						yamlDoc.lastStatusMessageID = messageID.slice();
						await writeFile(dir, yaml.dump(yamlDoc));
					});
			}
		}
	}
};