const fx = require("../fonctions/fonctions")
module.exports = client => {
  client.user.setPresence({ activities: [{ name: 'UwU', type: 'PLAYING' }], status: 'online' });

  fx.setClient(client)

    console.log('Good !');

}