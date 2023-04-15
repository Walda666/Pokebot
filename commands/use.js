const fx = require("../fonctions/fonctions")
const { MessageEmbed, MessageSelectMenu } = require('discord.js');
const mysql = require('mysql');

exports.run = async (client, interaction) => {
    const levelStops = 100;

    const connection = mysql.createConnection({
        host: process.env.dbHost,
        user: process.env.dbUser,
        password: process.env.dbPassword,
        database: process.env.dbDatabase
    });

    const object = interaction.options._hoistedOptions[0].value;

    let inventory = fx.query(`SELECT ${object} FROM players WHERE discordid ='${interaction.user.id}'`)
        if (inventory[0][object] === 0) {
            const noItem = new MessageEmbed()
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setTitle("Erreur")
                .setDescription("Vous devez tout d'abord acheter cet objet.")
                .setColor("RED")

            return interaction.reply({ embeds: [noItem] });
        }

        if (object.startsWith("xp_bottle_")) {
            if (!interaction.options._hoistedOptions[1]) {
                const noScout = new MessageEmbed()
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTitle("Erreur")
                    .setDescription("Veuillez préciser la carte devant recevoir l'XP.")
                    .setColor("RED")

                return interaction.reply({ embeds: [noScout] });
            }

            const scout = interaction.options._hoistedOptions[1].value;

            const bottles = [
                {
                    "type": "1",
                    "xp": 100
                },
                {
                    "type": "2",
                    "xp": 500
                },
                {
                    "type": "3",
                    "xp": 1000
                }
            ];

            const type = object.replace("xp_bottle_", '');

            const xp = bottles.filter(item => item.type === type)[0].xp;

            connection.query(`SELECT * FROM scouts WHERE joueur =${interaction.user.id} AND scout=${scout};`, (error, results, fields) => {
                if (!results || !results[0]) {
                    const unknownScout = new MessageEmbed()
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle("Vous ne possédez pas cette carte.")
                        .setColor("RED")

                    interaction.reply({ embeds: [unknownScout] });
                } else {
                    connection.query(`UPDATE scouts SET xp=${results[0].xp + xp} WHERE joueur =${interaction.user.id} AND scout=${scout};`);
                    connection.query(`UPDATE scouts SET level=${parseInt((results[0].xp + xp) / levelStops) + 1} WHERE joueur =${interaction.user.id} AND scout=${scout};`);

                    const xpAdded = new MessageEmbed()
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle(`XP ajouté avec succès.`)
                        .setColor("WHITE")

                    interaction.reply({ embeds: [xpAdded] });

                    connection.query(`UPDATE players SET ${object}=${inventory[0][object] - 1} WHERE discordid ='${interaction.user.id}';`);
                }
            });
        } else if (object === "star") {
            if (!interaction.options._hoistedOptions[1]) {
                const noScout = new MessageEmbed()
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTitle("Erreur")
                    .setDescription("Veuillez préciser la carte dont le niveau doit être augmenté.")
                    .setColor("RED")

                return interaction.reply({ embeds: [noScout] });
            }

            const scout = interaction.options._hoistedOptions[1].value;

            connection.query(`SELECT * FROM scouts WHERE joueur =${interaction.user.id} AND scout=${scout};`, (error, results, fields) => {
                if (!results || !results[0]) {
                    const unknownScout = new MessageEmbed()
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle("Vous ne possédez pas cette carte.")
                        .setColor("RED")

                    interaction.reply({ embeds: [unknownScout] });
                } else {
                    connection.query(`UPDATE scouts SET level=${results[0].level + 1} WHERE joueur =${interaction.user.id} AND scout=${scout};`);
                    connection.query(`UPDATE scouts SET xp=${results[0].xp + levelStops} WHERE joueur =${interaction.user.id} AND scout=${scout};`);

                    const levelAdded = new MessageEmbed()
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle(`Niveau ajouté avec succès.`)
                        .setColor("WHITE")

                    interaction.reply({ embeds: [levelAdded] });

                    connection.query(`UPDATE players SET ${object}=${inventory[0][object] - 1} WHERE discordid ='${interaction.user.id}';`);
                }
            });
        } else if (object.startsWith("invoc_")) {
            // Si invocation trop grande/longue : l'interraction ne tient pas donc on met ça => 
            // let msgSend = await interaction.channel.send({embeds: [fx.emb(interaction.user, "En cours de chargement")]})

            fx.invocation(interaction, parseInt(object.substring(object.length - 1)) -1, 1)
        }

        else if (object === "selection_stone") {
            connection.query(`UPDATE players SET ${object}=${inventory[0][object] - 1} WHERE discordid ='${interaction.user.id}';`);

            connection.query(`SELECT * FROM scouts_reference WHERE selection=1;`, (error, scouts, fields) => {
                const menu = new MessageSelectMenu()
                    .setCustomId("selection")

                scouts.forEach(scout => {
                    menu.addOptions({ label: scout.name, value: scout["ID"].toString(), description: `Carte ${scout["ID"]}` });
                });

                interaction.reply("Choisissez la carte que vous souhaitez obtenir");

                interaction.channel.send({
                    content: "** **",
                    components: [
                        {
                            type: 1,
                            components: [menu]
                        }
                    ]
                })
                    .then(reply => {
                        reply.awaitMessageComponent({ filter: (i => i.user.id === interaction.user.id), componentType: "SELECT_MENU" })
                            .then(interaction => {
                                const scout = interaction.values[0];
                                const scoutReference = scouts.filter(scout_reference => scout_reference.ID === parseInt(scout))[0];

                                connection.query(`SELECT * FROM scouts WHERE joueur =${interaction.user.id} AND scout=${scout};`, (error, results, fields) => {
                                    if (!results || !results[0]) {
                                        connection.query(`INSERT INTO scouts (scout, joueur , level, xp) VALUES ('${scoutReference["ID"]}', '${interaction.user.id}', 1, 0);`);

                                        const scoutAdded = new MessageEmbed()
                                            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                                            .setTitle(`Vous avez obtenu la carte **${scoutReference["name"]}** (${scoutReference["ID"]}).`)
                                            .setDescription(`Le personnage vous a été ajouté avec succès.`)
                                            .setColor("WHITE")

                                        return interaction.reply({ embeds: [scoutAdded] });
                                    }

                                    const ownedScout = new MessageEmbed()
                                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                                        .setTitle(`Vous avez obtenu la carte **${scoutReference["name"]}** (${scoutReference["ID"]}).`)
                                        .setDescription(`Vous possédez déjà cette carte. Vous gagnez donc ${scoutReference["rareness"]} étoiles !`)
                                        .setColor("RED")

                                    interaction.reply({ embeds: [ownedScout] });

                                    connection.query(`SELECT star FROM players WHERE discordid ='${interaction.user.id}';`, (error, results, fields) => {
                                        connection.query(`UPDATE players SET star=${scoutReference["rareness"] + results[0]["star"]} WHERE discordid ='${interaction.user.id}';`);
                                    });
                                });
                            });
                    });
            });
        } else if (object === "normal_pity") { 
            connection.query(`UPDATE players SET ${object}=${inventory[0][object] - 1} WHERE discordid ='${interaction.user.id}';`);

            connection.query(`SELECT * FROM scouts_reference WHERE selection=2;`, (error, scouts, fields) => {
                const menu = new MessageSelectMenu()
                    .setCustomId("selection")

                scouts.forEach(scout => {
                    menu.addOptions({ label: scout.name, value: scout["ID"].toString(), description: `Carte ${scout["ID"]}` });
                });

                interaction.reply("Choisissez la carte que vous souhaitez obtenir");

                interaction.channel.send({
                    content: "** **",
                    components: [
                        {
                            type: 1,
                            components: [menu]
                        }
                    ]
                })
                    .then(reply => {
                        reply.awaitMessageComponent({ filter: (i => i.user.id === interaction.user.id), componentType: "SELECT_MENU" })
                            .then(interaction => {
                                const scout = interaction.values[0];
                                const scoutReference = scouts.filter(scout_reference => scout_reference.ID === parseInt(scout))[0];

                                connection.query(`SELECT * FROM scouts WHERE joueur =${interaction.user.id} AND scout=${scout};`, (error, results, fields) => {
                                    if (!results || !results[0]) {
                                        connection.query(`INSERT INTO scouts (scout, joueur , level, xp) VALUES ('${scoutReference["ID"]}', '${interaction.user.id}', 1, 0);`);

                                        const scoutAdded = new MessageEmbed()
                                            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                                            .setTitle(`Vous avez obtenu la carte **${scoutReference["name"]}** (${scoutReference["ID"]}).`)
                                            .setDescription(`Le personnage vous a été ajouté avec succès.`)
                                            .setColor("WHITE")

                                        return interaction.reply({ embeds: [scoutAdded] });
                                    }

                                    const ownedScout = new MessageEmbed()
                                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                                        .setTitle(`Vous avez obtenu la carte **${scoutReference["name"]}** (${scoutReference["ID"]}).`)
                                        .setDescription(`Vous possédez déjà cette carte. Vous gagnez donc ${scoutReference["rareness"]} étoiles !`)
                                        .setColor("RED")

                                    interaction.reply({ embeds: [ownedScout] });

                                    connection.query(`SELECT star FROM players WHERE discordid ='${interaction.user.id}';`, (error, results, fields) => {
                                        connection.query(`UPDATE players SET star=${scoutReference["rareness"] + results[0]["star"]} WHERE discordid ='${interaction.user.id}';`);
                                    });
                                });
                            });
                    });
            });
        } else if (object === "advenced_pity") { 
            connection.query(`UPDATE players SET ${object}=${inventory[0][object] - 1} WHERE discordid ='${interaction.user.id}';`);

            connection.query(`SELECT * FROM scouts_reference WHERE selection=3;`, (error, scouts, fields) => {
                const menu = new MessageSelectMenu()
                    .setCustomId("selection")

                scouts.forEach(scout => {
                    menu.addOptions({ label: scout.name, value: scout["ID"].toString(), description: `Carte ${scout["ID"]}` });
                });

                interaction.reply("Choisissez la carte que vous souhaitez obtenir");

                interaction.channel.send({
                    content: "** **",
                    components: [
                        {
                            type: 1,
                            components: [menu]
                        }
                    ]
                })
                    .then(reply => {
                        reply.awaitMessageComponent({ filter: (i => i.user.id === interaction.user.id), componentType: "SELECT_MENU" })
                            .then(interaction => {
                                const scout = interaction.values[0];
                                const scoutReference = scouts.filter(scout_reference => scout_reference.ID === parseInt(scout))[0];

                                connection.query(`SELECT * FROM scouts WHERE joueur =${interaction.user.id} AND scout=${scout};`, (error, results, fields) => {
                                    if (!results || !results[0]) {
                                        connection.query(`INSERT INTO scouts (scout, joueur , level, xp) VALUES ('${scoutReference["ID"]}', '${interaction.user.id}', 1, 0);`);

                                        const scoutAdded = new MessageEmbed()
                                            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                                            .setTitle(`Vous avez obtenu la carte **${scoutReference["name"]}** (${scoutReference["ID"]}).`)
                                            .setDescription(`Le personnage vous a été ajouté avec succès.`)
                                            .setColor("WHITE")

                                        return interaction.reply({ embeds: [scoutAdded] });
                                    }

                                    const ownedScout = new MessageEmbed()
                                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                                        .setTitle(`Vous avez obtenu la carte **${scoutReference["name"]}** (${scoutReference["ID"]}).`)
                                        .setDescription(`Vous possédez déjà cette carte. Vous gagnez donc ${scoutReference["rareness"]} étoiles !`)
                                        .setColor("RED")

                                    interaction.reply({ embeds: [ownedScout] });

                                    connection.query(`SELECT star FROM players WHERE discordid ='${interaction.user.id}';`, (error, results, fields) => {
                                        connection.query(`UPDATE players SET star=${scoutReference["rareness"] + results[0]["star"]} WHERE discordid ='${interaction.user.id}';`);
                                    });
                                });
                            });
                    });
            });
        } else if (object === "limited_pity") { 
            connection.query(`UPDATE players SET ${object}=${inventory[0][object] - 1} WHERE discordid ='${interaction.user.id}';`);

            connection.query(`SELECT * FROM scouts_reference WHERE selection=4;`, (error, scouts, fields) => {
                const menu = new MessageSelectMenu()
                    .setCustomId("selection")

                scouts.forEach(scout => {
                    menu.addOptions({ label: scout.name, value: scout["ID"].toString(), description: `Carte ${scout["ID"]}` });
                });

                interaction.reply("Choisissez la carte que vous souhaitez obtenir");

                interaction.channel.send({
                    content: "** **",
                    components: [
                        {
                            type: 1,
                            components: [menu]
                        }
                    ]
                })
                    .then(reply => {
                        reply.awaitMessageComponent({ filter: (i => i.user.id === interaction.user.id), componentType: "SELECT_MENU" })
                            .then(interaction => {
                                const scout = interaction.values[0];
                                const scoutReference = scouts.filter(scout_reference => scout_reference.ID === parseInt(scout))[0];

                                connection.query(`SELECT * FROM scouts WHERE joueur =${interaction.user.id} AND scout=${scout};`, (error, results, fields) => {
                                    if (!results || !results[0]) {
                                        connection.query(`INSERT INTO scouts (scout, joueur , level, xp) VALUES ('${scoutReference["ID"]}', '${interaction.user.id}', 1, 0);`);

                                        const scoutAdded = new MessageEmbed()
                                            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                                            .setTitle(`Vous avez obtenu la carte **${scoutReference["name"]}** (${scoutReference["ID"]}).`)
                                            .setDescription(`Le personnage vous a été ajouté avec succès.`)
                                            .setColor("WHITE")

                                        return interaction.reply({ embeds: [scoutAdded] });
                                    }

                                    const ownedScout = new MessageEmbed()
                                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                                        .setTitle(`Vous avez obtenu la carte **${scoutReference["name"]}** (${scoutReference["ID"]}).`)
                                        .setDescription(`Vous possédez déjà cette carte. Vous gagnez donc ${scoutReference["rareness"]} étoiles !`)
                                        .setColor("RED")

                                    interaction.reply({ embeds: [ownedScout] });

                                    connection.query(`SELECT star FROM players WHERE discordid ='${interaction.user.id}';`, (error, results, fields) => {
                                        connection.query(`UPDATE players SET star=${scoutReference["rareness"] + results[0]["star"]} WHERE discordid ='${interaction.user.id}';`);
                                    });
                                });
                            });
                    });
            });
        }
}

exports.help = {
    shown: true,
    name: "use",
    description: "Utiliser un objet",
    args: "<objet> [scout]",
    cooldown: "Aucun",
    category: "Objets"
}