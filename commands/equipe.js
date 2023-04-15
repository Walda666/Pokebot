const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const discord = require('discord.js');

exports.run = async (client, interaction) => {
    interaction.reply({content: "Commande en cours", ephemeral: true});
/*
    rien : affiche embed avec les 6 stats trs basique
    voir <position> : affiche le poke en détails
    ordre
    ----
    pc :
    same rien voir + add (equipe to pc) et remove 
*/

let type = null; position = null
interaction.options._hoistedOptions.forEach(elt => {
    if(elt.name == "action") type = elt.value
    if(elt.name == "position") position = elt.value
});

console.log(type, position)

// embed all
if(!type) {
    desc = ``
    let equipe = fx.query(`SELECT S.*, P.nom FROM spawn S JOIN pokemon P ON P.id = S.pokemon WHERE S.utilisateur = '${interaction.user.id}' AND equipe = '1' ORDER BY S.position ASC`)
    equipe.forEach(poke => {
        // surnom nom sexe level pv
        let nom = poke.surnom ? poke.surnom : poke.nom
        let emoji = poke.sexe ? fx.emojis.masculin : fx.emojis.feminin
        let pvmax = fx.getStats(poke.pokemon, poke.niveau, poke.nature).pvmax
        desc += `${poke.position} **·** ${nom} | Nv.${poke.niveau} ${emoji} | PV: ${poke.pv}/${pvmax} ${fx.getVieReduite(poke.pv, pvmax)}\n\n`
    });
    if(equipe.length == 0) desc = "Vous n'avez aucun pokémon dans l'équipe, bizarre"

    let embed = new discord.MessageEmbed()
    .setTitle(`Equipe de ${interaction.user.username}`)
    .setDescription(desc)
    .setColor("DARK_GREEN")
    .setFooter({text: "/equipe <voir|ordre> pour d'autres options"})
    
    interaction.channel.send({content: '** **', embeds: [embed]})
} else {
    if(!position) return interaction.channel.send({content: "Veuillez ajouter la position du pokémon voulu en argument", ephemeral: true})
    // voir
    if(type == "voir") {
        let idpoke = fx.query(`SELECT * FROM spawn WHERE equipe = '1' AND utilisateur = '${interaction.user.id}' AND position = '${position}'`)
        if(!idpoke.length) return interaction.channel.send({content: "Le pokémon n'a pas été trouvé", ephemeral: true})

        let tabEmbeds = fx.afficheInfosPokemon(idpoke[0].id, interaction)
        let msg = await interaction.channel.send(tabEmbeds[0])
        fx.pagin(interaction, tabEmbeds, msg)

    // set ordre
    } else {
        let pokes = fx.query(`SELECT S.id, nom, surnom, position FROM spawn S JOIN pokemon P ON P.id = S.pokemon WHERE equipe = '1' AND utilisateur = '${interaction.user.id}' ORDER BY position ASC`)
        desc = ""
        nomChoisi = null
        dispos = []
        disposId = []
        idbase = 0

        pokes.forEach(poke => {
            //console.log(poke.position)
            if(poke.position == position) {
                nomChoisi = poke.surnom ? poke.surnom : poke.nom
                idbase = poke.id
            } 
            else {
                desc += `${poke.position} **·** ${nomm = poke.surnom ? poke.surnom : poke.nom}\n`
                dispos.push(poke.position)
                disposId.push(poke.id)
            }
        });
        if(!nomChoisi) return interaction.channel.send({content: "Veuillez mettre une position valide", ephemeral: true})
        let embz = fx.emb(interaction.user, "Choix ordre", `Avec quel pokémon veux tu échanger ${nomChoisi} ?\n\n${desc}`, "WHITE")
        let mes = await interaction.channel.send({embeds: [embz.setFooter({text: "Ecrivez la position à laquelle mettre ce pokémon"})]})

        const msg_filter = m => m.author.id === interaction.user.id && dispos.includes(parseInt(m.content));
        let collector = await interaction.channel.awaitMessages({filter: msg_filter, max:1})
        let change = collector.first().content
        let ind = dispos.indexOf(parseInt(change))
        let idChange = disposId[ind]
        console.log(idChange, idbase)
        fx.query(`UPDATE spawn SET position = '${change}' WHERE id = '${idbase}'`)
        fx.query(`UPDATE spawn SET position = '${position}' WHERE id = ${idChange}`)
        let newEmb = fx.emb(interaction.user, 'Confirmé', `${nomChoisi} est désormais à la position **${change}** !`)
        mes.edit({embeds: [newEmb.setColor("GREEN")]})
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