import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import yaml from "js-yaml";
import fs from "fs";
import { YamlDoc } from "..";
import { buildStatusEmbed } from "../util/embed";

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
		const requiredRole = "1005835552672723085";
		//  || !interaction.guild?.members.cache.get(interaction.user.id)?.roles.cache.has(requiredRole)
		if (interaction.user.id != "238360513082294284") {
			await interaction.reply({ content: "This command is for use by management only", ephemeral: true });
			return;
		}

		const registration = <string>interaction.options.getString("registration");

		// Read existing YAML file and delete aircraft if it exists
		const yamlDoc = <YamlDoc>yaml.load(fs.readFileSync("dist/config/fleet.yaml", "utf-8"));

		yamlDoc.aircraft.forEach((element, index) => {
			if (Object.keys(element)[0] === registration) {
				yamlDoc.aircraft.splice(index, 1);
			}
		});
		fs.writeFileSync("dist/config/fleet.yaml", yaml.dump(yamlDoc));

		// Delete old status embed to make to new one with new aircraft in it (only if an embed actually exists in the first place)
		if (yamlDoc.lastStatusChannelID != null && yamlDoc.lastStatusMessageID != null) {
			const channel = await interaction.client.channels.fetch(<string>yamlDoc.lastStatusChannelID) as TextChannel;
			channel.messages.delete(yamlDoc.lastStatusMessageID)
				.then(item => {
					// Send new embed with updated fleet list
					buildStatusEmbed(yamlDoc)
					//@ts-ignore
						.then(async messageComponents => await interaction.reply({ embeds: [messageComponents.embed], components: [messageComponents.row]}))
						.catch(async reason => await interaction.reply({content: `${registration} removed from fleet successfully`, ephemeral: true}));})
				.catch(async error => await interaction.reply({content: `${registration} removed from fleet successfully`, ephemeral: true}));
		}

	}
};