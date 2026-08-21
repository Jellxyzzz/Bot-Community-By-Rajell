const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const config = require('../config.json');

module.exports = (client) => {
  client.on('ready', async () => {
    const channel = await client.channels.fetch(config.statusChannelId).catch(() => null);
    if (!channel) return;

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          '# 🟢 Bot Online\n\n'
          + '```Bot sekarang sudah online!```'
        )
      );

    channel.send({ 
      components: [container], 
      flags: MessageFlags.IsComponentsV2 
    });
  });

  client.on('shardDisconnect', async () => {
    const channel = await client.channels.fetch(config.logChannelId).catch(() => null);
    if (!channel) return;

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          '# 🔴 Bot Offline\n\n'
          + '```Bot mengalami disconnect dari shard.```'
        )
      );

    channel.send({ 
      components: [container], 
      flags: MessageFlags.IsComponentsV2 
    });
  });

  const sendOfflineStatus = async () => {
    const channel = await client.channels.fetch(config.logChannelId).catch(() => null);
    if (!channel) return;

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          '# 🔴 Bot Offline\n\n'
          + '```Bot offline (exit process).```'
        )
      );

    try {
      await channel.send({ 
        components: [container], 
        flags: MessageFlags.IsComponentsV2 
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error('Gagal mengirim status OFFLINE:', err);
    }
  };

  process.on('exit', sendOfflineStatus);
  process.on('SIGINT', async () => {
    await sendOfflineStatus();
    process.exit();
  });
  process.on('SIGTERM', async () => {
    await sendOfflineStatus();
    process.exit();
  });
};
