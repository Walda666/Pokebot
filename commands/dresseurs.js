const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const {MessageActionRow, MessageButton, MessageSelectMenu, MessageEmbed} = require('discord.js');

exports.run = async (client, interaction) => {

    await interaction.reply({content: "Commande en cours", ephemeral: true});

    let type = null; dresseur = null
    interaction.options._hoistedOptions.forEach(elt => {
        if(elt.name == "action") type = elt.value
        if(elt.name == "dresseur") dresseur = elt.value
    });

    if(!type) {
        let hasDresseurs = fx.query(`SELECT * FROM pnj WHERE lieu = '${interaction.channel.id}'`)
        if(!hasDresseurs.length) return interaction.editReply("Il n'y a aucun dresseurs ici")
        let dresseurs = fx.query(`SELECT P.id, nom, image, argent, P.cooldown AS cdmax, Pu.cooldown AS cd FROM pnjutilisateur PU RIGHT JOIN pnj P ON P.id = PU.pnj WHERE lieu = '${interaction.channel.id}' AND utilisateur = '${interaction.user.id}'`)
        console.log(dresseurs, hasDresseurs)

        let idpnjs = []
        let desc = ''

        dresseurs.forEach(dres => {
            let date = new Date().getTime()
            let fincd = parseInt(dres.cd) + parseInt(dres.cdmax)
            let temps = ''
            if(date > fincd) temps = "maintenant"
            else {
                let restant = (fincd-date)/3600000
                let jours = Math.floor(restant/24)
                let heuresrest = restant - (jours*24)
                let heures = Math.floor(heuresrest)
                let minutes = Math.floor((heuresrest - heures) * 60)
                let affJ = jours > 0 ? `${jours}j ` : ""
                let affH = heures >= 10 ? `${heures}h` : `0${heures}h`
                let affM = minutes >= 10 ? `${minutes}mn` : `0${minutes}mn`
                temps = `${affJ}${affH}${affM}`
            }
             desc += `${dres.nom} : Combattable ${temps} | Récompense : ${dres.argent}${fx.emojis.argent}\n\n`
             idpnjs.push(dres.id)
        });

        hasDresseurs.forEach(dres => {
            if(!idpnjs.includes(dres.id)) {
                desc += `${dres.nom} : Combattable maintenant | Récompense : ${dres.argent}${fx.emojis.argent}\n\n`
            }
        });

        // ptet mettre le lieu en image
        let embed = new MessageEmbed()
        .setTitle(`Dresseurs ~ ${interaction.user.username}`)
        .setDescription(desc)
        .setColor("WHITE")
        interaction.channel.send({embeds: [embed]})
    }

}

exports.help = {
    shown: true,
    name: "dresseurs",
    description: "Ne pas mettre pour avoir la liste des dresseurslieux",
    args: "<>",
    cooldown: "Aucun",
    category: "Pokémons"
}