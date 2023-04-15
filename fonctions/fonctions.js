const { MessageEmbed, MessageSelectMenu, MessageActionRow, MessageButton } = require('discord.js');
const syncSql = require("sync-sql")
const config = require("../config.json")
module.exports = {
    // GLOBAL

    filter: () => true,

    configSql: {

        host: process.env.dbHost,
        user: process.env.dbUser,
        password: process.env.dbPassword,
        database : process.env.dbDatabase
      },

    chiffresEmojis: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
    lettresEmojis: ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮"],
    tableauNatures: ["Hardi", "Solo", "Rigide", "Mauvais", "Brave", "Assuré", "Docile", "Malin", "Lâche", "Relax", "Modeste", "Doux", "Pudique", "Foufou", "Discret", "Calme", "Gentil", "Prudent", "Bizarre", "Malpoli", "Timide", "Pressé", "Jovial", "Naïf", "Sérieux"],
    esquiveprecision: {
        "-6": 3/9,
        "-5": 3/8,
        "-4": 3/7,
        "-3": 3/6,
        "-2": 3/5,
        "-1": 3/4,
        "0": 1,
        "1": 4/3,
        "2": 5/3,
        "3": 2,
        "4": 7/3,
        "5": 8/3,
        "6": 3
    },

      emb: function(author, titre, desc, couleur) {
        const embed = new MessageEmbed()
            .setAuthor({ name: author.username,  iconURL: author.displayAvatarURL() })
            .setTitle(titre)
            .setColor(couleur)
            if(desc) embed.setDescription(desc)
            // add commande dans le footer ?
            return embed
    },

    tempsMessage: async function(channel, texte, temps) {
        let msg = await channel.send(texte)
        setTimeout(() => {
            msg.delete()
        }, temps);
    },

    shuffleArray : function(tableau) {
        let nouveautab = []
        for (let j = tableau.length - 1; j >= 0; j--) {
            let random = Math.floor(Math.random() * tableau.length)
                nouveautab.push(tableau[random])
                tableau.splice(random, 1)
        }
        return nouveautab
    },

    query: function(query) {
         console.log(query)
        return syncSql.mysql(this.configSql, query).data.rows
    },

    sleep: async function(ms) {
        await new Promise(resolve => setTimeout(resolve, ms));
    },

    pagin: function(interaction, pages, message) {
        message.react("⬅️")
        message.react("➡️")
        const filter = (reaction, user) => user.id == interaction.user.id
        let compteur = 0
        const collector = message.createReactionCollector({filter: filter});
        collector.on('collect', (reaction, user) => {
            if(reaction.emoji.name === "➡️") {
                message.reactions.resolve("➡️").users.remove(user)
                if(compteur == pages.length-1) {
                    message.edit(pages[0])
                    compteur = 0
                } else {
                    message.edit(pages[compteur+1])
                    compteur++
                }
            }
            if(reaction.emoji.name === "⬅️") {
                message.reactions.resolve("⬅️").users.remove(user)
                if(compteur == 0) {
                    message.edit(pages[pages.length-1])
                    compteur = pages.length -1
                } else {
                    message.edit(pages[compteur-1])
                    compteur--
                }
            }
        });
        setTimeout(() => {
            collector.stop()
        }, 50000);
    },

    // POKEBOT

    isCrit: function(niveau) {
        let reponse = false
        let random = Math.floor(Math.random() * 1000)
        if(niveau == 1 && random < 42) reponse = true
        if(niveau == 2 && random < 125) reponse = true
        if(niveau == 3 && random < 500) reponse = true
        if(niveau == 4) reponse = true
        return reponse
    },

    getVieAff: function(pv, pvMax, client) {
        if(pv > pvMax) pv = pvMax
        let vieVertDebut = this.client.emojis.cache.get("908915614947635242")
        let vieVertMilieu = this.client.emojis.cache.get("908915615438352414")
        let vieVertFin = this.client.emojis.cache.get("908915615006359553")
        let vieVideDebut = this.client.emojis.cache.get("908915615291539497")
        let vieVideMilieu = this.client.emojis.cache.get("908915615346077736")
        let vieVideFin = this.client.emojis.cache.get("908915615312543814")
        let desc = ""

        let ratioPv = Math.round((pv/pvMax)*15) -1
        // Début
        if(pv <= 0) desc += `${vieVideDebut}`
        else desc += `${vieVertDebut}`
        // Milieu
        for(i = 0; i < ratioPv; i++) desc += `${vieVertMilieu}`
        for(i = 0; i < 13 - ratioPv; i++) desc += `${vieVideMilieu}`
        // Fin
        if(pv == pvMax) desc += `${vieVertFin}`
        else desc += `${vieVideFin}`

        return desc
    },

    getVieReduite: function(pv, pvMax) {
        if(pv > pvMax) pv = pvMax
        let vieVertDebut = this.client.emojis.cache.get("908915614947635242")
        let vieVertMilieu = this.client.emojis.cache.get("908915615438352414")
        let vieVertFin = this.client.emojis.cache.get("908915615006359553")
        let vieVideDebut = this.client.emojis.cache.get("908915615291539497")
        let vieVideMilieu = this.client.emojis.cache.get("908915615346077736")
        let vieVideFin = this.client.emojis.cache.get("908915615312543814")
        let desc = ""

        let ratioPv = Math.round((pv/pvMax)*10) -1
        // Début
        if(pv <= 0) desc += `${vieVideDebut}`
        else desc += `${vieVertDebut}`
        // Milieu
        for(i = 0; i < ratioPv; i++) desc += `${vieVertMilieu}`
        for(i = 0; i < 8 - ratioPv; i++) desc += `${vieVideMilieu}`
        // Fin
        if(pv == pvMax) desc += `${vieVertFin}`
        else desc += `${vieVideFin}`

        return desc
    },

    getStats: function(pokemonId, niveau, naturee) {
        let result = this.query(`SELECT stat_pv, stat_attaque, stat_defense, stat_attaque_speciale, stat_defense_speciale, stat_vitesse FROM pokemon WHERE id = '${pokemonId}'`)
        if(result.length == 0) return console.log("soucis: pokémon inexisant")

        let pv = result[0].stat_pv
        let attaque = result[0].stat_attaque
        let defense = result[0].stat_defense
        let attaqueSpe = result[0].stat_attaque_speciale
        let defenseSpe = result[0].stat_defense_speciale
        let vitesse = result[0].stat_vitesse
        let newPv = (2*pv*niveau)/100 + niveau + 10
        let nature = naturee.toString().toLowerCase()

        if(nature == "solo" || nature == "rigide" || nature == "mauvais" || nature == "brave") newAttaque = ((2*attaque*niveau)/100 +5) *1.10
        else if(nature == "assuré" || nature == "modeste" || nature == "calme" || nature == "timide") newAttaque = ((2*attaque*niveau)/100 +5) *0.90
        else newAttaque = ((2*attaque*niveau)/100 +5)

        if(nature == "assuré" || nature == "malin" || nature == "lâche" || nature == "relax") newDefense = ((2*defense*niveau)/100 +5) * 1.10
        else if(nature == "solo" || nature == "doux" || nature == "gentil" || nature == "pressé") newDefense = ((2*defense*niveau)/100 +5) * 0.90
        else newDefense = ((2*defense*niveau)/100 +5)

        if(nature == "modeste" || nature == "doux" || nature == "foufou" || nature == "discret") newAttaqueSpe = ((2*attaqueSpe*niveau)/100 +5) * 1.10
        else if(nature == "rigide" || nature == "malin" || nature == "prudent" || nature == "jovial") newAttaqueSpe = ((2*attaqueSpe*niveau)/100 +5) *0.90
        else newAttaqueSpe = ((2*attaqueSpe*niveau)/100 +5)

        if(nature == "calme" || nature == "gentil" || nature == "prudent" || nature == "malpoli") newDefenseSpe = ((2*defenseSpe*niveau)/100 +5) * 1.10
        else if(nature == "mauvais" || nature == "lâche" || nature == "foufou" || nature == "naïf") newDefenseSpe = ((2*defenseSpe*niveau)/100 +5) *0.90
        else newDefenseSpe = ((2*defenseSpe*niveau)/100 +5)

        if(nature == "timide" || nature == "pressé" || nature == "jovial" || nature == "naïf") newVitesse = ((2*vitesse*niveau)/100 +5) * 1.10
        else if(nature == "brave" || nature == "relax" || nature == "discret" || nature == "malpoli") newVitesse = ((2*vitesse*niveau)/100 +5) *0.90
        else newVitesse = ((2*vitesse*niveau)/100 +5)
        return {
            "pvmax": Math.round(newPv),
            "attaque": Math.round(newAttaque),
            "defense": Math.round(newDefense),
            "attaqueSpeciale": Math.round(newAttaqueSpe),
            "defenseSpeciale": Math.round(newDefenseSpe),
            "vitesse": Math.round(newVitesse)
            }
        },

        getAllInfos: function(user, position, inTeam) {

            let resultPokemonM = this.query(`SELECT S.id, S.pokemon, S.sexe, P.nom, P.type, P.type2, S.surnom, S.niveau, S.xp, S.nature, S.statut, S.image, S.pv, S.tempsstatut FROM spawn S JOIN pokemon P ON P.id = S.pokemon WHERE S.position = '${position}' AND S.equipe = '${inTeam}' AND S.utilisateur = '${user.id}'`)
            let pkm = resultPokemonM[0]
            let pokemonSafe = {}
            pokemonSafe.id = pkm.id
            pokemonSafe.nom = pkm.nom
            if(pkm.surnom) pokemonSafe.nom = pkm.surnom
            pokemonSafe.type = pkm.type
            pokemonSafe.type2 = pkm.type2
            pokemonSafe.image = pkm.image
            pokemonSafe.niveau = pkm.niveau
            pokemonSafe.xp = pkm.xp
            pokemonSafe.nature = pkm.nature
            pokemonSafe.stats = this.getStats(pkm.pokemon, pkm.niveau, pkm.nature)
            pokemonSafe.stats.pv = parseInt(pkm.pv)
            pokemonSafe.stats.statut = pkm.statut
            pokemonSafe.canAttack = 1
            if(pkm.statut == 2 || pkm.statut == 5) pokemonSafe.canAttack = 0
            if(pkm.statut == 3) {
                let randd = Math.floor(Math.random()*4)
                if(randd == 1) pokemonSafe.canAttack = 0
            }
            pokemonSafe.stats.tempsstatut = pkm.tempsstatut
            pokemonSafe.stats.precision = 0
            pokemonSafe.stats.esquive = 0
            pokemonSafe.upgrades = {
                attaque: 0,
                defense: 0,
                attaqueSpeciale: 0,
                defenseSpeciale: 0,
                vitesse: 0
            }
            return pokemonSafe
        },

        getInventaire: function(user) {
            let result = this.query(`SELECT U.pseudo, O.nom, O.type, O.valeur, O.emoji, O.description, I.quantite, O.prix_achat, O.prix_vente FROM inventaire I JOIN utilisateur U ON U.discordid = I.utilisateur JOIN objet O ON O.id = I.objet WHERE I.utilisateur = '${user.id}' AND quantite > 0`)
            if(result.length == 0) return[{ embeds: [this.emb(user, "Attention", "Votre inventaire est vide", "ORANGE")] }]
            
            let tabPotions = []
            let tabBalls = []
            let tabBaies = []
            let tabSpeciaux = []
    
            for(i = 0; i < result.length; i++) {
                if(result[i].type == "potion") tabPotions.push(result[i])
                if(result[i].type == "ball") tabBalls.push(result[i])
                if(result[i].type == "baie") tabBaies.push(result[i])
                if(result[i].type == "special") tabSpeciaux.push(result[i])
            }

            let desc = ""
            for(i = 0; i < tabPotions.length; i++) {
                let emoji = this.client.emojis.cache.get(tabPotions[i].emoji)
                desc += `**·** ${emoji} ${tabPotions[i].nom} - ${tabPotions[i].description} (x${tabPotions[i].quantite})\n\n`
            }
            let embedPotions = new MessageEmbed()
            .setTitle(`Inventaire ${result[0].pseudo} - Potions`)
            .setDescription(desc)
            .setFooter({text: "Cliquez sur le bouton 'Utiliser' pour utiliser un de ces objets"})
    
            desc = ""
            for(i = 0; i < tabBalls.length; i++) {
                emoji = this.client.emojis.cache.get(tabBalls[i].emoji)
                desc += `**·** ${emoji} ${tabBalls[i].nom} - ${tabBalls[i].description} (x${tabBalls[i].quantite})\n\n`
            }
            let embedBalls = new MessageEmbed()
            .setTitle(`Inventaire ${result[0].pseudo} - Balls`)
            .setDescription(desc)
            .setFooter({text: "Cliquez sur le bouton 'Utiliser' pour utiliser un de ces objets"})
    
            desc = ""
            for(i = 0; i < tabBaies.length; i++) {
                emoji = this.client.emojis.cache.get(tabBaies[i].emoji)
                desc += `**·** ${emoji} ${tabBaies[i].nom} - ${tabBaies[i].description} (x${tabBaies[i].quantite})\n\n`
            }
            let embedBaies = new MessageEmbed()
            .setTitle(`Inventaire ${result[0].pseudo} - Baies`)
            .setDescription(desc)
            .setFooter({text: "Cliquez sur le bouton 'Utiliser' pour utiliser un de ces objets"})
    
            desc = ""
            for(i = 0; i < tabSpeciaux.length; i++) {
                emoji = this.client.emojis.cache.get(tabSpeciaux[i].emoji)
                desc += `**·** ${emoji} ${tabSpeciaux[i].nom} - ${tabSpeciaux[i].description} (x${tabSpeciaux[i].quantite})\n\n`
            }
            let embedSpeciaux = new MessageEmbed()
            .setTitle(`Inventaire ${result[0].pseudo} - Objets spéciaux`)
            .setDescription(desc)
            .setFooter({text: "Cliquez sur le bouton 'Utiliser' pour utiliser un de ces objets"})

            return  [embedPotions, embedBalls, embedBaies, embedSpeciaux]
        },

        // casse couille de mettre là mais au moins pas de double collector !
        sell: async function(invActu, bouton) {
            const filter = () => true
            const msg_filter = m => m.author.id === interaction.user.id;
            let chan = bouton.message.channel
            bouton.message.delete()
            interaction = bouton

            let rowInventaire = new MessageActionRow().addComponents(
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
                    .setCustomId(`sellobjet-${interaction.user.id}-${invActu}`)
                    .setLabel("Vendre")
                    .setStyle("PRIMARY")
                          
            );
            embedsinv = this.getInventaire(interaction.user)
            let inventaire = this.query(`SELECT O.nom, O.emoji, O.description, O.id, U.balance FROM inventaire I JOIN utilisateur U ON U.discordid = I.utilisateur JOIN objet O ON O.id = I.objet WHERE I.utilisateur = '${interaction.user.id}' AND O.type = '${this.idObjets[invActu]}' AND quantite > 0`)
            const menuInv = new MessageSelectMenu()
                .setCustomId("menusell")
                .setPlaceholder("Choisissez un objet à vendre")
                if(!inventaire.length) {
                    return chan.send({embeds: [this.emb(interaction.user, "Erreur", "Vous ne possédez aucun objet de cette catégorie, veuillez essayez la commande avec une autre", "RED")]})
                }
                    for(i = 0; i < inventaire.length; i++) {
                    menuInv.addOptions({ label: inventaire[i].nom.toString(), value: inventaire[i].id.toString(), description: `${inventaire[i].description} - ${inventaire[i]['prix_vente']}$`});
                }
                menuInv.addOptions({ label: "Annuler", value: "stop", description: "Revenir en arrière" });
                let oui = await chan.send({content: "** **", components: [{type: 1,components: [menuInv]}]})
                let reponse = await oui.awaitMessageComponent({ filter, componentType: 'SELECT_MENU' })
                oui.delete()
                if(reponse.values[0] == "stop") {
                    // IOI
                    msgInv = await chan.send({embeds: [embedsinv[0]], components: [rowInventaire]})
                } else {
                    objet = reponse.values[0]
                    let itemDb = this.query(`SELECT quantite, nom, prix_vente FROM inventaire I JOIN objet O ON O.id = I.objet WHERE utilisateur = '${interaction.user.id}' AND objet = '${objet}'`)[0]
                    let embz = this.emb(interaction.user, "Quantité", `Combien de ${itemDb.nom} voulez vous vendre à ${itemDb.prix_vente}${this.emojis.argent} ?\n\nVous en possédez **${itemDb.quantite}**`)
                    chan.send({embeds: [embz.setFooter({text: 'Ecrivez la quantité désirée'})]})
                    let collectorQte = await chan.awaitMessages({filter: msg_filter, max:1})
                    let prixtotal = parseInt(collectorQte.first().content) * itemDb.prix_vente

                    const rowBuy = new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId(`selloui`)
                            .setLabel("Oui")
                            .setStyle("SUCCESS"),
                        new MessageButton()
                            .setCustomId(`sellnon`)
                            .setLabel("Non")
                            .setStyle("DANGER")
                    )
                    if(parseInt(collectorQte.first().content) > itemDb.quantite) return chan.send({embeds: [this.emb(interaction.user, "Erreur", `Vous ne possédez pas assez de ${itemDb.nom}`, "RED")]})
                    let msg = await chan.send({embeds: [this.emb(interaction.user, "Confirmation", `Voulez-vous bien vendre ${collectorQte.first().content} ${itemDb.nom} pour ${prixtotal}${this.emojis.argent} ?`, "WHITE")], components: [rowBuy]})
                    let rep = await msg.awaitMessageComponent({ filter, componentType: 'BUTTON' })
                    if(rep.customId == "selloui") {
                        this.query(`UPDATE utilisateur U JOIN inventaire I ON U.id = I.utilisateur SET balance = balance + ${prixtotal}, quantite = quantite - ${collectorQte.first().content} WHERE I.id = ${objet}`)
                        msg.embeds[0].setColor("GREEN")
                        msg.edit({embeds: [msg.embeds[0].setDescription(`Vente terminé avec succès\n\nVous êtes désormais à **${inventaire[0].balance - prixtotal}**${this.emojis.argent}`)]})
                    } else {
                        msg.embeds[0].setColor("ORANGE")
                        msg.edit({embeds: [msg.embeds[0].setDescription("Vente annulé")]})
                    }
                }

        },

    xpLevelUp : function(pokemon, niveau) {
        let query = `SELECT courbeXp FROM pokemon WHERE id = '${pokemon}'`
        let result = syncSql.mysql(this.configSql, query).data.rows
        if(result.length == 0) return 100000000000000000000000
        let courbe = result[0].courbeXp
        let p = [0, 0.008, 0.014]

        switch(courbe) {
            case 1:
                xp = 0.8*(niveau**3)
                break

            case 2:
                xp = niveau**3
                break

            case 3:
                xp = 1.2*(niveau**3) - 15*(niveau**2) + (100*niveau) - 140
                break

            case 4:
                xp = 1.25*(niveau**3)
                break

            case 5:
                if(niveau > 0 && niveau <= 50) xp = ((100-niveau)/50)*niveau**3
                if(niveau >= 51 && niveau <= 68) xp = ((150-niveau)/100)*niveau**3
                if(niveau >= 69 && niveau <= 98) xp = ((1.274- 0.02*(niveau/3) - p[niveau%3]))*niveau**3
                if(niveau >= 99 && niveau <= 100) xp = ((160-niveau)/100)*niveau**3
                break

            case 6:
                if(niveau > 0 && niveau <= 15) xp = ((24+((niveau+1)/3))/50)*niveau**3
                if(niveau >= 16 && niveau <= 35) xp = ((14+niveau)/50)*niveau**3
                if(niveau >= 36 && niveau <= 100) xp = ((32+(niveau/2))/50)*niveau**3
                break
        }

        return Math.floor(xp)
    },

    checkLevelUp: function(pokemon) {
        let infos = {
            lvlup: 0,
            evo: false,
            attaques: null,
            newStats: null
        }
        let embeds = []
        let lvlGain = 0
        while(pokemon.xp >= this.xpLevelUp(pokemon.pokemon, pokemon.niveau+lvlGain+1)) {
            lvlGain++
        }
        
        if(lvlGain > 0) {
            let nvLevel = parseInt(pokemon.niveau + lvlGain)
            infos.lvlup = nvLevel
            let statsAvant = this.getStats(pokemon.pokemon, pokemon.niveau, pokemon.nature)
            let statsApres = this.getStats(pokemon.pokemon, nvLevel, pokemon.nature)
            let heal = statsApres.pvmax - statsAvant.pvmax
            // update db
            this.query(`UPDATE spawn SET niveau = '${nvLevel}', pv = pv + ${heal} WHERE id = '${pokemon.id}'`)
            // desc stats -> nouveaux
            let desc = `Pv Max : ${statsAvant.pvmax} -> ${statsApres.pvmax}\nAttaque : ${statsAvant.attaque} -> ${statsApres.attaque}\nDéfense : ${statsAvant.defense} -> ${statsApres.defense}\nAttaque Spéciale : ${statsAvant.attaqueSpeciale} -> ${statsApres.attaqueSpeciale}\nDéfense Spéciale : ${statsAvant.defenseSpeciale} -> ${statsApres.defenseSpeciale}\nVitesse : ${statsAvant.vitesse} -> ${statsApres.vitesse}`
            infos.newStats = desc

            // Check si évolue
            let resultEvolu = this.query(`SELECT evolution FROM evolution WHERE pokemon = '${pokemon.pokemon}' AND niveau <= '${nvLevel}' AND objet = '0'`)
            if(resultEvolu.length != 0) {
                infos.evo = true
            }
            // Check si apprend attaques
            let attaques = this.query(`SELECT AP.attaque, A.pp, A.nom FROM attaquepokemon AP JOIN attaque A ON A.id = AP.attaque WHERE pokemon = '${pokemon.pokemon}' AND niveau > '${pokemon.niveau}' AND niveau <= '${nvLevel}'`)
            if(attaques.length) infos.attaques = attaques
        }
        return infos
    },

    efficaciteTypes: {
        "Normal": {
            "Normal": 1,
            "Feu": 1,
            "Eau": 1,
            "Plante": 1,
            "Electrik": 1,
            "Glace": 1,
            "Combat": 1,
            "Poison": 1,
            "Sol": 1,
            "Vol": 1,
            "Psy": 1,
            "Insecte": 1,
            "Roche": 0.5,
            "Spectre": 0,
            "Dragon": 1,
            "Ténèbres": 1,
            "Acier": 0.5
        },
        "Feu": {
            "Normal": 1,
            "Feu": 0.5,
            "Eau": 0.5,
            "Plante": 2,
            "Electrik": 1,
            "Glace": 2,
            "Combat": 1,
            "Poison": 1,
            "Sol": 1,
            "Vol": 1,
            "Psy": 1,
            "Insecte": 2,
            "Roche": 0.5,
            "Spectre": 1,
            "Dragon": 0.5,
            "Ténèbres": 1,
            "Acier": 2
        },
        "Eau": {
            "Normal": 1,
            "Feu": 2,
            "Eau": 0.5,
            "Plante": 0.5,
            "Electrik": 1,
            "Glace": 1,
            "Combat": 1,
            "Poison": 1,
            "Sol": 2,
            "Vol": 1,
            "Psy": 1,
            "Insecte": 1,
            "Roche": 2,
            "Spectre": 1,
            "Dragon": 0.5,
            "Ténèbres": 1,
            "Acier": 1
        },
        "Plante": {
            "Normal": 1,
            "Feu": 0.5,
            "Eau": 2,
            "Plante": 0.5,
            "Electrik": 1,
            "Glace": 1,
            "Combat": 1,
            "Poison": 0.5,
            "Sol": 2,
            "Vol": 0.5,
            "Psy": 1,
            "Insecte": 0.5,
            "Roche": 2,
            "Spectre": 1,
            "Dragon": 0.5,
            "Ténèbres": 1,
            "Acier": 0.5
        },
        "Electrik": {
            "Normal": 1,
            "Feu": 1,
            "Eau": 2,
            "Plante": 0.5,
            "Electrik": 0.5,
            "Glace": 1,
            "Combat": 1,
            "Poison": 1,
            "Sol": 0,
            "Vol": 2,
            "Psy": 1,
            "Insecte": 1,
            "Roche": 1,
            "Spectre": 1,
            "Dragon": 0.5,
            "Ténèbres": 1,
            "Acier": 1           
        },
        "Glace": {
            "Normal": 1,
            "Feu": 0.5,
            "Eau": 0.5,
            "Plante": 2,
            "Electrik": 1,
            "Glace": 0.5,
            "Combat": 1,
            "Poison": 1,
            "Sol": 2,
            "Vol": 2,
            "Psy": 1,
            "Insecte": 1,
            "Roche": 1,
            "Spectre": 1,
            "Dragon": 2,
            "Ténèbres": 1,
            "Acier": 0.5
        },
        "Combat": {
            "Normal": 2,
            "Feu": 1,
            "Eau": 1,
            "Plante": 1,
            "Electrik": 1,
            "Glace": 2,
            "Combat": 1,
            "Poison": 0.5,
            "Sol": 1,
            "Vol": 0.5,
            "Psy": 0.5,
            "Insecte": 0.5,
            "Roche": 2,
            "Spectre": 0,
            "Dragon": 1,
            "Ténèbres": 2,
            "Acier": 2
        },
        "Poison": {
            "Normal": 1,
            "Feu": 1,
            "Eau": 1,
            "Plante": 2,
            "Electrik": 1,
            "Glace": 1,
            "Combat": 1,
            "Poison": 0.5,
            "Sol": 0.5,
            "Vol": 1,
            "Psy": 1,
            "Insecte": 1,
            "Roche": 0.5,
            "Spectre": 0.5,
            "Dragon": 1,
            "Ténèbres": 1,
            "Acier": 0
        },
        "Sol": {
            "Normal": 1,
            "Feu": 2,
            "Eau": 1,
            "Plante": 0.5,
            "Electrik": 2,
            "Glace": 1,
            "Combat": 1,
            "Poison": 2,
            "Sol": 1,
            "Vol": 0,
            "Psy": 1,
            "Insecte": 0.5,
            "Roche": 2,
            "Spectre": 1,
            "Dragon": 1,
            "Ténèbres": 1,
            "Acier": 2
        },
        "Vol": {
            "Normal": 1,
            "Feu": 1,
            "Eau": 1,
            "Plante": 2,
            "Electrik": 0.5,
            "Glace": 1,
            "Combat": 2,
            "Poison": 1,
            "Sol": 1,
            "Vol": 1,
            "Psy": 1,
            "Insecte": 2,
            "Roche": 0.5,
            "Spectre": 1,
            "Dragon": 1,
            "Ténèbres": 1,
            "Acier": 0.5
        },
        "Psy": {
            "Normal": 1,
            "Feu": 1,
            "Eau": 1,
            "Plante": 1,
            "Electrik": 1,
            "Glace": 1,
            "Combat": 2,
            "Poison": 2,
            "Sol": 1,
            "Vol": 1,
            "Psy": 0.5,
            "Insecte": 1,
            "Roche": 1,
            "Spectre": 1,
            "Dragon": 1,
            "Ténèbres": 0,
            "Acier": 0.5
        },
        "Insecte": {
            "Normal": 1,
            "Feu": 0.5,
            "Eau": 1,
            "Plante": 2,
            "Electrik": 1,
            "Glace": 1,
            "Combat": 0.5,
            "Poison": 0.5,
            "Sol": 1,
            "Vol": 0.5,
            "Psy": 2,
            "Insecte": 1,
            "Roche": 1,
            "Spectre": 0.5,
            "Dragon": 1,
            "Ténèbres": 2,
            "Acier": 0.5
        },
        "Roche": {
            "Normal": 1,
            "Feu": 2,
            "Eau": 1,
            "Plante": 1,
            "Electrik": 1,
            "Glace": 2,
            "Combat": 0.5,
            "Poison": 1,
            "Sol": 0.5,
            "Vol": 2,
            "Psy": 1,
            "Insecte": 2,
            "Roche": 1,
            "Spectre": 1,
            "Dragon": 1,
            "Ténèbres": 1,
            "Acier": 0.5
        },
        "Spectre": {
            "Normal": 0,
            "Feu": 1,
            "Eau": 1,
            "Plante": 1,
            "Electrik": 1,
            "Glace": 1,
            "Combat": 1,
            "Poison": 1,
            "Sol": 1,
            "Vol": 1,
            "Psy": 2,
            "Insecte": 1,
            "Roche": 1,
            "Spectre": 2,
            "Dragon": 1,
            "Ténèbres": 0.5,
            "Acier": 0.5
        },
        "Dragon": {
            "Normal": 1,
            "Feu": 1,
            "Eau": 1,
            "Plante": 1,
            "Electrik": 1,
            "Glace": 1,
            "Combat": 1,
            "Poison": 1,
            "Sol": 1,
            "Vol": 1,
            "Psy": 1,
            "Insecte": 1,
            "Roche": 1,
            "Spectre": 1,
            "Dragon": 2,
            "Ténèbres": 1,
            "Acier": 0.5
        },
        "Ténèbres": {
            "Normal": 1,
            "Feu": 1,
            "Eau": 1,
            "Plante": 1,
            "Electrik": 1,
            "Glace": 1,
            "Combat": 0.5,
            "Poison": 1,
            "Sol": 1,
            "Vol": 1,
            "Psy": 2,
            "Insecte": 1,
            "Roche": 1,
            "Spectre": 2,
            "Dragon": 1,
            "Ténèbres": 0.5,
            "Acier": 0.5
        },
        "Acier": {
            "Normal": 1,
            "Feu": 0.5,
            "Eau": 0.5,
            "Plante": 1,
            "Electrik": 1,
            "Glace": 2,
            "Combat": 1,
            "Poison": 1,
            "Sol": 1,
            "Vol": 1,
            "Psy": 1,
            "Insecte": 1,
            "Roche": 2,
            "Spectre": 1,
            "Dragon": 1,
            "Ténèbres": 1,
            "Acier": 0.5
        },

    },

    immuniteStatut: {
        1: ["Feu"],
        2: ["Glace"],
        3: ["Electrik"],
        4: ["Poison", "Acier"],
        5: []
    },

    idObjets: {
        0: "potion",
        1: "ball",
        2: "baie",
        3: "special"
    },

    idStatuts: {
        0: "normal",
        1: "brûlure",
        2: "gel",
        3: "paralysie",
        4: "empoisonnement",
        5: "sommeil",
        7: "confusion"

    },

    emojis: {
       
    },

    client: null,
    
    setClient: function(client) {
        this.client = client
        this.emojis["masculin"] = this.client.emojis.cache.get("971417424010281010")
        this.emojis["feminin"] = this.client.emojis.cache.get("971417423964147732")
        this.emojis["xpborder"] = this.client.emojis.cache.get("971423729966022676")
        this.emojis["xpnoborder"] = this.client.emojis.cache.get("971423730070851634")
        this.emojis["test"] = this.client.emojis.cache.get("971425055328305222")
        this.emojis["test2"] = this.client.emojis.cache.get("971428494183649300")
        this.emojis["test3"] = this.client.emojis.cache.get("971429397347328000")
        this.emojis["argent"] = "$",
        this.emojis["pokeball"] = this.client.emojis.cache.get("908190568117583882"),
        this.emojis["brûlure"] = "brul",
        this.emojis["gel"] = "gel",
        this.emojis["paralysie"] = "para",
        this.emojis["empoisonnement"] = "empoison",
        this.emojis["sommeil"] = "sommeil",
        this.emojis["confusion"] = "confus"
        
    },

    afficheInfosPokemon(id, interaction) {
        let infos = this.query(`SELECT S.*, P.nom, P.pokedex, P.type, P.type2 FROM spawn S JOIN pokemon P ON P.id = S.pokemon WHERE S.id = '${id}'`)[0]
        let stats = this.getStats(infos.pokemon, infos.niveau, infos.nature)
        let attaques = this.query(`SELECT *, AP.pp AS pp, A.pp AS ppmax FROM attaquepokemontam AP JOIN attaque A ON A.id = AP.attaque WHERE AP.pokemon = '${infos.id}'`)
        let nom = infos.surnom ? `${infos.surnom} / ${infos.nom}` : infos.nom
        let sexe = infos.sexe ? this.emojis.masculin : this.emojis.feminin
        let statut = infos.statut == 0 ? "Normal" : this.emojis[this.idStatuts[infos.statut]]
        let type = infos.type2 ? `${infos.type} ${infos.type2}` : infos.type
        let equipe = infos.equipe ? `Equipe - ${infos.position}` : `PC - ${infos.position}`

        let descInfosGe = `${equipe} | Pokédex N°${infos.pokedex}\n\n${nom}\n\n${this.emojis.pokeball} Nv.${infos.niveau} ${sexe}\n\nStatut : ${statut} | Nature ${infos.nature}\n\nType/${type}`
        let descInfosDeux = 'PV: `' + infos.pv + '/' + stats.pvmax + '`' + `\nVitesse: ` + '`' + stats.vitesse + '`' + "\nAttaque spéciale : " + '`' + stats.attaqueSpeciale + '`' + "\nDéfense Spéciale: " + '`' + stats.defenseSpeciale + '`' + "\n\nXP: " + '`' + infos.xp + '/' + this.xpLevelUp(infos.pokemon, parseInt(infos.niveau)+1) + '`' 
        let descCapacites = ""
        attaques.forEach(attaque => {
            descCapacites += `${attaque.type} > ${attaque.nom} | PP: ${attaque.pp}/${attaque.ppmax}\n\n`
        })

        let embedinfos = this.emb(interaction.user, `Infos Pokémon`, descInfosGe, "WHITE")
        embedinfos.setImage(infos.image)
        
        let embedAptitudes = this.emb(interaction.user, `Infos Aptitudes`, descInfosDeux, "WHITE")
        embedAptitudes.setImage(infos.image)
        
        let embedCapacites = this.emb(interaction.user, `Infos Capacités`, descCapacites, "WHITE")
        embedCapacites.setImage(infos.image)
        

        return [{embeds: [embedinfos]}, {embeds: [embedAptitudes]}, {embeds: [embedCapacites]}]

    },

    name: "fonctions",
}
