const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const discord = require('discord.js');

exports.run = async (client, interaction) => {

    let rowInventaire = new discord.MessageActionRow().addComponents(
        new discord.MessageButton()
            .setCustomId(`potions`)
            .setLabel("Potions")
            .setStyle("SUCCESS"),
        new discord.MessageButton()
            .setCustomId(`balls`)
            .setLabel("Balls")
            .setStyle("SUCCESS"),
        new discord.MessageButton()
            .setCustomId(`baies`)
            .setLabel("Baies")
            .setStyle("SUCCESS"),
        new discord.MessageButton()
            .setCustomId(`speciaux`)
            .setLabel("Spéciaux")
            .setStyle("SUCCESS")
                  
    );
    embedsinv = fx.getInventaire(interaction.user)
    msgInv = await interaction.channel.send({embeds: [embedsinv[0].setFooter({text: ""})], components: [rowInventaire]})
    const filter = (i) => i.user.id == interaction.user.id
    const collector = interaction.channel.createMessageComponentCollector({ filter: filter });
    collector.on('collect', async bouton => {
        if (bouton.customId === 'potions') msgInv.edit({embeds: [embedsinv[0].setFooter({text: ""})]})
        if (bouton.customId === 'balls') msgInv.edit({embeds: [embedsinv[1].setFooter({text: ""})]})
        if (bouton.customId === 'baies') msgInv.edit({embeds: [embedsinv[2].setFooter({text: ""})]})
        if (bouton.customId === 'speciaux') msgInv.edit({embeds: [embedsinv[3].setFooter({text: ""})]})
    });
}
exports.help = {
    shown: true,
    name: "inventaire",
    description: "Affiche l'inventaire",
    args: "Aucun",
    cooldown: "Aucun",
    category: "/"
}