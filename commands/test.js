const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const discord = require('discord.js');

exports.run = async (client, interaction) => {
/*
    let row = new MessageActionRow()
    .addComponents(
        but_1 = new MessageButton()
            .setCustomId('id_1')
            .setLabel('Button 1')
            .setStyle('SECONDARY'),
        but_2 = new MessageButton()
            .setCustomId('id_2')
            .setLabel('Button 2')
            .setStyle('SECONDARY')
    );

    const filter = () => true
interaction.reply({ content: "Click a button", components: [row] })

const collector = interaction.channel.createMessageComponentCollector({ filter});

collector.on('collect', async i => {
    if (i.customId === 'id_1') {
        row.components[0].setDisabled(true)
        //i.message.delete()
        interaction.editReply({ content: "Click a button", components: [row] });
    }
});
}*/
/*
let tab = fx.efficaciteTypes
desc = ""
for (const [key, value] of Object.entries(tab)) {
    for (const [key2, value2] of Object.entries(value)) {
        if(value2 == 0) desc += `⬛ `
        if(value2 == 0.5) desc += `🟥 `
        if(value2 == 1) desc += `🔲 `
        if(value2 == 2) desc += `🟩 `
    
    //console.log(value2)
    }
    desc += "\n\n"
}

let embed = fx.emb(interaction.user, "aa", desc, "WHITE")
interaction.reply({embeds: [embed]})
}


const rowInventaire = new MessageActionRow().addComponents(
    new MessageButton()
        .setCustomId(`potions`)
        .setLabel("Potions")
        .setStyle("SUCCESS"),
    new MessageButton()
        .setCustomId(`balls`)
        .setLabel("Balls")
        .setStyle("SUCCESS"),
    new MessageButton()
        .setCustomId(`baies`)
        .setLabel("Baies")
        .setStyle("SUCCESS"),
    new MessageButton()
        .setCustomId(`speciaux`)
        .setLabel("Spéciaux")
        .setStyle("SUCCESS"),
    new MessageButton()
        .setCustomId(`useobjcombat`)
        .setLabel("Utiliser")
        .setStyle("PRIMARY")
              
);
const filter = () => true

const menu = new MessageSelectMenu()
.setCustomId("change-poke-ko")
.setPlaceholder("Choisissez un Pokemon à envoyer au combat")
menu.addOptions({ label: "nom".toString(), value: "resultEquipe[i].positio".toString(), description: "resultEquipe[i]".nomPoke });
                    let oui = await interaction.channel.send({content: "** **",components: [{type: 1,components: [menu]}]})

    let test = await oui.awaitMessageComponent({ filter, componentType: 'SELECT_MENU' })
	console.log(test.values)
    console.log("uvbiuvb")
*/

/* simule attaque 
let msg = await interaction.channel.send("slt")
let attaques = fx.query(`SELECT AP.attaque, A.pp, A.nom FROM attaquepokemon AP JOIN attaque A ON A.id = AP.attaque WHERE pokemon = '1' AND niveau > '8' AND niveau <= '10'`)
let pokela = fx.query(`SELECT S.id, P.nom, S.pokemon, S.surnom, S.niveau, S.xp, S.nature, S.shiny, S.image, S.pv FROM spawn S JOIN pokemon P ON P.id = S.pokemon WHERE S.id = '11'`)[0]
fxcombat.gagneAttaque(pokela, attaques, msg)

const filter = () => true

let collector = await interaction.channel.awaitMessages({filter: filter, max:1})
console.log(collector.first().content)
console.log("oo")
}
*/


}
exports.help = {
    shown: true,
    name: "spawn",
    description: "Fait apparaître un Pokemon",
    args: "Aucun",
    cooldown: "Aucun",
    category: "/"
}