const { MessageEmbed } = require('discord.js');
const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")

module.exports = async (client, interaction) => {
    const filter = () => true

    if(interaction.isButton()){
        interaction.deferUpdate()
        // vente objet
        if(interaction.customId.startsWith('sellobjet')) {
            let splits = interaction.customId.split("-")
            if(interaction.user.id == splits[1]) fx.sell(splits[2], interaction)
        }
        
        
    } else if (interaction.isCommand()) {
        const commandName = interaction.commandName;

        const command = client.commands.get(commandName);

        if (!command) return;

        command.run(client, interaction);
    } else if (interaction.isMessageComponent()) {
        
    }
    
}