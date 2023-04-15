const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const discord = require('discord.js');

exports.run = async (client, interaction) => {

    const objet = interaction.options._hoistedOptions[0].value
    const quantite = parseInt(interaction.options._hoistedOptions[1].value)
    let result = fx.query(`SELECT centre, O.nom, O.prix_achat FROM lieux L JOIN magasin M ON L.id = M.lieu JOIN objet O ON O.id = M.objet WHERE channel = '${interaction.channel.id}' AND M.objet = '${objet}'`)
    if(!result[0]) return interaction.reply({embeds: [fx.emb(interaction.user, "ERREUR", "Vous devez être dans une boutique avec cet objet disponible", "RED")]})
    interaction.reply({content: "Commande en cours", ephemeral: true});
    
    let thune = fx.query(`SELECT balance FROM utilisateur WHERE discordid = '${interaction.user.id}'`)
    let prixtotal = parseInt(result[0].prix_achat) * quantite
    if(parseInt(thune[0].balance) < prixtotal) return interaction.reply({embeds: [fx.emb(interaction.user, "ERREUR", `Vous n'avez pas assez d'argent pour acheter ça\n\nSolde : ${thune[0].balance}`, "RED")]})

    const rowBuy = new discord.MessageActionRow().addComponents(
        new discord.MessageButton()
            .setCustomId(`buyoui`)
            .setLabel("Oui")
            .setStyle("SUCCESS"),
        new discord.MessageButton()
            .setCustomId(`buynon`)
            .setLabel("Non")
            .setStyle("DANGER")
    )

    const filter = () => true
    let msg = await interaction.channel.send({embeds: [fx.emb(interaction.user, "Confirmation", `Voulez-vous acheter ${quantite} ${result[0].nom} pour ${prixtotal}${fx.emojis.argent} ?`, "WHITE")], components: [rowBuy]})
    let reponse = await msg.awaitMessageComponent({ filter, componentType: 'BUTTON' })
    if(reponse.customId == "buyoui") {
        fx.query(`UPDATE utilisateur SET balance = balance - ${prixtotal} WHERE discordid = '${interaction.user.id}'`)
        msg.embeds[0].setColor("GREEN")
        let inv = fx.query(`SELECT * FROM inventaire WHERE objet = '${objet}' AND utilisateur = '${interaction.user.id}'`)
        // update ou insert selon si dans inv
        if(inv.length) fx.query(`UPDATE inventaire I SET quantite = quantite + ${quantite} WHERE utilisateur = '${interaction.user.id}'`)
        else fx.query(`INSERT INTO inventaire(utilisateur, objet, quantite) VALUES ('${interaction.user.id}', '${objet}', '${quantite}')`)
        msg.edit({embeds: [msg.embeds[0].setDescription("Achat terminé avec succès")]})
    } else {
        msg.embeds[0].setColor("ORANGE")
        msg.edit({embeds: [msg.embeds[0].setDescription("Achat annulé")]})
    }

}

exports.help = {
    shown: true,
    name: "buy",
    description: "Acheter un objet dans une boutique",
    args: "<objet> <quantité>",
    cooldown: "Aucun",
    category: "Magasin"
}