const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const config = require('../config.json');

module.exports = (client) => {

  global.client = client;

  process.on('uncaughtException', async (err) => {
    const channel = await client.channels.fetch(config.statusChannelId).catch(() => null);
    if (!channel) return;

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          '# ❌ Uncaught Exception\n\n'
          + `\`\`\`js\n${err.message}\n\`\`\``
        )
      );

    channel.send({ 
      components: [container], 
      flags: MessageFlags.IsComponentsV2 
    });
    console.error(err);
  });

  process.on('unhandledRejection', async (reason) => {
    const channel = await client.channels.fetch(config.logChannelId).catch(() => null);
    if (!channel) return;

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          '# ⚠️ Unhandled Promise Rejection\n\n'
          + `\`\`\`js\n${reason}\n\`\`\``
        )
      );

    channel.send({ 
      components: [container], 
      flags: MessageFlags.IsComponentsV2 
    });
    console.error(reason);
  });
};
