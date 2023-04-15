const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const {MessageActionRow, MessageButton, MessageSelectMenu} = require('discord.js');

exports.run = async (client, interaction) => {

    let result = fx.query(`SELECT centre FROM lieux WHERE channel = '${interaction.channel.id}'`)
    if(!result[0].centre) return interaction.reply({ embeds: [fx.emb(interaction.user, "ERREUR", "Vous devez être dans un centre Pokémon pour cela.", "RED")] })
    await interaction.reply({content: "Commande en cours", ephemeral: true});

    let type = null; position = null
    interaction.options._hoistedOptions.forEach(elt => {
        if(elt.name == "action") type = elt.value
        if(elt.name == "position") position = elt.value
    });

    console.log(type, position)

    // embed all
    if(!type) {
        let pc = fx.query(`SELECT S.*, P.nom FROM spawn S JOIN pokemon P ON P.id = S.pokemon WHERE S.utilisateur = '${interaction.user.id}' AND equipe = '0' ORDER BY S.position ASC`)
        let div = Math.floor(pc.length / 10)
        let modulo = pc.length%10
        let tabFinal = []
        // tout /10
        for(i = 0; i < div; i++) {
            desc = ""
            for(j = 0 + (10*i); j < 10 + (10*i); j++)  {
                let poke = pc[j]
                let nom = poke.surnom ? poke.surnom : poke.nom
                let emoji = poke.sexe ? fx.emojis.masculin : fx.emojis.feminin
                desc += `${poke.position} **·** ${nom} | Nv.${poke.niveau} ${emoji} | PV: ${poke.pv}\n`
            }
            tabFinal.push({embeds: [fx.emb(interaction.user, `PC - Boîte ${i+1}`, desc, "DARK_GREEN").setFooter({text: "/pc <voir|deposer|retirer> pour d'autres options"})]})
        }

        // dernier embed
        desc = ""
        for(j = div*10; j < pc.length; j++) {
            let poke = pc[j]
                let nom = poke.surnom ? poke.surnom : poke.nom
                let emoji = poke.sexe ? fx.emojis.masculin : fx.emojis.feminin
                desc += `${poke.position} **·** ${nom} | Nv.${poke.niveau} ${emoji} | PV: ${poke.pv}\n`
        }
        tabFinal.push({embeds: [fx.emb(interaction.user, `PC - Boîte ${div+1}`, desc, "DARK_GREEN").setFooter({text: "/pc <voir|deposer|retirer> pour d'autres options"})]})

        let msg = await interaction.channel.send(tabFinal[0])
        fx.pagin(interaction, tabFinal, msg)
    } else {
        if(!position) {
            if(type != "deposer") return interaction.editReply({content: ` ${interaction.user} Veuillez ajouter la position du pokémon voulu en argument`, ephemeral: true})
            // ajouter
            let resultEquipe = fx.query( `SELECT S.position, S.surnom, P.nom AS nomPoke, S.niveau, S.nature, S.pv, S.id FROM spawn S JOIN pokemon P ON S.pokemon = P.id WHERE S.utilisateur = '${interaction.user.id}' AND S.equipe = 1 ORDER BY S.position ASC`)
            const menu = new MessageSelectMenu()
                .setCustomId("ooooooooo")
                .setPlaceholder("Choisissez un Pokemon à déposer dans le PC")
                for(i = 0; i < resultEquipe.length; i++) {
                    let nom = resultEquipe[i].nomPoke
                    if(resultEquipe[i].surnom) nom = resultEquipe[i].surnom
                    menu.addOptions({ label: nom.toString(), value: i.toString(), description: resultEquipe[i].nomPoke });
                } 
                menu.addOptions({ label: "Annuler", value: "stop", description: "Revenir en arrière" });

                let msg = await interaction.channel.send({content: "** **",components: [{type: 1,components: [menu]}]})
                const filter = (i) => i.user.id == interaction.user.id
                let reponse = await msg.awaitMessageComponent({ filter, componentType: 'SELECT_MENU' })
                let val = reponse.values[0]
                msg.delete()
                if(val == "stop") {
                    interaction.channel.send({embeds: [fx.emb(interaction.user, "Annulé", "Vous avez annulé l'action", "RED")]})
                } else {
                    // update poke + update les autres + embed
                    let posPcquery = fx.query(`SELECT position FROM spawn WHERE equipe = '0' AND utilisateur = '${interaction.user.id}' ORDER BY position DESC`)
                    let posPc = posPcquery.length ? parseInt(posPcquery[0].position) +1 : 1
                    fx.query(`UPDATE spawn SET equipe = '0', position = '${posPc}' WHERE id = '${resultEquipe[val].id}'`)
                    for(i = parseInt(val)+1; i < resultEquipe.length; i++) {
                        console.log(i)
                        fx.query(`UPDATE spawn SET position = position - 1 WHERE id = '${resultEquipe[i].id}'`)
                        }
                    interaction.channel.send(({embeds: [fx.emb(interaction.user, "Confirmé", `Vous avez envoyé ${resultEquipe[val].nomPoke} dans le Pc`, "GREEN")]}))
                //console.log(resultEquipe[val])
                }
        } else {
            let idpoke = fx.query(`SELECT S.*, P.nom FROM spawn S JOIN pokemon P ON P.id = S.pokemon WHERE equipe = '0' AND utilisateur = '${interaction.user.id}' AND position = '${position}'`)
            if(!idpoke.length) return interaction.editReply({content: `${interaction.user} Le pokémon n'a pas été trouvé`, ephemeral: true})
            // voir
            if(type == "voir") {
                let tabEmbeds = fx.afficheInfosPokemon(idpoke[0].id, interaction)
                let msg = await interaction.channel.send(tabEmbeds[0])
                fx.pagin(interaction, tabEmbeds, msg)
            } else {

            // retirer
            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId(`pcequipe`)
                    .setLabel("Ajouter à l'équipe")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setCustomId(`pcrelacher`)
                    .setLabel("Relâcher dans la nature")
                    .setStyle("DANGER"),
                new MessageButton()
                    .setCustomId(`pcannuler`)
                    .setLabel("Annuler")
                    .setStyle("SECONDARY")
            )

            let nom = idpoke[0].surnom ? idpoke[0].surnom : idpoke[0].nom
            let emb = fx.emb(interaction.user, "Choix", `Que voulez-vous faire avec ${nom} ?`, "WHITE")
            let msg = await interaction.channel.send({embeds: [emb], components: [row]})

            const filter = (i) => i.user.id == interaction.user.id
            let reponse = await msg.awaitMessageComponent({ filter, componentType: 'BUTTON' })
            for(i = 0; i < row.components.length; i++) row.components[i].setDisabled(true)
            
            if(reponse.customId == "pcequipe") {
                let equipe = fx.query(`SELECT * FROM spawn WHERE equipe = '1' AND utilisateur = '${interaction.user.id}'`)
                if(equipe.length >= 6) {
                    emb.setColor("RED")
                    msg.edit(msg.edit({embeds: [emb.setDescription(` Votre équipe est déjà complète`)], components: [row]}))
                } else {
                    fx.query(`UPDATE spawn SET equipe = '1', position = '${equipe.length + 1}' WHERE id = '${idpoke[0].id}'`)
                    emb.setColor("GREEN")
                    msg.edit(msg.edit({embeds: [emb.setDescription(`Vous avez envoyé ${nom} dans l'équipe `)], components: [row]}))
                }
            }

            if(reponse.customId == "pcrelacher") {
                const rowChoice = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId(`osef-oui`)
                        .setLabel("Oui")
                        .setStyle("SUCCESS"),
                    new MessageButton()
                        .setCustomId(`osef-non`)
                        .setLabel("Non")
                        .setStyle("DANGER")
                )
                let msgChoice = await interaction.channel.send({embeds: [fx.emb(interaction.user, "Confirmation", `Voulez-vous vraiment relâcher ${nom} ?\n\nVous le perdrez définitivement`, "ORANGE")], components: [rowChoice]})
                let reponseChoice = await msgChoice.awaitMessageComponent({ filter, componentType: 'BUTTON' })
                msgChoice.delete()
                if(reponseChoice.customId == "osef-oui") {
                    //fx.query(`DELETE FROM spawn WHERE id = '${idpoke[0].id}'`)
                    msg.edit({embeds: [emb.setDescription(`Vous avez relâché ${nom} dans la  nature !`)], components: [row]})
                } else {
                    emb.setColor("RED")
                    msg.edit(msg.edit({embeds: [emb.setDescription("Vous avez annulé l'action")], components: [row]}))
                }

            }

            if(reponse.customId == "pcannuler") {
                emb.setColor("RED")
                msg.edit(msg.edit({embeds: [emb.setDescription("Vous avez annulé l'action")], components: [row]}))
            }


            }
        }
    }

}

exports.help = {
    shown: true,
    name: "aller",
    description: "Se déplacer entre les lieux",
    args: "<>",
    cooldown: "Aucun",
    category: "Pokémons"
}