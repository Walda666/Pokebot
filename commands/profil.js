const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const discord = require('discord.js');

exports.run = async (client, interaction) => {

    
    let result = fx.query(`SELECT U.*, COUNT(DISTINCT pokemon) AS pokedex FROM utilisateur U JOIN spawn S ON U.discordid = S.utilisateur WHERE discordid = '${interaction.user.id}'`)
    if(!result.length) return interaction.reply({content: `${interaction.user} Vous n'avez pas commencé la partie. Faites d'abord /start`, ephemeral: true})
    let image = result[0].image ? result[0].image : "https://static.wikia.nocookie.net/pokemon/images/f/f7/3217994743_1_2_H9U9q4O1.gif/revision/latest/top-crop/width/360/height/450?cb=20201107121312&path-prefix=fr"
    
    let nbtotalpokes = fx.query(`SELECT COUNT(*) AS count FROM pokemon`)[0].count
    let mainPokequery = fx.query(`SELECT P.nom FROM pokemon P JOIN spawn S ON P.id = S.pokemon WHERE S.position = 1 AND S.utilisateur = '${interaction.user.id}'`)
    let mainPoke = mainPokequery.length ? mainPokequery[0].nom : "Aucun"
    let desc = `Coins: ${result[0].balance}${fx.emojis["argent"]}\n\nPokémon principal : ${mainPoke}\n\nAvancement du Pokédex: ${result[0].pokedex}/${nbtotalpokes} (${(result[0].pokedex/nbtotalpokes *100).toString().substring(0,5)}%)\n\nBadges: XXXX`

    let emb = fx.emb(interaction.user, `Profil - ${result[0].pseudo}`, desc, "WHITE").setImage(image)
    interaction.reply({embeds: [emb]})



}
exports.help = {
    shown: true,
    name: "profil",
    description: "Affiche le profil joueur",
    args: "Aucun",
    cooldown: "Aucun",
    category: "/"
}