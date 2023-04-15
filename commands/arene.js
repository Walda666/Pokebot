const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const {MessageActionRow, MessageButton, MessageSelectMenu, MessageEmbed} = require('discord.js');

exports.run = async (client, interaction) => {

    await interaction.reply({content: "Commande en cours", ephemeral: true})
    let infosarene = fx.query(`SELECT * FROM arene A JOIN lieux L ON L.channel = A.lieu LEFT JOIN completionarene CA ON A.id = CA.arene WHERE lieu = '${interaction.channel.id}'`)
    if(!infosarene.length) return interaction.editReply("Il n'y a pas d'arène ici")

    const row = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId(`dresseurs`)
            .setLabel("Liste des dresseurs")
            .setStyle("PRIMARY"),
        new MessageButton()
            .setCustomId(`combattre`)
            .setLabel("Combattre")
            .setStyle("PRIMARY")
    )
    
    let battus = infosarene[0].battus ? infosarene[0].battus : 0
    let embed = fx.emb(interaction.user, `Arène ~ ${interaction.user.username}`, `Arène ${infosarene[0].nom}\n\n${battus}/${infosarene[0].nbdresseurs} dresseurs battus\n\nMaitre d'arène : ${infosarene[0].maitre}\n\nType ${infosarene[0].type} ~ Badge ${infosarene[0].badge}`, "WHITE")
    let msg = await interaction.channel.send({embeds: [embed.setFooter({text: "Choisissez votre action à l'aide des boutons"})], components: [row]})
    const filter = (i) => i.user.id == interaction.user.id
    const collector = msg.createMessageComponentCollector({ filter : filter });
    collector.on('collect', async bouton => {
        if(bouton.customId == "dresseurs") {
            let hasDresseurs = fx.query(`SELECT * FROM pnj WHERE lieu = '${interaction.channel.id}'`)
            let dresseurs = fx.query(`SELECT P.id, nom, image, argent, P.cooldown AS cdmax, Pu.cooldown AS cd FROM pnjutilisateur PU RIGHT JOIN pnj P ON P.id = PU.pnj WHERE lieu = '${interaction.channel.id}' AND utilisateur = '${interaction.user.id}'`)

            let idpnjs = []
        let desc = ''

        dresseurs.forEach(dres => {
             desc += `${dres.nom} | ✅\n`
             idpnjs.push(dres.id)
        });

        hasDresseurs.forEach(dres => {
            if(!idpnjs.includes(dres.id)) {
                desc += `${dres.nom} | ❌\n`
            }
        });

        msg.edit({embeds: [msg.embeds[0].setDescription(desc)]})

        }

        if(bouton.customId == "dresseurs") {
            collector.stop()
        }

    })



        // bouton dresseurs
        
        
    

}

exports.help = {
    shown: true,
    name: "arene",
    description: "Interragit avec l'arène du lieu",
    args: "<>",
    cooldown: "Aucun",
    category: "Pokémons"
}