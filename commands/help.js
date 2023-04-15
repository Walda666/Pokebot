const { MessageEmbed } = require("discord.js");
const fs = require('fs');

const data = JSON.parse(fs.readFileSync("config.json"));

exports.run = (client, interaction) => {
    if (!interaction.options._hoistedOptions[0]) {
        const commands = {};

        const noCommandEmbed = new MessageEmbed()
            .setAuthor({ name: interaction.user.username,  iconURL: interaction.user.displayAvatarURL() })
            .setTitle(`Commandes`)
            .setColor("WHITE")

        const categories = [];

        client.commands.forEach(command => {
            if (!data.admins.includes(interaction.user.id) && !command.help.shown) return;

            categories.push(command.help.category);
        });

        const uniqueCategories = [... new Set(categories)];

        uniqueCategories.forEach(category => {
            commands[category] = [];

            client.commands.forEach(command => {
                if ((!data.admins.includes(interaction.user.id) && !command.help.shown) || command.help.category != category) return;

                commands[category].push(command.help.name);
            });
        });

        for (category in commands) {
            noCommandEmbed.addField(category, commands[category].join(', '));
        }

        interaction.reply({ embeds: [noCommandEmbed] });
    } else {
        const commandName = interaction.options._hoistedOptions[0].value;
        const command = client.commands.get(commandName);

        if (!command) {
            const doesntExist = new MessageEmbed()
                .setTitle("Erreur")
                .setDescription(`Cette commande n'existe pas.`)
                .setColor("RED")

            return interaction.reply({ embeds: [doesntExist] });
        }

        if (!data.admins.includes(interaction.user.id) && command.help.shown) {
            const noPerm = new MessageEmbed()
                .setTitle("Commande restreinte")
                .setDescription(`Vous n'avez pas le droit d'afficher les informations de cette commande.`)
                .setColor("RED")

            return interaction.reply({ embeds: [noPerm] });
        }

        const commandEmbed = new MessageEmbed()
            .setAuthor({ name: interaction.user.username,  iconURL: interaction.user.displayAvatarURL() })
            .setTitle(`Utilisation de la commande ${commandName}`)
            .addField("🪧 Nom", command.help.name, true)
            .addField("📜 Description", command.help.description, true)
            .addField("⏱️ Cooldown", command.help.cooldown, true)
            .addField("🛠️ Arguments", command.help.args)
            .setColor("WHITE")

        interaction.reply({ embeds: [commandEmbed] });
    }
}

exports.help = {
    shown: true,
    name: "help",
    description: "Obtenir de l'aide à propos de l'utilisation du bot",
    args: "[commande]",
    cooldown: "Aucun",
    category: "Autre"
}