const fx = require("../fonctions/fonctions")

exports.run = async (client, interaction) => {
    interaction.reply({content: "Commande en cours", ephemeral: true});


    let chan = interaction.options._hoistedOptions[0].channel
    if(chan.id == interaction.channel.id) return fx.tempsMessage(interaction.channel, "Vous ne pouvez pas lier un channel avec lui-même", 3000)
    let exist = fx.query(`SELECT * FROM connexion WHERE lieu1 = '${interaction.channel.id}' AND lieu2 = '${chan.id}'`)
    if(exist.length) return fx.tempsMessage(interaction.channel, "Ces deux channels sont déjà liés", 3000)

    // dans les 2 sens | mettre un paramètre pour un seul sens (passages secrets)
    fx.query(`INSERT INTO connexion(lieu1, lieu2) VALUES('${interaction.channel.id}', '${chan.id}')`)
    fx.query(`INSERT INTO connexion(lieu2, lieu1) VALUES('${interaction.channel.id}', '${chan.id}')`)
    fx.tempsMessage(interaction.channel, "Good", 3000)

}

exports.help = {
    shown: false,
    name: "lier",
    description: "Relier deux lieux entre eux",
    args: "<lieu>",
    cooldown: "Aucun",
    category: "Déplacement Admin"
}