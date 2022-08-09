import { BaseInteraction, ModalBuilder, TextInputBuilder, ActionRowBuilder, ModalActionRowComponentBuilder, TextInputStyle, TextChannel, RestOrArray, APIEmbedField, APISelectMenuOption, SelectMenuBuilder, EmbedBuilder } from "discord.js";
import { DiscordClient } from "..";
import fs from "fs";
import yaml from "js-yaml";
import { YamlDoc } from "..";

/**
 * Dispatches the interaction appropriately depending on what type of interaction it is
 * @param interaction 
 * @param client 
 * @returns 
 */
export async function handleInteraction(interaction: BaseInteraction, client: DiscordClient) {
    
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName);

		try {
			await command.execute(interaction);
		} catch (error) {
			console.log(error);
			await interaction.reply({content: "There was an error while executing this command. Please contact Ev1dentSnow if this error persists", ephemeral: true});

		}
	} 
	// Used purely for handling the selection of an aircraft in the fleet
	else if (interaction.isSelectMenu()) {

		const statusUpdateModal = new ModalBuilder()
			.setCustomId("updateModal")
			.setTitle("Update aircraft status");

		const newStatusInput = new TextInputBuilder()
		// Set ID to registration selected in select menu
			.setCustomId(interaction.values[0])
			.setLabel("Enter status")
			.setStyle(TextInputStyle.Short);

		const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(newStatusInput);
		statusUpdateModal.addComponents(actionRow);

		await interaction.showModal(statusUpdateModal);
	}
	// Used purely for handling the update of the status of an aircraft in the fleet
	else if (interaction.isModalSubmit()) {

		const yamlDoc = <YamlDoc>yaml.load(fs.readFileSync("dist/config/fleet.yaml", "utf-8"));

		// Prepare variables to be used in editing of status embed
		let registration = "";

		yamlDoc.aircraft.forEach((element, index) => {
			// Check if the current element is the registration that was selected in the select menu
			if (Object.keys(element)[0] === <string>interaction.fields.fields.first()?.customId) {
				registration = Object.keys(element)[0];
				yamlDoc.aircraft[index][registration].status = interaction.fields.getTextInputValue(Object.keys(element)[0]);
				yamlDoc.aircraft[index][registration].lastStatusEditUserID = interaction.user.id;
				fs.writeFileSync("dist/config/fleet.yaml", yaml.dump(yamlDoc));
			}
		});
		await interaction.reply({ content: "Aircraft status updated successfully", ephemeral: true });
		// Update status embed
		try {
			const channel = await interaction.client.channels.fetch(<string>yamlDoc.lastStatusChannelID) as TextChannel;

			// Re-generate embed fields and select menu items for each aircraft
			const embedFields: RestOrArray<APIEmbedField> = [];
			const selectMenuItems: RestOrArray<APISelectMenuOption> = [];
			yamlDoc.aircraft.forEach(element => {

				const fieldValue = `${Object.values(element)[0].status} <@${Object.values(element)[0].lastStatusEditUserID}>`;

				embedFields.push({ name: `${Object.values(element)[0].icao} | ${Object.keys(element)[0]}`, value: fieldValue, inline: false });
				selectMenuItems.push({ label: `${Object.values(element)[0].icao} | ${Object.keys(element)[0]}`, description: "Edit status", value: Object.keys(element)[0] });
			});


			// Generate and send embed with select menu
			const row = new ActionRowBuilder<SelectMenuBuilder>()
				.addComponents(
					new SelectMenuBuilder()
						.setCustomId("select")
						.setPlaceholder("Select an aircraft")
					// dynamically add options from yaml file
						.setOptions(selectMenuItems));

			const fleetStatusEmbed = new EmbedBuilder()
				.setColor("Aqua")
				.setTitle("Makhado Airways Fleet Status")
				.setDescription("What are our aircraft currently doing? Select an aircraft at the bottom to update it's status")
				.setFields(embedFields)
				.setThumbnail("https://i.gyazo.com/38fead66336b86b0d18d85f6bbd3f704.png");


			channel.messages.edit(<string>yamlDoc.lastStatusMessageID, { embeds: [fleetStatusEmbed], components: [row] });
		} catch (error) {
			console.log(error);
		}
	}
	else {
		return;
	}

}