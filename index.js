const Discord = require('discord.js');
const client = new Discord.Client({ intents: 98045 });

require('dotenv').config();

const fs = require('fs');
const Enmap = require('enmap');

client.login(process.env.token);

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        //console.log(`Chargement en cours de l'événement ${eventName}.`);
        client.on(eventName, event.bind(null, client));
    });
});

client.commands = new Enmap();



fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        //console.log(`Chargement en cours de la commande ${commandName}.`);
        client.commands.set(commandName, props);
    });
});