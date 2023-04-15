const fx = require("../fonctions/fonctions")

exports.run = async (client, interaction) => {
    interaction.reply({content: "Commande en cours", ephemeral: true});

    let exist = fx.query(`SELECT * FROM lieux WHERE channel = '${interaction.channel.id}'`)
    if(exist.length) {
        let rep = await interaction.channel.send("déjà log")
        setTimeout(() => {
            rep.delete()
        }, 3000);
    } else {
        fx.query(`INSERT INTO lieux(nom, channel) VALUES('${interaction.channel.name}', '${interaction.channel.id}')`)
        let rep = await interaction.channel.send("good")
        setTimeout(() => {
            rep.delete()
        }, 3000);
    }

}

exports.help = {
    shown: false,
    name: "log",
    description: "Enregistrer un channel",
    args: "Aucun",
    cooldown: "Aucun",
    category: "Déplacement Admin"
}