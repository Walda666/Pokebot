const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const discord = require('discord.js');

exports.run = async (client, interaction) => {
    interaction.reply({content: "Commande en cours", ephemeral: true});

    let adjacents = fx.query(`SELECT * FROM connexion C JOIN lieux L ON L.channel = C.lieu2 WHERE lieu1 = '${interaction.channel.id}'`)
    let desc = ""
    let tabReacs = []

    for(i = 0; i < adjacents.length; i++) {
        tabReacs.push(fx.chiffresEmojis[i])
        lieu = adjacents[i]
        let nomSalle = lieu.nom[0].toUpperCase() + lieu.nom.substring(1).replace("-", " ")
        desc += `${i+1}. ${nomSalle}\n\n`
    }

    let emb = fx.emb(interaction.user, "Lieux", desc, "DARK_BLUE")
    let msgLieux = await interaction.channel.send({embeds: [emb.setFooter({text: "Réagissez avec un emoji pour changer de lieu"})]})
    for(i = 0; i < tabReacs.length; i++) msgLieux.react(tabReacs[i])

    // FILTRE BIEN :p
    const filter = (reaction, user) => {
        return !user.bot && tabReacs.includes(reaction.emoji.name)
    }

    const collector = msgLieux.createReactionCollector({filter: filter})
    collector.on('collect', async (reaction, user) => {
        msgLieux.reactions.resolve(reaction.emoji.name).users.remove(interaction.user)
        let ind = tabReacs.indexOf(reaction.emoji.name)
        let chanActu = interaction.channel
        let chanVoulu = await interaction.guild.channels.fetch(adjacents[ind].lieu2)
        // enlever voir chanactu + ajouter voir nouveauchan + déplacer db
        chanActu.permissionOverwrites.edit(interaction.user, { VIEW_CHANNEL: false });
        chanVoulu.permissionOverwrites.edit(interaction.user, { VIEW_CHANNEL: true });
        fx.query(`UPDATE utilisateur SET emplacement = '${adjacents[ind].lieu2}' WHERE discordid = '${interaction.user.id}'`)
    })
    


}

exports.help = {
    shown: true,
    name: "aller",
    description: "Se déplacer entre les lieux",
    args: "Aucun",
    cooldown: "Aucun",
    category: "Déplacement"
}