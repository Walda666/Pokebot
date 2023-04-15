const fx = require("../fonctions/fonctions")
const fxcombat = require("../fonctions/combat")
const discord = require('discord.js');

exports.run = async (client, interaction) => {

    //fx.query(`UPDATE spawn SET pokemon = 1, niveau = '4' WHERE id = '10'`)

    let invActu, msgInv, embedsinv, valeurPotion, valeurBaie
    let pokeKo = 0
    let pokesFight = []
    let result = fx.query(`SELECT * FROM pokemonlieu PL JOIN lieux L ON L.id = PL.lieu WHERE L.channel = '${interaction.channel.id}'`)
    if(result.length == 0) return interaction.channel.send({ embeds: [fx.emb(interaction.user, "ERREUR", "Il n'y a pas de pokémon sauvage ici", "RED")] })

    const thread = await interaction.channel.threads.create({
        name: `combat-${interaction.user.username}`,
        autoArchiveDuration: 60,
        reason: `Combat ${interaction.user.username}`,
    });
    thread.send(`${interaction.user}`)

    // Récupérer id selon l'heure jour/nuit et la proba
    let idPokemon = 13
    result = fx.query(`SELECT * FROM pokemon WHERE id = '${idPokemon}'`)

    // On récupère les données pour le combat et après s'il est capturé, le tout dans un objet (c débile de refaire un objet pour lui assigner tout mais pg)
    let pokemonSauvage = {}

    pokemonSauvage.id = idPokemon
    pokemonSauvage.nom = result[0].nom
    pokemonSauvage.type = result[0].type
    pokemonSauvage.type2 = result[0].type2
    pokemonSauvage.shiny = 0
    pokemonSauvage.image = result[0].image
    let random = (Math.floor(Math.random() * 4096))
    if(random == 666) {
        pokemonSauvage.shiny = 1
        pokemonSauvage.image = result[0].image_shiny
    }
    pokemonSauvage.niveau = 1 // random selon la zone, le + simple serait d'ajouter les zones dans la db par ordre d'avancement
    pokemonSauvage.xp = 0
    pokemonSauvage.sexe = "1" // p-e random avec féminin
    pokemonSauvage.tauxcapture = result[0].taux_capture
    pokemonSauvage.canAttack = 1
    let randy = (Math.floor(Math.random() * 25))
    pokemonSauvage.nature = fx.tableauNatures[randy]  
    pokemonSauvage.stats = fx.getStats(idPokemon, pokemonSauvage.niveau, pokemonSauvage.nature)
    pokemonSauvage.stats.pv = pokemonSauvage.stats.pvmax
    pokemonSauvage.stats.statut = 0
    pokemonSauvage.stats.tempsstatut = 0
    pokemonSauvage.stats.precision = 0
    pokemonSauvage.stats.esquive = 0
    pokemonSauvage.upgrades = {
        attaque: 0,
        defense: 0,
        attaqueSpeciale: 0,
        defenseSpeciale: 0,
        vitesse: 0
    }

        
    // N° dans l'équipe du pokémon (le premier par défaut)
    let pokemonChoisi = 1

    // safe
    let resultPokemonM = fx.query(`SELECT S.pokemon, S.sexe, P.nom, P.type, P.type2, S.surnom, S.niveau, S.xp, S.nature, S.statut, S.image, S.pv FROM spawn S JOIN pokemon P ON P.id = S.pokemon WHERE S.position = '${pokemonChoisi}' AND S.equipe = 1 AND S.utilisateur = '${interaction.user.id}'`)
    if(resultPokemonM.length == 0) return interaction.channel.send({ embeds: [fx.emb(interaction.user, "ERREUR", "Vous n'avez pas de Pokémon en première position d'équipe.\n\nsetFirst pour en mettre un.", "RED")] })
    let pokemonSafe = fx.getAllInfos(interaction.user, 1, 1)
    pokesFight.push(pokemonSafe.id)

    // JOURNAL DES COMBATS : fxcombat.pokemonsFight[interaction.user.id] = [pokemonSafe, pokemonSauvage]

    // attaques ici
    // add where pokemon = X
    let attaquesSafe = fx.query(`SELECT position, nom, AP.pp, A.pp AS ppmax, type, AP.id AS idattaque, classe, degats, prec, typest, cible, statchange, puissance, chancestatut, chancestats, crit FROM attaquepokemontam AP JOIN attaque A ON AP.attaque = A.id WHERE pokemon = '${pokemonSafe.id}' ORDER BY position ASC`)
    let attaquesSauvage = fx.query(`SELECT nom, type, classe, degats, prec , typest, cible, statchange, puissance, chancestatut, chancestats, crit FROM attaquepokemon AP JOIN attaque A ON AP.attaque = A.id WHERE AP.niveau <= '${pokemonSauvage.niveau}' AND AP.pokemon = '${idPokemon}' ORDER BY AP.niveau DESC LIMIT 4`)
    // on crée les embeds avec boutons

    let embedS = fxcombat.embedPokemon(pokemonSauvage, 1)
    let embedM = fxcombat.embedPokemon(pokemonSafe, 0)

    const rowBase = new discord.MessageActionRow().addComponents(
        new discord.MessageButton()
            .setCustomId(`combat-attaque`)
            .setLabel("Attaque")
            .setStyle("PRIMARY"),
        new discord.MessageButton()
            .setCustomId(`combat-sac`)
            .setLabel("Sac")
            .setStyle("SECONDARY"),
        new discord.MessageButton()
            .setCustomId(`combat-pokemon`)
            .setLabel("Pokemon")
            .setStyle("SUCCESS"),
        new discord.MessageButton()
            .setCustomId(`combat-fuite`)
            .setLabel("Fuite")
            .setStyle("DANGER")
    );

    const rowInventaire = new discord.MessageActionRow().addComponents(
        new discord.MessageButton()
            .setCustomId(`potions`)
            .setLabel("Potions")
            .setStyle("SUCCESS"),
        new discord.MessageButton()
            .setCustomId(`balls`)
            .setLabel("Balls")
            .setStyle("SUCCESS"),
        new discord.MessageButton()
            .setCustomId(`baies`)
            .setLabel("Baies")
            .setStyle("SUCCESS"),
        new discord.MessageButton()
            .setCustomId(`speciaux`)
            .setLabel("Spéciaux")
            .setStyle("SUCCESS"),
        new discord.MessageButton()
            .setCustomId(`useobjcombat`)
            .setLabel("Utiliser")
            .setStyle("PRIMARY")
                  
    );
    // SUPPR APRES TESTS
    //pokesFight.push(10)
        let msgPokemons = await thread.send({embeds : [embedS, embedM]})
        let embedBase, menuBase
        let commence = 1
        if(pokemonSafe.stats.vitesse < pokemonSauvage.stats.vitesse) commence = 0
        
        if(commence) {
            embedBase = fx.emb(interaction.user, "Menu", `Que dois faire ${pokemonSafe.nom} ?`, "WHITE")
            embedBase.setFooter({text: "Choisissez votre action à l'aide des boutons"})
            menuBase = await thread.send({embeds: [embedBase], components: [rowBase]})
            tourSafe(1)
        } else {
            for(i = 0; i < rowBase.components.length; i++) rowBase.components[i].setDisabled(true)
            embedBase = fx.emb(interaction.user, "Menu", `C'est au tour de ${pokemonSauvage.nom} d'attaquer`, "WHITE")
            embedBase.setFooter({text: "Choisissez votre action à l'aide des boutons"})
            menuBase = await thread.send({embeds: [embedBase], components: [rowBase]})
            tourSauvage(1)
        }
        

    async function tourSafe(ordre) {
        console.log("toursafe")
        const filter = () => true
        const collector = thread.createMessageComponentCollector({ filter });
        // skip tour si changement de pokemon par ko
        if(pokeKo == 1) {
            console.log("ko")
            pokeKo = 0
            finTour()
        } else {
            // réactive boutons
            for(i = 0; i < rowBase.components.length; i++) {
                rowBase.components[i].setDisabled(false)
            }
            menuBase.edit({embeds: [menuBase.embeds[0]], components: [rowBase]})
            collector.on('collect', async bouton => {
                // COMBAT
                if (bouton.customId === 'combat-attaque') {
                    for(i = 0; i < rowBase.components.length; i++) rowBase.components[i].setDisabled(true)
                    menuBase.edit({embeds: [menuBase.embeds[0]], components: [rowBase]})
                    
                    // proposition attaques avec assez de PP | value : position de l'attaque dans le tableau
                    const menuAttaques = new discord.MessageSelectMenu()
                    .setCustomId("choose-attaque")
                    .setPlaceholder("Choisissez une attaque à lancer")
                    for(i = 0; i < attaquesSafe.length; i++) {
                        if(attaquesSafe[i].pp > 0) menuAttaques.addOptions({ label: attaquesSafe[i].nom.toString(), value: i.toString(), description: `PP : ${attaquesSafe[i].pp}/${attaquesSafe[i].ppmax} ~ Type/${attaquesSafe[i].type}`});
                    }
                thread.send({
                    content: "** **",
                    components: [
                        {
                            type: 1,
                            components: [menuAttaques]
                        }
                    ]
                })

                }
                // quand l'attaque est choisie
                if(bouton.customId == "choose-attaque") {
                    bouton.message.delete()
                    let num = bouton.values[0]
                    let attaque = attaquesSafe[num]
                    if(!pokemonSafe.canAttack) {
                        menuBase.edit({embeds: [menuBase.embeds[0].setDescription(`${pokemonSafe.nom} ne peut pas attaquer :/`)]})
                        console.log("peut pas attaquer")
                    } else {
                        resultAttaque = fxcombat.attaque(attaque, pokemonSafe, pokemonSauvage, ordre)
                        console.log(resultAttaque)
                        msgPokemons.edit({embeds : [fxcombat.embedPokemon(pokemonSauvage, 1), fxcombat.embedPokemon(pokemonSafe, 0)]})
                        menuBase.edit({embeds: [menuBase.embeds[0].setDescription(`${pokemonSafe.nom} utilise ${attaque.nom}\n\n${infos.desc.join('\n')}`)]})   
                    }
                    finTour()
                }
                // INVENTAIRE
                if (bouton.customId === 'combat-sac') {
                    for(i = 0; i < rowBase.components.length; i++) rowBase.components[i].setDisabled(true)
                    menuBase.edit({embeds: [fx.emb(interaction.user, "Menu", "Choisissez votre action en cliquant sur un bouton", "WHITE")], components: [rowBase]})
                    embedsinv = fx.getInventaire(interaction.user)
                    invActu = 0
                    msgInv = await thread.send({embeds: [embedsinv[0]], components: [rowInventaire]})

                }
                // FUITE
                if (bouton.customId === 'combat-fuite') {
                    for(i = 0; i < rowBase.components.length; i++) rowBase.components[i].setDisabled(true)
                    //finCombat(1,1)
                    //menuBase.edit({embeds: [fx.emb(interaction.user, "Menu", "Choisissez votre action en cliquant sur un bouton", "WHITE")], components: [rowBase]})
                    finTour()
                }
                // CHANGEMENT POKEMON
                if (bouton.customId === 'combat-pokemon') {
                    for(i = 0; i < rowBase.components.length; i++) rowBase.components[i].setDisabled(true)
                    menuBase.edit({embeds: [fx.emb(interaction.user, "Menu", "Choisissez votre action en cliquant sur un bouton", "WHITE")], components: [rowBase]})

                    let resultEquipe = fx.query( `SELECT S.position, S.surnom, P.nom AS nomPoke, S.niveau, S.nature, S.pv FROM spawn S  JOIN pokemon P ON S.pokemon = P.id WHERE S.utilisateur = '${interaction.user.id}' AND S.equipe = 1 AND S.pv > 0 ORDER BY S.id ASC`)
                    if(resultEquipe.length == 0) return thread.send({ embeds: [fx.emb(interaction.user, "ERREUR", "Vous n'avez aucun Pokémon dans votre équipe", "RED")] })
                    const menu = new discord.MessageSelectMenu()
                        .setCustomId("change-poke")
                        .setPlaceholder("Choisissez un Pokemon à envoyer au combat")
                        for(i = 0; i < resultEquipe.length; i++) {
                            let nom = resultEquipe[i].nomPoke
                            if(resultEquipe[i].surnom) nom = resultEquipe[i].surnom
                            if(resultEquipe[i].pv > 0) menu.addOptions({ label: nom.toString(), value: resultEquipe[i].position.toString(), description: resultEquipe[i].nomPoke });
                        }
                    thread.send({
                        content: "** **",
                        components: [
                            {
                                type: 1,
                                components: [menu]
                            }
                        ]
                    })
                    
                }
                // collector changement pokemon
                if (bouton.customId === 'change-poke') {
                let nouveauPoke = bouton.values[0]
                // enregistrer poke actuel en db + récupérer infos du nouveau en remplacement + edit embed
                fx.query(`UPDATE spawn S JOIN pokemon P ON P.id = S.pokemon SET S.pv = '${pokemonSafe.stats.pv}', S.statut = '${pokemonSafe.stats.statut}', S.tempsstatut = '${pokemonSafe.stats.tempsstatut}' WHERE S.id = '${pokemonSafe.id}' AND S.equipe = 1 AND S.utilisateur = '${interaction.user.id}'`)
                    pokemonSafe = fx.getAllInfos(interaction.user, nouveauPoke, 1)
                    if(!pokesFight.includes(pokemonSafe.id)) pokesFight.push(pokemonSafe.id)
                    let newEmbed = fxcombat.embedPokemon(pokemonSafe, 0)
                    msgPokemons.edit({embeds : [embedS, newEmbed]})
                    bouton.message.delete()
                    menuBase.edit({embeds: [menuBase.embeds[0].setDescription(`${pokemonSafe.nom} ! Go !`)]})
                    finTour()
                }

                // collectors inventaire
                if (bouton.customId === 'potions') {
                    msgInv.edit({embeds: [embedsinv[0]], components: [rowInventaire]})
                    invActu = 0
                }

                if (bouton.customId === 'balls') {
                    msgInv.edit({embeds: [embedsinv[1]], components: [rowInventaire]})
                    invActu = 1
                }

                if (bouton.customId === 'baies') {
                    msgInv.edit({embeds: [embedsinv[2]], components: [rowInventaire]})
                    invActu = 2
                }
                if (bouton.customId === 'speciaux') {
                    msgInv.edit({embeds: [embedsinv[3]], components: [rowInventaire]})
                    invActu = 3
                }
                // MENU UTILISATION D'OBJET
                if (bouton.customId === 'useobjcombat') {
                    bouton.message.delete()
                    let inventaire = fx.query(`SELECT O.nom, O.emoji, O.description, O.id FROM inventaire I JOIN objet O ON O.id = I.objet WHERE S.utilisateur = '${interaction.user.id}' AND O.type = '${fx.idObjets[invActu]}'`)
                    
                    const menuInv = new discord.MessageSelectMenu()
                        .setCustomId("menuuseobjcombat")
                        .setPlaceholder("Choisissez un objet à utiliser")
                        for(i = 0; i < inventaire.length; i++) {
                            menuInv.addOptions({ label: inventaire[i].nom.toString(), value: inventaire[i].id.toString(), description: inventaire[i].description });
                        }
                    thread.send({content: "** **", components: [{type: 1,components: [menuInv]}]})
                }
            
            
            // UTILISATION D'OBJET
            if (bouton.customId === 'menuuseobjcombat') {
                bouton.message.delete()
                // enleve db
                fx.query(`UPDATE inventaire SET quantite = quantite - 1 WHERE utilisateur = '${interaction.user.id}' AND objet = '${bouton.values[0]}'`)
                let objet = fx.query(`SELECT * FROM objet WHERE id = '${bouton.values[0]}'`)[0]
                // POTION
                if(objet.type == "potion") {
                    valeurPotion = objet.valeur
                    let resultEquipe = fx.query( `SELECT S.id AS idspawn, S.surnom, P.nom AS nomPoke, S.niveau, S.nature, S.pv FROM spawn S JOIN pokemon P ON S.pokemon = P.id WHERE S.utilisateur = '${interaction.user.id}' AND S.equipe = 1 AND S.pv > 0 ORDER BY S.id ASC`)
                    if(resultEquipe.length == 0) return thread.send({ embeds: [fx.emb(interaction.user, "ERREUR", "Vous n'avez aucun Pokémon dans votre équipe", "RED")] })
                    const menuPotionPoke = new discord.MessageSelectMenu()
                        .setCustomId("usepotion")
                        .setPlaceholder("Choisissez le Pokemon à soigner")
                        for(i = 0; i < resultEquipe.length; i++) {
                            let nom = resultEquipe[i].nomPoke
                            if(resultEquipe[i].surnom) nom = resultEquipe[i].surnom
                            if(resultEquipe[i].pv > 0) menuPotionPoke.addOptions({ label: nom.toString(), value: resultEquipe[i].idspawn.toString(), description: resultEquipe[i].nomPoke });
                        }
                    thread.send({content: "** **",components: [{type: 1,components: [menuPotionPoke]}]})


                }
                // BALL
                if(objet.type == "ball") {
                    let capture = (fxcombat.capture(pokemonSauvage, objet.valeur))
                    // mettre embed balle qui tourne et tout | adapter avec les différentes balls
                    let embCatch = new discord.MessageEmbed()
                    .setTitle("Capture")
                    .setDescription(`${pokemonSafe.nom} utilise ${objet.nom} !`)
                    .setImage("https://cdn.discordapp.com/attachments/969993513901129858/970362109269516348/poke_droite.png")
                    menuBase.edit({embeds: [embCatch]})

                    setTimeout(() => {
                        menuBase.edit({embeds: [embCatch.setImage("https://cdn.discordapp.com/attachments/969993513901129858/970362109500227614/poke_tournee.png")]})
                    }, 1500);

                    setTimeout(() => {
                        if(capture) {
                            embCatch.setDescription(`Et hop !\n\n${pokemonSauvage.nom} a été capturé !`)
                            menuBase.edit({embeds: [embCatch.setImage("https://cdn.discordapp.com/attachments/969993513901129858/970362110079021066/poke_win.png")]})
                            setTimeout(() => {
                                finCombat(1, 1)
                            }, 3000);
                            // surnom, insert db et tout + finCombat() 
                        } else {
                            embCatch.setDescription(`Oups`)
                            menuBase.edit({embeds: [embCatch.setImage("https://cdn.discordapp.com/attachments/969993513901129858/970362109269516348/poke_droite.png")]})
                            setTimeout(() => {
                                menuBase.edit({embeds: [embCatch]})
                                endInventaire("Tu n'as pas réussi à capturer ce pokemon")
                            }, 3000);
                        }
                        }, 3000);
                }
                // BAIE
                if(objet.type == "baie") {
                    valeurBaie = objet
                    let resultEquipe = fx.query( `SELECT S.id AS idspawn, S.surnom, P.nom AS nomPoke, S.niveau, S.nature, S.pv FROM spawn S JOIN pokemon P ON S.pokemon = P.id WHERE S.utilisateur = '${interaction.user.id}' AND S.equipe = 1 AND S.pv > 0 ORDER BY S.id ASC`)
                    if(resultEquipe.length == 0) return thread.send({ embeds: [fx.emb(interaction.user, "ERREUR", "Vous n'avez aucun Pokémon dans votre équipe", "RED")] })
                    const menuBaiePoke = new discord.MessageSelectMenu()
                        .setCustomId("usebaie")
                        .setPlaceholder("Choisissez le Pokemon à qui donner cette baie")
                        for(i = 0; i < resultEquipe.length; i++) {
                            let nom = resultEquipe[i].nomPoke
                            if(resultEquipe[i].surnom) nom = resultEquipe[i].surnom
                            if(resultEquipe[i].pv > 0) menuBaiePoke.addOptions({ label: nom.toString(), value: resultEquipe[i].idspawn.toString(), description: resultEquipe[i].nomPoke });
                        }
                    thread.send({content: "** **",components: [{type: 1,components: [menuBaiePoke]}]})
                }

            }
            // combat > sac > potion > choix poke à heal 
            if(bouton.customId == "usepotion") {
                bouton.message.delete()
                let pokeHeal = bouton.values[0]
                // heal directement pokemon ou update db si c'est un autre
                if(pokeHeal == pokemonSafe.id) {
                    let pvbase = pokemonSafe.stats.pv
                    pokemonSafe.stats.pv += valeurPotion
                    if(pokemonSafe.stats.pv > pokemonSafe.stats.pvmax) pokemonSafe.stats.pv = pokemonSafe.stats.pvmax
                    endInventaire(`X a été soigné de ${valeurPotion} PV (${pvbase} -> ${pokemonSafe.stats.pv})`)
                } else {
                    let pokedb = fx.query(`SELECT pv, pokemon, nature, niveau FROM spawn WHERE id = '${pokeHeal}'`)[0]
                    let pvmax = fx.getStats(pokedb.pokemon, pokedb.niveau, pokedb.nature).pvmax
                    let pv = pokedb.pv + valeurPotion
                    if(pv > pvmax) pv = pvmax
                    fx.query(`UPDATE spawn SET pv = '${pv}' WHERE id = '${pokeHeal}'`)
                    endInventaire(`X a été soigné de ${valeurPotion} PV (${pokedb.pv} -> ${pv})`)
                }
            }

            // combat > sac > potion > choix poke à qui donner une baie 
            if(bouton.customId == "usebaie") {
                bouton.message.delete()
                let pokeBaie = bouton.values[0]
                // D'abord pokemon ici puis pokemon db si c'en est un autre
                if(pokemonSafe.id == pokeBaie) {
                    // soigne état
                    if(valeurBaie.valeur < 10) {
                        if(pokemonSafe.stats.statut == valeurBaie.valeur) {
                            pokemonSafe.stats.statut = 0
                            pokemonSafe.stats.tempsstatut = 0
                            endInventaire(`Il a été soigné de ${fx.idStatuts[parseInt(valeurBaie.valeur)]} !`)
                        }
                    } else {
                        // le reste en cas par cas.
                        if(valeurBaie.id == 9) {
                            pokemonSafe.stats.pv += 10
                            if(pokemonSafe.stats.pv > pokemonSafe.stats.pvmax) pokemonSafe.stats.pv = pokemonSafe.stats.pvmax
                            endInventaire(`Il a été soigné de 10 PV !`)
                        }
                        if(valeurBaie.id == 10) {
                            pokemonSafe.stats.pv += Math.round(pokemonSafe.stats.pvmax/4)
                            if(pokemonSafe.stats.pv > pokemonSafe.stats.pvmax) pokemonSafe.stats.pv = pokemonSafe.stats.pvmax
                            endInventaire(`Il a été soigné de ${Math.round(pokemonSafe.stats.pvmax/4)} PV !`)
                        }
                        if(valeurBaie.id == 17) {
                            const menuBaieMepo = new discord.MessageSelectMenu()
                            .setCustomId("baiemepo")
                            .setPlaceholder("Choisissez l'attaque à recharger")
                            for(i = 0; i < attaquesSafe.length; i++) {
                                menuBaieMepo.addOptions({ label: attaquesSafe[i].nom.toString(), value: i.toString(), description: `PP : ${attaquesSafe[i].pp}/${attaquesSafe[i].ppmax} ~ Type/${attaquesSafe[i].type}` });
                            }
                        thread.send({content: "** **",components: [{type: 1,components: [menuBaieMepo]}]})

                        }
                        if(valeurBaie.id == 18) {
                            if(pokemonSafe.stats.statut != 0 && pokemonSafe.stats.statut != 6) {
                                endInventaire(`Il a été soigné de ${fx.idStatuts[pokemonSafe.stats.statut]}`)
                                pokemonSafe.stats.statut = 0
                            }
                        }
                    }
                    // pokemon en db
                } else {
                    let infosPoke = fx.query(`SELECT * FROM spawn WHERE id = '${pokeBaie}'`)[0]
                    let statsPoke = fx.getStats(infosPoke.pokemon, infosPoke.niveau, infosPoke.nature)
                    // soigne état
                    if(valeurBaie.valeur < 10) {
                        if(infosPoke.statut == valeurBaie.valeur) {
                        fx.query(`UPDATE spawn SET statut = 0, tempsstatut = 0 WHERE id = '${pokeBaie}'`)
                        endInventaire(`Il a été soigné de ${fx.idStatuts[parseInt(valeurBaie.valeur)]} !`)
                        }
                } else {
                    // le reste en cas par cas.
                    if(valeurBaie.id == 9) {
                        let pv = infosPoke.pv + 10
                        if(pv > statsPoke.pvmax) pv = statsPoke.pvmax
                        fx.query(`UPDATE spawn SET pv = '${pv}' WHERE id = '${pokeBaie}'`)
                        endInventaire(`Il a été soigné de 10 PV !`)
                    }
                    if(valeurBaie.id == 10) {
                        let pv = infosPoke.pv + Math.round(statsPoke.pvmax/4)
                        if(pv > statsPoke.pvmax) pv = pokemonSafe.stats.pvmax
                        fx.query(`UPDATE spawn SET pv = '${pv}' WHERE id = '${pokeBaie}'`)
                        endInventaire(`Il a été soigné de ${Math.round(statsPoke.pvmax/4)} PV !`)
                    }
                    if(valeurBaie.id == 17) {
                        const menuBaieMepo = new discord.MessageSelectMenu()
                        .setCustomId("baiemepo2")
                        .setPlaceholder("Choisissez l'attaque à recharger")
                        let attaquesPoke = fx.query(`SELECT position, nom, AP.pp, A.pp AS ppmax, type, AP.id AS idattaque, classe, degats, prec , typest, cible, statchange, puissance, chance, crit FROM attaquepokemontam AP JOIN attaque A ON AP.attaque = A.id WHERE pokemon = '${pokeBaie}' ORDER BY position ASC`)
                        for(i = 0; i < attaquesPoke.length; i++) {
                            menuBaieMepo.addOptions({ label: attaquesPoke[i].nom.toString(), value: attaquesPoke[i].idattaque.toString(), description: `PP : ${attaquesPoke[i].pp}/${attaquesPoke[i].ppmax} ~ Type/${attaquesPoke[i].type}` });
                        }
                    thread.send({content: "** **",components: [{type: 1,components: [menuBaieMepo]}]})

                    }
                    if(valeurBaie.id == 18) {
                        if(infosPoke.statut != 0 && infosPoke.statut != 6) {
                            endInventaire(`Il a été soigné de ${fx.idStatuts[infosPoke.statut]}`)
                            fx.query(`UPDATE spawn SET statut = 0, tempsstatut = 0 WHERE id = '${pokeBaie}'`)
                        }
                    }
                }
                }
            }

            // combat > sac > potion > baie PP > choix attaque
            if(bouton.customId == "baiemepo") {
                bouton.message.delete()
                attaquesSafe[parseInt(bouton.values[i])] += 10
                if(attaquesSafe[parseInt(bouton.values[i])].pp > attaquesSafe[parseInt(bouton.values[i])].ppmax) attaquesSafe[parseInt(bouton.values[i])].pp = attaquesSafe[parseInt(bouton.values[i])].ppmax
                endInventaire("L'attaque X a regagnée 10 PP !")
            }
            if(bouton.customId == "baiemepo2") {
                bouton.message.delete()
                let infos = fx.query(`SELECT AP.pp, A.pp AS ppmax FROM attaquepokemontam AP JOIN attaque A ON A.id = AP.attaque WHERE AP.id = '${parseInt(bouton.values[0])}'`)[0]
                let pp = infos.pp + 10
                if(pp > infos.ppmax) pp = infos.ppmax
                fx.query(`UPDATE attaquepokemontam SET pp = '${pp}' WHERE id = '${bouton.values[0]}'`)
                endInventaire("L'attaque X a regagnée 10 PP !")
            }
        });

        function endInventaire(desc) {
            let embed = menuBase.embeds[0]
            embed.setImage(null)
            embed.setColor("WHITE")
            embed.setTitle("Menu")
            let description = `${pokemonSafe.nom} utilise ça.\n\n${desc}`
            menuBase.edit({embeds: [embed.setDescription(description)]})
            // refresh embeds poke
            msgPokemons.edit({embeds : [fxcombat.embedPokemon(pokemonSauvage, 1), fxcombat.embedPokemon(pokemonSafe, 0)]})
            finTour()
        }
    }
    async function finTour() {
        collector.stop()
        let fin = await checkMort()
        await fx.sleep(3000)
        if(!fin) {
            if(ordre == 1) tourSauvage(2)
            else finRound()
        }
    }

    }

    function tourSauvage(ordre) {
        console.log("tour sauvage")
            let rand = Math.floor(Math.random()*attaquesSauvage.length)
            let attaque = attaquesSauvage[rand]
            if(!pokemonSauvage.canAttack) {
                console.log("peut pas attaquer")
                menuBase.edit({embeds: [menuBase.embeds[0].setDescription(`${pokemonSauvage.nom} ne peut pas attaquer :/`)]})
            } else {
                resultAttaque = fxcombat.attaque(attaque, pokemonSauvage, pokemonSafe, ordre)
                console.log(resultAttaque)
                msgPokemons.edit({embeds : [fxcombat.embedPokemon(pokemonSauvage, 1), fxcombat.embedPokemon(pokemonSafe, 0)]})
                menuBase.edit({embeds: [menuBase.embeds[0].setDescription(`${pokemonSauvage.nom} utilise ${attaque.nom}\n\n${infos.desc.join('\n')}`)]})
                }
            finTour()
            async function finTour() {
                let fin = await checkMort()
                await fx.sleep(3000)
                if(!fin) {
                    if(ordre == 1) tourSafe(2)
                    else finRound()
                }
            }
        }

    async function finRound() {
        console.log("fin de round")
        let stSafe = fxcombat.checkStatut(pokemonSafe)
        let stSauvage = fxcombat.checkStatut(pokemonSauvage)
        desc = ""
        if(stSafe.desc) desc += `${pokemonSafe.nom}${stSafe.desc}\n\n`
        if(stSauvage.desc) desc += `${pokemonSauvage.nom}${stSauvage.desc}`
        console.log(desc)
        // refresh embeds poke
        msgPokemons.edit({embeds : [fxcombat.embedPokemon(pokemonSauvage, 1), fxcombat.embedPokemon(pokemonSafe, 0)]})
        //checkMort()
        let vitesseS = pokemonSafe.stats.vitesse
        if(pokemonSafe.stats.statut == 3) vitesseS /= 2
        let vitesseE = pokemonSauvage.stats.vitesse
        if(pokemonSauvage.stats.statut == 3) vitesseE /= 2
        let fin = await checkMort()
        await fx.sleep(3000)
        if(!fin) {
            if(vitesseS > vitesseE) tourSafe(1)
            else tourSauvage(1)
        }
    }

    async function checkMort() {
        console.log("CHECKMORT")
        let ret = 0
        if(pokemonSauvage.stats.pv <= 0) {
            ret = 1
            finCombat(1,1)
        }
        if(pokemonSafe.stats.pv <= 0) {
            let ind = pokesFight.indexOf(pokemonSafe.id)
            if(ind > -1) pokesFight.splice(ind, 1)
            pokeKo = 1
            let resultEquipe = fx.query( `SELECT S.position, S.surnom, P.nom AS nomPoke, S.niveau, S.nature, S.pv FROM spawn S JOIN pokemon P ON S.pokemon = P.id WHERE S.utilisateur = '${interaction.user.id}' AND S.equipe = 1 AND S.pv > 0 AND S.id != '${pokemonSafe.id}' ORDER BY S.id ASC`)
                // Si tous les pokes sont morts
                if(resultEquipe.length == 0) {
                    ret = 1
                    finCombat(0,0)
                } else {
                    const menu = new discord.MessageSelectMenu()
                        .setCustomId("changdde-poke-ko")
                        .setPlaceholder("Choisissez un Pokemon à envoyer au combat")
                        for(i = 0; i < resultEquipe.length; i++) {
                            let nom = resultEquipe[i].nomPoke
                            if(resultEquipe[i].surnom) nom = resultEquipe[i].surnom
                            if(resultEquipe[i].pv > 0) menu.addOptions({ label: nom.toString(), value: resultEquipe[i].position.toString(), description: resultEquipe[i].nomPoke });
                        }
                    let msgSelect = await thread.send({content: "** **",components: [{type: 1,components: [menu]}]})
                    const filter = () => true
                    let bouton = await msgSelect.awaitMessageComponent({ filter, componentType: 'SELECT_MENU' })
                        let nouveauPoke = bouton.values[0]
                        // enregistrer poke actuel en db + récupérer infos du nouveau en remplacement + edit embed
                        fx.query(`UPDATE spawn S JOIN pokemon P ON P.id = S.pokemon SET S.pv = '${pokemonSafe.stats.pv}', S.statut = '${pokemonSafe.stats.statut}', S.tempsstatut = '${pokemonSafe.stats.tempsstatut}' WHERE S.id = '${pokemonSafe.id}' AND S.equipe = 1 AND S.utilisateur = '${interaction.user.id}'`)
                        pokemonSafe = fx.getAllInfos(interaction.user, nouveauPoke, 1)
                        if(!pokesFight.includes(pokemonSafe.id)) pokesFight.push(pokemonSafe.id)
                        let newEmbed = fxcombat.embedPokemon(pokemonSafe, 0)
                        msgPokemons.edit({embeds : [embedS, newEmbed]})
                        bouton.message.delete()
                        menuBase.edit({embeds: [menuBase.embeds[0].setDescription(`${pokemonSafe.nom} ! Go !`)]})
                        ret = 0
                    }
                }
        return ret
    }

    async function finCombat(win, attrape) {
        // update pokemon en db 
        fx.query(`UPDATE spawn S JOIN pokemon P ON P.id = S.pokemon SET S.pv = '${pokemonSafe.stats.pv}', S.statut = '${pokemonSafe.stats.statut}', S.tempsstatut = '${pokemonSafe.stats.tempsstatut}' WHERE S.id = '${pokemonSafe.id}' AND S.equipe = 1 AND S.utilisateur = '${interaction.user.id}'`)
        if(win == 1) {
            // gagne xp, embed
            let paramsXp = {
                N: pokemonSauvage.niveau,
                b: 55, // A changer après
                Np: pokemonSafe.niveau,
                t: 1, // a voir si on ajoute les échanges
                e: 1,
                s: pokesFight.length,
                p: 1, // a voir si on ajoute des items de boost xp
                f: 1, // a voir si on ajoute l'affection
                v: 1,
                c: 1 // a voir si on ajoute charme
            }
            let exp1 = (paramsXp.b * paramsXp.N * paramsXp.f * paramsXp.v) / (5 * paramsXp.s)
            let exp2 = ((2 * paramsXp.N + 10)/(paramsXp.N + paramsXp.Np + 10))**2.5
            let exp = Math.round(exp1 * exp2 * paramsXp.t * paramsXp.e * paramsXp.p * paramsXp.c)
            // add xp en db + check
            let query = `SELECT S.id, P.nom, S.pokemon, S.surnom, S.niveau, S.xp, S.nature, S.shiny, S.image, S.pv FROM spawn S JOIN pokemon P ON P.id = S.pokemon WHERE S.id = '${pokesFight[0]}'`
            for(i = 1; i < pokesFight.length; i++) query += ` OR S.id = '${pokesFight[i]}'`
            let pokesXpup = fx.query(query)
            // pour chaque pokemon :
            for(i = 0; i < pokesXpup.length; i++) {
                let pokela = pokesXpup[i]
                if(pokela.surnom) pokela.nom = pokela.surnom
                pokela.xp = parseInt(pokela.xp) + exp
                let infos = fx.checkLevelUp(pokela)
                let desc = `${pokela.nom} gagne ${exp} EXP !\n\n`
                // si lvlup
                if(infos.lvlup) {
                    /* update en local si le combat continue
                    pokemon.niveau = nvLevel
                    pokemon.stats.pvmax += heal */
                    desc += `Il passe au niveau **${infos.lvlup}**\n\n${infos.newStats}`
                }
                let emb = fx.emb(interaction.user, `${pokemonSauvage.nom} est KO`, desc, "GOLD")
                if(attrape) menuBase.edit({embeds: [emb.setTitle(`${pokemonSauvage.nom} est capturé`)]})
                else menuBase.edit({embeds: [emb]})
                fx.query(`UPDATE spawn SET xp = xp + ${exp} WHERE id = '${pokela.id}'`)
                await fx.sleep(4000)
                // si évolue
                if(infos.evo) {
                    await fxcombat.evolue(pokela, menuBase)
                    await fx.sleep(8000)
                }
                if(infos.attaques) {
                    await fxcombat.gagneAttaque(pokela, infos.attaques, menuBase)
                }
            }

            // si multixp : faire pareil avec query 'WHERE equipe = 1 AND id !=' & xp/2

            if(attrape) {
                let nickname = null
                // surnom, enregistre en db
                let embSurnom = fx.emb(interaction.user, "Surnom", `Voulez-vous donner un surnom au ${pokemonSauvage.nom} capturé ?`, "WHITE")
                const rowSurnom = new discord.MessageActionRow().addComponents(
                    new discord.MessageButton()
                        .setCustomId(`oseff-oui`)
                        .setLabel("Oui")
                        .setStyle("SUCCESS"),
                    new discord.MessageButton()
                        .setCustomId(`oseff-non`)
                        .setLabel("Non")
                        .setStyle("DANGER")
                )
                let quest
                async function attSurnom() {
                quest = await thread.send({embeds: [embSurnom], components: [rowSurnom]})
                const filter = () => true
                let reponse = await quest.awaitMessageComponent({ filter, componentType: 'BUTTON' })
                if(reponse.customId == "oseff-oui") {
                    quest.edit({embeds: [embSurnom.setDescription("Ecrivez le surnom désiré ou 'annuler' pour ne pas donner de surnom à ce Pokémon")]})
                    // collector
                    let collector = await thread.awaitMessages({filter: filter, max:1})
                    nicknamebrut = collector.first().content
                    console.log(nicknamebrut)
                    let splits = nicknamebrut.split(" ")
                    console.log(splits)
                    nickname = splits[0]
                    // SQL EXPLOIT => if(nickname.toLowerCase().includes("insert") || nickname.toLowerCase().includes("update") || nickname.toLowerCase().includes("select") || nickname.toLowerCase().includes("delete") || nickname.toLowerCase().includes("drop") || nickname.toLowerCase().includes("truncate") || nickname.toLowerCase().includes("table") || nickname.toLowerCase().includes("from")) nickname = null
                }
            }
                await attSurnom()
                // ajout en db du pokemon : soit equipe soit pc
                let infosNeed = fx.query(`SELECT COUNT(*) AS count, U.id FROM spawn S JOIN utilisateur U ON U.discordid = S.utilisateur WHERE S.equipe = 1 AND U.discordid = '${interaction.user.id}'`)[0]
                let equipe = infosNeed.count >= 6 ? 0 : 1
                let position
                if(equipe) position = infosNeed.count + 1
                else {
                    let infosPc = fx.query(`SELECT position FROM spawn WHERE equipe = 0 AND utilisateur = '${interaction.user.id}' ORDER BY position DESC`)
                    position = infosPc.length > 0 ? infosPc[0].position + 1 : 1
                }
                if(nickname) fx.query(`INSERT INTO spawn(utilisateur, pokemon, surnom, niveau, xp, sexe, nature, shiny, image, pv, equipe, position, statut, tempsstatut) VALUES ('${interaction.user.id}', '${pokemonSauvage.id}', '${nickname}', '${pokemonSauvage.niveau}', '${pokemonSauvage.xp}', '${pokemonSauvage.sexe}', '${pokemonSauvage.nature}', '${pokemonSauvage.shiny}', '${pokemonSauvage.image}', '${pokemonSauvage.stats.pv}', '${equipe}', '${position}', '${pokemonSauvage.stats.statut}', '${pokemonSauvage.stats.tempsstatut}')`)
                else fx.query(`INSERT INTO spawn(utilisateur, pokemon, niveau, xp, sexe, nature, shiny, image, pv, equipe, position, statut, tempsstatut) VALUES ('${interaction.user.id}', '${pokemonSauvage.id}', '${pokemonSauvage.niveau}', '${pokemonSauvage.xp}', '${pokemonSauvage.sexe}', '${pokemonSauvage.nature}', '${pokemonSauvage.shiny}', '${pokemonSauvage.image}', '${pokemonSauvage.stats.pv}', '${equipe}', '${position}', '${pokemonSauvage.stats.statut}', '${pokemonSauvage.stats.tempsstatut}')`)
                let ouidesc = (equipe == 1) ? "l'équipe !" : "le PC comme il n'y a plus de place dans l'équipe !"
                console.log(ouidesc)
                quest.edit({embeds: [fx.emb(interaction.user, "Surnom", `Le pokemon a été ajouté dans ${ouidesc}`, "WHITE")]})
            }
        } else {
                menuBase.edit({embeds: [fx.emb(interaction.user, "Défaite !", "Tu as perdu le combat, tout tes Pokémons sont KO..", "RED")]})
            // delete
        }
    }
    
}


exports.help = {
    shown: true,
    name: "spawn",
    description: "Fait apparaître un Pokemon",
    args: "Aucun",
    cooldown: "Aucun",
    category: "/"
}