import { CommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import fs from "fs";
import yaml from "js-yaml";
import { YamlDoc } from "..";
import { buildStatusEmbed } from "../util/embed";
import path from "path";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("set-fleet-status-channel")
		.setDescription("sets the current channel as the channel for the Makhado fleet status"),

	async execute(interaction: CommandInteraction) {

		// Enusre only management can use this command
		const requiredRole = "1005835216025305178";
		if (!interaction.guild?.members.cache.get(interaction.user.id)?.roles.cache.has(requiredRole)) {
			await interaction.reply({ content: "This command is for use by management only", ephemeral: true });
			return;
		}

		// Check if there's an existing status message in another channel which needs to be deleted
		const dir = path.join(__dirname, "../config/fleet.yaml");
		const yamlDoc = <YamlDoc>yaml.load(fs.readFileSync(dir, "utf-8"));

		if (yamlDoc.lastStatusChannelID != null) {
			const channel = interaction.client.channels.cache.get(yamlDoc.lastStatusChannelID) as TextChannel;
			await channel.messages.delete(<string>yamlDoc.lastStatusMessageID).catch(error => console.log(error));
		}

		// Create and send the fleet status embed
		buildStatusEmbed(yamlDoc)
			.then(async messageComponents => {
				//@ts-ignore
				const messageID = await (await interaction.reply({ embeds: [messageComponents.embed], components: [messageComponents.row], fetchReply: true })).id;
				// Write to file
				yamlDoc.lastStatusChannelID = interaction.channelId;
				yamlDoc.lastStatusMessageID = messageID;
				fs.writeFileSync(dir, yaml.dump(yamlDoc));
			})
			.catch(async reason => {
				await interaction.reply({content: "This channel has been set as the fleet status channel successfully", ephemeral: true});
				// Write to file
				yamlDoc.lastStatusChannelID = interaction.channelId;
				fs.writeFileSync(dir, yaml.dump(yamlDoc));
				return;
			});
	}
};