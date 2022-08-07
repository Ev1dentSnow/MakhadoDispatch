import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import yaml from "js-yaml";
import fs from "fs";
import { YamlDoc } from "..";

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
		if (interaction.user.id != "238360513082294284" || !interaction.guild?.members.cache.get(interaction.user.id)?.roles.cache.has(requiredRole)) {
			await interaction.reply({ content: "This command is for use by management only", ephemeral: true });
			return;
		}

		const registration = <string>interaction.options.getString("registration");

		// Read existing YAML file and delete aircraft if it exists
		const yamlDoc = <YamlDoc>yaml.load(fs.readFileSync("dist/config/fleet.yaml", "utf-8"));

		yamlDoc.aircraft.forEach((element, index) => {
			if (Object.keys(element.registration)[0] === registration) {
				yamlDoc.aircraft.splice(index, 1);
			}
		});

		fs.writeFileSync("dist/config/fleet.yaml", yaml.dump(yamlDoc));

		await interaction.reply({content: `${registration} removed from fleet successfully`, ephemeral: true});


	}
};