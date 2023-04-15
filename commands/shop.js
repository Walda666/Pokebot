const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const discord = require('discord.js');

exports.run = async (client, interaction) => {

    let result = fx.query(`SELECT centre FROM lieux WHERE channel = '${interaction.channel.id}'`)
    if(!result[0].centre) return interaction.reply({ embeds: [fx.emb(interaction.user, "ERREUR", "Il n'y a pas de boutique ici.", "RED")] })
    result = fx.query(`SELECT O.id, O.nom, O.type, O.valeur, O.emoji, O.description, O.prix_achat, O.prix_vente FROM magasin M JOIN lieux L ON L.id = M.lieu JOIN objet O ON O.id = M.objet WHERE L.channel = '${interaction.channel.id}'`)
    
    let tabPotions = []
    let tabBalls = []
    let tabBaies = []
    let tabSpeciaux = []

    for(i = 0; i < result.length; i++) {
        if(result[i].type == "potion") tabPotions.push(result[i])
        if(result[i].type == "ball") tabBalls.push(result[i])
        if(result[i].type == "baie") tabBaies.push(result[i])
        if(result[i].type == "special") tabSpeciaux.push(result[i])
    }

    let desc = ""
    tabPotions.forEach(objet => {
        let emoji = client.emojis.cache.get(objet.emoji)
        desc += `${objet.id} **·** ${emoji} ${objet.nom} - ${objet.description} (${objet.prix_achat} **|** ${objet.prix_vente})\n\n`
    })
    if(!tabPotions.length) desc = "Il n'y a rien à acheter dans cette catégorie"

    let embedPotions = new discord.MessageEmbed()
    .setTitle(`Shop - Potions`)
    .setDescription(desc)
    .setFooter({text: "/buy [id] [quantité] pour acheter un objet"})

    desc = ""
    tabBalls.forEach(objet => {
        let emoji = client.emojis.cache.get(objet.emoji)
        desc += `${objet.id} **·** ${emoji} ${objet.nom} - ${objet.description} (${objet.prix_achat} **|** ${objet.prix_vente})\n\n`
    })

    let embedBalls = new discord.MessageEmbed()
    .setTitle(`Shop - Balls`)
    .setDescription(desc)
    .setFooter({text: "/buy [id] [quantité] pour acheter un objet"})
    if(!tabBalls.length) desc = "Il n'y a rien à acheter dans cette catégorie"

    desc = ""
    tabBaies.forEach(objet => {
        let emoji = client.emojis.cache.get(objet.emoji)
        desc += `${objet.id} **·** ${emoji} ${objet.nom} - ${objet.description} (${objet.prix_achat} **|** ${objet.prix_vente})\n\n`
    })
    if(!tabBaies.length) desc = "Il n'y a rien à acheter dans cette catégorie"

    let embedBaies = new discord.MessageEmbed()
    .setTitle(`Shop - Baies`)
    .setDescription(desc)
    .setFooter({text: "/buy [id] [quantité] pour acheter un objet"})

    desc = ""
    tabSpeciaux.forEach(objet => {
        let emoji = client.emojis.cache.get(objet.emoji)
        desc += `${objet.id} **·** ${emoji} ${objet.nom} - ${objet.description} (${objet.prix_achat} **|** ${objet.prix_vente})\n\n`
    })
    if(!tabSpeciaux.length) desc = "Il n'y a rien à acheter dans cette catégorie"

    let embedSpeciaux = new discord.MessageEmbed()
    .setTitle(`Shop - Spéciaux`)
    .setDescription(desc)
    .setFooter({text: "/buy [id] [quantité] pour acheter un objet"})

    const rowShop = new discord.MessageActionRow().addComponents(
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
    )

    let msgInv = await interaction.channel.send({embeds: [embedPotions], components: [rowShop]})

    const filter = (i) => i.user.id == interaction.user.id
    const collector = interaction.channel.createMessageComponentCollector({ filter : filter});
    collector.on('collect', async bouton => {

        if (bouton.customId === 'potions') msgInv.edit({embeds: [embedPotions]})
        if (bouton.customId === 'balls') msgInv.edit({embeds: [embedBalls]})
        if (bouton.customId === 'baies') msgInv.edit({embeds: [embedBaies]})
        if (bouton.customId === 'speciaux') msgInv.edit({embeds: [embedSpeciaux]})
    })


}


exports.help = {
    shown: true,
    name: "shop",
    description: "Affiche la boutique du lieu",
    args: "Aucun",
    cooldown: "Aucun",
    category: "/"
}