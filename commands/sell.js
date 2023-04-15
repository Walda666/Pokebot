const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const discord = require('discord.js');

exports.run = async (client, interaction) => {

interaction.reply({content: "Commande en cours", ephemeral: true});
const msg_filter = m => m.author.id === interaction.user.id;
let result = fx.query(`SELECT centre FROM lieux WHERE channel = '${interaction.channel.id}'`)
    if(!result[0].centre) return interaction.channel.send({ embeds: [fx.emb(interaction.user, "ERREUR", "Il n'y a pas de boutique ici.", "RED")] })

    invActu = 0
    
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
            .setStyle("SUCCESS"),
        new discord.MessageButton()
            .setCustomId(`sellobjet-${interaction.user.id}-${invActu}`)
            .setLabel("Vendre")
            .setStyle("PRIMARY")
                  
    );


    embedsinv = fx.getInventaire(interaction.user)
    msgInv = await interaction.channel.send({embeds: [embedsinv[0]], components: [rowInventaire]})

    const filter = () => true
    const collector = interaction.channel.createMessageComponentCollector({ filter });
    collector.on('collect', async bouton => {
        if (bouton.customId === 'potions') {
            invActu = 0
            rowInventaire = new discord.MessageActionRow().addComponents(
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
            .setStyle("SUCCESS"),
        new discord.MessageButton()
            .setCustomId(`sellobjet-${interaction.user.id}-${invActu}`)
            .setLabel("Vendre")
            .setStyle("PRIMARY")
                  
    );
            msgInv.edit({embeds: [embedsinv[0]], components: [rowInventaire]})
        }

        if (bouton.customId === 'balls') {
            invActu = 1
            rowInventaire = new discord.MessageActionRow().addComponents(
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
                    .setStyle("SUCCESS"),
                new discord.MessageButton()
                    .setCustomId(`sellobjet-${interaction.user.id}-${invActu}`)
                    .setLabel("Vendre")
                    .setStyle("PRIMARY")
                          
            );
            msgInv.edit({embeds: [embedsinv[1]], components: [rowInventaire]})
        }

        if (bouton.customId === 'baies') {
            invActu = 2
            rowInventaire = new discord.MessageActionRow().addComponents(
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
                    .setStyle("SUCCESS"),
                new discord.MessageButton()
                    .setCustomId(`sellobjet-${interaction.user.id}-${invActu}`)
                    .setLabel("Vendre")
                    .setStyle("PRIMARY")
                          
            );
            rowInventaire = new discord.MessageActionRow().addComponents(
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
                    .setStyle("SUCCESS"),
                new discord.MessageButton()
                    .setCustomId(`sellobjet-${interaction.user.id}-${invActu}`)
                    .setLabel("Vendre")
                    .setStyle("PRIMARY")
                          
            );
            msgInv.edit({embeds: [embedsinv[2]], components: [rowInventaire]})
        }
        if (bouton.customId === 'speciaux') {
            invActu = 3
            rowInventaire = new discord.MessageActionRow().addComponents(
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
                    .setStyle("SUCCESS"),
                new discord.MessageButton()
                    .setCustomId(`sellobjet-${interaction.user.id}-${invActu}`)
                    .setLabel("Vendre")
                    .setStyle("PRIMARY")
                          
            );
            msgInv.edit({embeds: [embedsinv[3]], components: [rowInventaire]})
        }
        if (bouton.customId === 'sellobjet') {
            bouton.message.delete()
            let inventaire = fx.query(`SELECT O.nom, O.emoji, O.description, O.id, U.balance FROM inventaire I JOIN utilisateur U ON U.discordid = I.utilisateur JOIN objet O ON O.id = I.objet WHERE S.utilisateur = '${interaction.user.id}' AND O.type = '${fx.idObjets[invActu]}' AND quantite > 0`)
            const menuInv = new discord.MessageSelectMenu()
                .setCustomId("menusell")
                .setPlaceholder("Choisissez un objet à vendre")
                if(!inventaire.length) {
                    collector.stop()   
                    return interaction.channel.send({embeds: [fx.emb(interaction.user, "Erreur", "Vous ne possédez aucun objet de cette catégorie, veuillez essayez la commande avec une autre", "RED")]})
                }
                    for(i = 0; i < inventaire.length; i++) {
                    menuInv.addOptions({ label: inventaire[i].nom.toString(), value: inventaire[i].id.toString(), description: `${inventaire[i].description} - ${inventaire[i]['prix_vente']}$`});
                }
                menuInv.addOptions({ label: "Annuler", value: "stop", description: "Revenir en arrière" });
                let oui = await interaction.channel.send({content: "** **", components: [{type: 1,components: [menuInv]}]})
                let reponse = await oui.awaitMessageComponent({ filter, componentType: 'SELECT_MENU' })
                oui.delete()
                if(reponse.values[0] == "stop") {
                    msgInv = await interaction.channel.send({embeds: [embedsinv[0]], components: [rowInventaire]})
                } else {
                    collector.stop()
                    objet = reponse.values[0]
                    let itemDb = fx.query(`SELECT quantite, nom, prix_vente FROM inventaire I JOIN objet O ON O.id = I.objet WHERE utilisateur = '${interaction.user.id}' AND objet = '${objet}'`)[0]
                    let embz = fx.emb(interaction.user, "Quantité", `Combien de ${itemDb.nom} voulez vous vendre à ${itemDb.prix_vente}${fx.emojis.argent} ?\n\nVous en possédez **${itemDb.quantite}**`)
                    interaction.channel.send({embeds: [embz.setFooter({text: 'Ecrivez la quantité désirée'})]})
                    let collectorQte = await interaction.channel.awaitMessages({filter: msg_filter, max:1})
                    let prixtotal = parseInt(collectorQte.first().content) * itemDb.prix_vente

                    const rowBuy = new discord.MessageActionRow().addComponents(
                        new discord.MessageButton()
                            .setCustomId(`selloui`)
                            .setLabel("Oui")
                            .setStyle("SUCCESS"),
                        new discord.MessageButton()
                            .setCustomId(`sellnon`)
                            .setLabel("Non")
                            .setStyle("DANGER")
                    )
                    if(parseInt(collectorQte.first().content) > itemDb.quantite) return interaction.channel.send({embeds: [fx.emb(interaction.user, "Erreur", `Vous ne possédez pas assez de ${itemDb.nom}`, "RED")]})
                    let msg = await interaction.channel.send({embeds: [fx.emb(interaction.user, "Confirmation", `Voulez-vous bien vendre ${collectorQte.first().content} ${itemDb.nom} pour ${prixtotal}${fx.emojis.argent} ?`, "WHITE")], components: [rowBuy]})
                    let rep = await msg.awaitMessageComponent({ filter, componentType: 'BUTTON' })
                    if(rep.customId == "selloui") {
                        fx.query(`UPDATE utilisateur U JOIN inventaire I ON U.id = I.utilisateur SET balance = balance + ${prixtotal}, quantite = quantite - ${collectorQte.first().content} WHERE I.id = ${objet}`)
                        msg.embeds[0].setColor("GREEN")
                        msg.edit({embeds: [msg.embeds[0].setDescription(`Vente terminé avec succès\n\nVous êtes désormais à **${inventaire[0].balance - prixtotal}**${fx.emojis.argent}`)]})
                    } else {
                        msg.embeds[0].setColor("ORANGE")
                        msg.edit({embeds: [msg.embeds[0].setDescription("Vente annulé")]})
                    }
                }


        }


    })
}

exports.help = {
    shown: true,
    name: "sell",
    description: "Vendre un objet",
    args: "Aucun",
    cooldown: "Aucun",
    category: "Magasin"
}