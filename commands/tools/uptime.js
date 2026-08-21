const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Menampilkan lama bot sudah online'),

  async execute(interaction) {
    const totalSeconds = Math.floor(process.uptime());
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;

    const uptimeString = `${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik`;

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          '# 📊 Uptime Bot\n\n'
          + `Bot telah online selama:\n**${uptimeString}**`
        )
      );

    await interaction.reply({ 
      components: [container], 
      flags: MessageFlags.IsComponentsV2 
    });
  }
};
