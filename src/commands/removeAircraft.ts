import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import yaml from "js-yaml";
import fs from "fs";
import { YamlDoc } from "..";
import { buildStatusEmbed } from "../util/embed";
import { writeFile } from "fs/promises";
import path from "path";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("remove-aircraft")
		.setDescription("remove an aircraft from the fleet list")
		.addStringOption(option => 
			option.setName("registration")
				.setDescription("The aircraft registration in capitals e.g ZS-ABC")
				.setRequired(true)),

	async execute(interaction: ChatInputCommandInteraction) {

		// Enusre only management can use this command
		const requiredRole = "1005835216025305178";
		if (!interaction.guild?.members.cache.get(interaction.user.id)?.roles.cache.has(requiredRole)) {
			await interaction.reply({ content: "This command is for use by management only", ephemeral: true });
			return;
		}

		const registration = <string>interaction.options.getString("registration");

		// Read existing YAML file and delete aircraft if it exists
		const dir = path.join(__dirname, "../config/fleet.yaml");
		const yamlDoc = <YamlDoc>yaml.load(fs.readFileSync(dir, "utf-8"));

		yamlDoc.aircraft.forEach((element, index) => {
			if (Object.keys(element)[0] === registration) {
				yamlDoc.aircraft.splice(index, 1);
			}
		});
		fs.writeFileSync(dir, yaml.dump(yamlDoc));

		// Delete old status embed to make to new one with new aircraft in it (only if an embed actually exists in the first place)
		if (yamlDoc.lastStatusChannelID != null && yamlDoc.lastStatusMessageID != null) {
			const channel = await interaction.client.channels.fetch(<string>yamlDoc.lastStatusChannelID) as TextChannel;
			channel.messages.delete(yamlDoc.lastStatusMessageID)
				.then(item => {
					// Send new embed with updated fleet list
					buildStatusEmbed(yamlDoc)
						.then(async messageComponents => {
							//@ts-ignore
							await interaction.reply({ embeds: [messageComponents.embed], components: [messageComponents.row]});
							yamlDoc.lastStatusMessageID = null;
							await writeFile(dir, yaml.dump(yamlDoc));
						})
						// If this rejects, it means that there are now no aircraft in the fleet so no embed should be sent and the lastStatusMessageID must be set to null
						.catch(async reason => {
							await interaction.reply({content: `${registration} removed from fleet successfully`, ephemeral: true});
							yamlDoc.lastStatusMessageID = null;
							await writeFile(dir, yaml.dump(yamlDoc));
						});})
				.catch(async error => console.log(error));
		}

	}
};