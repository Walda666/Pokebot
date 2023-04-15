const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const discord = require('discord.js');

exports.run = async (client, interaction) => {

    let result = fx.query(`SELECT centre FROM lieux WHERE channel = '${interaction.channel.id}'`)
    if(!result[0].centre) return interaction.reply({ embeds: [fx.emb(interaction.user, "ERREUR", "Vous devez être dans un centre Pokémon pour cela.", "RED")] })
    //interaction.reply({content: "Commande en cours", ephemeral: true});
    
    let emb = new discord.MessageEmbed()
    .setTitle("Soin")
    .setDescription("Un instant s'il vous plaît, vos pokémons se font soigner.")
    .setColor("LUMINOUS_VIVID_PINK")
    .setImage("https://www.pokebip.com/pages/general/images/centre-pokemon-rse-int.png")
    let msg = await interaction.reply({embeds: [emb]})  
    // Alléger si ça fait trop attendre
    await fx.sleep(2000)
    interaction.editReply({embeds: [emb.setDescription(emb.description + ".....")]})
    await fx.sleep(2000)
    interaction.editReply({embeds: [emb.setDescription(emb.description + ".....")]})
    await fx.sleep(2000)
    interaction.editReply({embeds: [emb.setDescription(emb.description + ".....")]})
    await fx.sleep(2000)
    interaction.editReply({embeds: [emb.setDescription("Merci d'avoir attendu !\n\nVos pokémons sont en super forme")]})
    
    let equipe = fx.query(`SELECT * FROM spawn WHERE utilisateur = '${interaction.user.id}' AND equipe = 1`)
    equipe.forEach(poke => {
        let stats = fx.getStats(poke.pokemon, poke.niveau, poke.nature)
        fx.query(`UPDATE spawn SET pv = '${stats.pvmax}', statut = '0', tempsstatut = '0' WHERE id = '${poke.id}'`)
    });
    fx.query(`UPDATE attaquepokemontam AP JOIN attaque A ON A.id = AP.attaque JOIN spawn S ON S.id = AP.pokemon SET AP.pp = A.pp WHERE S.utilisateur = '${interaction.user.id}' AND S.equipe = '1'`)


}

exports.help = {
    shown: true,
    name: "soigner",
    description: "Faire soigner ses Pokémons dans un centre",
    args: "Aucun",
    cooldown: "Aucun",
    category: "Pokémon"
}