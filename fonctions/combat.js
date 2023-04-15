const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { emb } = require('./fonctions');
const fx = require("./fonctions")
module.exports = {
    
    embedPokemon: function(pokemon, sauvage) {
        let embed = new MessageEmbed()
        let emoji = pokemon.sexe == 1 ? fx.emojis.masculin : fx.emojis.feminin  
        if(sauvage) embed.setDescription(`${pokemon.nom} ${emoji}  Nv. ${pokemon.niveau}\n\nPV : ${fx.getVieAff(pokemon.stats.pv, pokemon.stats.pvmax, fx.client)}`)
        else embed.setDescription(`${pokemon.nom} ${emoji} Nv. ${pokemon.niveau}\n\nPV : ${fx.getVieAff(pokemon.stats.pv, pokemon.stats.pvmax, fx.client)} ${pokemon.stats.pv}/${pokemon.stats.pvmax}\n` + "`Exp.`" + `${fx.emojis.test}${fx.emojis.test2}${fx.emojis.test2}${fx.emojis.test2}${fx.emojis.test3}${fx.emojis.test3}${fx.emojis.test3}${fx.emojis.test3}${fx.emojis.test3}`)
        if(pokemon.image) embed.setImage(pokemon.image)
        if(sauvage) embed.setTitle(`Un ${pokemon.nom} sauvage apparaît !`)
        else embed.setTitle(`Vous envoyez ${pokemon.nom} au combat`)
        return embed
    },

    attaque: function(attaque, pokemon, ennemi, ordre) {
        infos = {
            update: 0,
            desc: []
        }
        attaque.pp--

        // calcul si attaque échoue
        let PreC = attaque.prec
        let PreA = fx.esquiveprecision[pokemon.stats.precision]
        let esq = fx.esquiveprecision[ennemi.stats.esquive]
        pReussite = Math.round(PreC * (PreA/esq))
        
        let rand = Math.floor(Math.random()*100)
        if(pReussite < rand) {
            infos.desc.push("L'attaque a échouée")
            return infos

        } else {

            // si dégats =>
            if(attaque.degats > 0) {
                // calcul dégats à mettre
                let stab = 1
                if(attaque.type == pokemon.type || attaque.type == pokemon.type2) stab = 1.5
                let crit = 1
                if(fx.isCrit(attaque.crit)) crit = 1.5
                let randys = Math.floor((Math.random()*16)+85)/100
                let efficacite = fx.efficaciteTypes[attaque.type][ennemi.type]
                if(ennemi.type2) efficacite*= fx.efficaciteTypes[attaque.type][ennemi.type2]
                let CM = stab * efficacite * crit * randys

                let att = pokemon.stats.attaque
                let def = ennemi.stats.defense
                if(attaque.classe == "Sp") {
                    att = pokemon.stats.attaqueSpeciale
                    def = ennemi.stats.defenseSpeciale
                }
                // check brulure
                if(pokemon.stats.statut == 1) att /= 2

                let degats = Math.ceil((((pokemon.niveau*0.4+2) * att * attaque.degats)/(def * 50)) * CM)
                
                ennemi.stats.pv-= degats
                if(ennemi.stats.pv < 0) ennemi.stats.pv = 0

                let eff = stab * efficacite
                let descEff = ""
                if(crit == 1.5) descEff += "Coup Critique !\n"
                if(eff == 0) descEff = "Ce n'est pas du tout efficace !"
                if(eff > 0 && eff < 1) descEff = "Ce n'est pas très efficace !"
                if(eff >= 2 && eff <= 3) descEff = "C'est très efficace !"
                if(eff >= 4 && eff <= 6) descEff = "C'est super efficace !"

                infos.desc.push(`${descEff}`)
                infos.update = 1

            }
            
            // si changestatut : (vérifier immunité)
                if(attaque.typest == "statut") {
                    let rand = Math.floor(Math.random()*100)
                    if(attaque.chancestatut > rand) {
                        let cible = ennemi
                        if(attaque.cible == "pokemon") cible = pokemon
                        let immune = fx.immuniteStatut[attaque.statchange]
                        if(!immune.includes(cible.type) && !immune.includes(cible.type2) && cible.stats.statut == 0) {
                            cible.stats.statut = parseInt(attaque.statchange)
                            if(attaque.statchange == 5) {
                                if(ordre == 1) cible.stats.tempsstatut = parseInt(Math.floor(Math.random()*3)+1)
                                if(ordre == 2) cible.stats.tempsstatut = parseInt(Math.floor(Math.random()*3)+2)
                            }
                            if(attaque.statchange == 2 || attaque.statchange == 5) cible.canAttack = 0
                            if(attaque.statchange == 3) {
                                let randd = Math.floor(Math.random()*4)
                                if(randd == 1) cible.canAttack = 0
                            }
                            infos.desc.push(`${cible.nom} désormais ${fx.idStatuts[attaque.statchange]}`)
                        } else {
                            infos.desc.push(`${cible.nom} est immunisé contre ce statut ou est déjà altéré !`)
                        }
                    }
                }
            // si changestats
                if(attaque.typest == "stats") {
                    let rand = Math.floor(Math.random()*100)
                    if(attaque.chancestats  > rand) {
                        let cible = ennemi
                        if(attaque.cible == "pokemon") cible = pokemon
                        let stat = attaque.statchange
                        let puissance = attaque.puissance
                        cible.upgrades[stat] += parseInt(puissance)
                        let nvstat = fx.getStats(cible.id, cible.niveau + cible.upgrades[stat], cible.nature)[stat]
                        cible.stats[stat] = nvstat
                        let signe = "augmente"
                        if(puissance < 0) signe = "baisse"
                        infos.desc.push(`${stat} de ${cible.nom} ${signe} !`)
                    }
                }

            // Ajouter ici les attaques particulières LUL
            return infos
        }
    },

    checkStatut: function(pokemon) {
        let statut = pokemon.stats.statut
        let infos = {
            attaque: 1,
            desc: null,
            update: 0
        }
        if(statut == 1) {
            let seizieme = Math.round(pokemon.stats.pvmax / 16)
            pokemon.stats.pv -= seizieme
            infos.update = 1
        }

        if(statut == 2) {
            let randy = (Math.floor(Math.random() * 5))
            if(randy == 4) {
                pokemon.canAttack = 1
                infos.desc = " vient de dégeler ! Il peut à nouveau attaquer"
            } else {
                ipokemon.canAttack = 0
                infos.desc = " est gelé ! Il ne peut pas attaquer pour le moment"
            }
            
        }

        if(statut == 3) {
            let randy = (Math.floor(Math.random() * 4))
            if(randy == 2) {
                pokemon.canAttack = 0
                infos.desc = " est paralysé ! Il ne peut pas attaquer pour le moment"
            } else {
                pokemon.canAttack = 1
                infos.desc = " est paralysé ! Sa vitesse est grandement réduite pour le moment"
            }
        }

        if(statut == 4) {
            let huitieme = Math.round(pokemon.stats.pvmax / 8)
            pokemon.stats.pv -= huitieme
            infos.desc = ` est empoisonné ! Il perd ${huitieme} PV`
            infos.update = 1
        }

        if(statut == 5) {
            pokemon.stats.tempsstatut--
            if(pokemon.stats.tempsstatut > 0) {
                pokemon.canAttack = 0
                infos.desc = " est endormi ! Il ne peut pas attaquer pour le moment"
            } else {
                pokemon.canAttack = 1
                infos.desc = " vient de se réveiller !"
                pokemon.stats.statut = 0
            }
        }

        return infos
    },

    capture: function(pokemon, tauxball) {
        let capture = false
        pvactu = pokemon.stats.pv
        pvmax = pokemon.stats.pvmax
        t = pokemon.tauxcapture
        bstatut = 1
        if(pokemon.stats.statut == 1 || pokemon.stats.statut == 3 || pokemon.stats.statut == 4) bstatut = 1.5
        if(pokemon.stats.statut == 2 || pokemon.stats.statut == 5) bstatut = 2.5
        let a = (1 - 2/3 * (pvactu/pvmax)) * t * tauxball * bstatut
        if(a >= 255) capture = true
        else {
            let b = 65535 * Math.pow(a/255, 1/4)
            let compteur = 0
            for(i = 0; i < 4; i++) {
                let randys = Math.floor(Math.random()*65535)
                if(randys <= b) compteur++
            }
            if(compteur == 4) capture = true
        }

        return capture

    },

    evolue: async function(pokemon, message) {
        let evo = fx.query(`SELECT *, P.id AS pid FROM pokemon P JOIN evolution E ON P.id = E.evolution WHERE E.pokemon = '${pokemon.pokemon}'`)[0]
        let imageevo = evo.image
        if(pokemon.shiny) imageevo = evo.image_shiny

        let embed = new MessageEmbed()
        .setTitle("Évolution")
        .setDescription(`Quoi ? ${pokemon.nom} évolue !\n\n`)
        .setImage(pokemon.image)
        msgEvo = await message.channel.send({embeds: [embed]})

        setTimeout(() => {
            msgEvo.edit({embeds: [embed.setDescription(embed.description + ".... ")]})
        }, 2000);

        setTimeout(() => {
            msgEvo.edit({embeds: [embed.setDescription(embed.description + ".... ")]})
        }, 4000);

        setTimeout(() => {
            embed.setImage(imageevo)
            msgEvo.edit({embeds: [embed.setDescription(`Félicitations ! Votre ${pokemon.nom} évolue en ${evo.nom} !`)]})
        }, 5500);

        // update db spawn: 
        fx.query(`UPDATE spawn SET pokemon = '${evo.pid}', image = '${imageevo}' WHERE id = '${pokemon.id}'`)
    },

    gagneAttaque: async function(pokemon, attaques, message) {
        let attaquesPoke = fx.query(`SELECT *, AP.id AS apid FROM attaquepokemontam AP JOIN attaque A ON A.id = AP.attaque WHERE AP.pokemon = '${pokemon.id}' ORDER BY AP.position ASC`)
       // console.log(attaquesPoke)
        let nbAttaquesPoke = attaquesPoke.length
        // Pour chaque attaque à apprendre
        for(i = 0; i < attaques.length; i++) {
            let attaque = attaques[i]
            // si slot libre : donne (update compteur, insert db, écrit)


            
            if(nbAttaquesPoke < 4) {
                nbAttaquesPoke++
                fx.query(`INSERT INTO attaquepokemontam(pokemon, attaque, pp, position) VALUES('${pokemon.id}', '${attaque.attaque}', '${attaque.pp}', '${nbAttaquesPoke}')`)
                let embed = new MessageEmbed()
                .setColor("DARK_BLUE")
                .setTitle("Nouvelle capacité")
                .setDescription(`${pokemon.nom } apprend ${attaque.nom}`)
                message.edit({embeds: [embed]})
                fx.sleep(3500)
            // si pas slot libre : propose pour remplacer
            } else {
                
                let embed = new MessageEmbed()
                .setColor("DARK_BLUE")
                .setTitle("Nouvelle capacité")
                .setDescription(`${pokemon.nom} tente d'apprendre ${attaque.nom}\nMais il ne peut pas avoir plus de quatre capacités.\n\nEffacer une ancienne capacité pour apprendre ${attaque.nom} ?`)

                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId(`osef-oui`)
                        .setLabel("Oui")
                        .setStyle("SUCCESS"),
                    new MessageButton()
                        .setCustomId(`osef-non`)
                        .setLabel("Non")
                        .setStyle("DANGER")
                )

                let question = await message.channel.send({embeds: [embed], components: [row]})
                const filter = () => true
                await selectChangeAttaque()
                async function selectChangeAttaque() {
                    let reponse = await question.awaitMessageComponent({ filter, componentType: 'BUTTON' })
                    if(reponse.customId == "osef-oui") {
                        const menu = new MessageSelectMenu()
                            .setCustomId("osef-menu")
                            .setPlaceholder("Choisissez une capacité à oublier")
                            for(j = 0; j < attaquesPoke.length; j++) {
                                menu.addOptions({ label: attaquesPoke[j].nom.toString(), value: j.toString(), description: `PP : ${attaquesPoke[j].pp} ~ Type/${attaquesPoke[j].type}` });
                            }
                            menu.addOptions({ label: "annuler", value: "annuler", description: `Ne pas oublier de capacité` });
                            let men = await message.channel.send({content: "** **",components: [{type: 1,components: [menu]}]})
                            let collect = await men.awaitMessageComponent({ filter, componentType: 'SELECT_MENU' })
                            men.delete()
                            let oubli = collect.values[0]
                            if(oubli == "annuler") {
                                selectChangeAttaque()
                            } else {
                                fx.query(`UPDATE attaquepokemontam SET attaque = '${attaque.attaque}', pp = '${attaque.pp}' WHERE id = '${attaquesPoke[oubli].apid}'`)
                                question.edit({embeds:[embed.setDescription(`1, 2, et..... Tada !\n\n${pokemon.nom} oublie ${attaquesPoke[oubli].nom} et apprend ${attaque.nom} !`)]})
                                row.components[0].setDisabled(true)
                            }
                    } else {
                        question.edit({embeds:[embed.setDescription(`${pokemon.nom} arrête d'apprendre ${attaque.nom} !`)]})
                    }
                }
            }
            return 4

        }
        /*
        XX tente d'apprendre XX
        Mais XX ne peut pas avoir plus de quatre capacités
        Effacer une ancienne capacité pour apprendre XX ?
        1,2 et..... Tadaa !
        XX oublie XX et apprend XX !
        DOnner un surnom au XX capturé ?
        */
    },

    pokemonsFight: {},

    name: "combat",

}
