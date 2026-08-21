const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const { ADMIN_ROLE_ID } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Membuat custom embed')

    .addStringOption(option =>
      option
        .setName('judul')
        .setDescription('Judul embed')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('deskripsi')
        .setDescription('Isi embed')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('warna')
        .setDescription('Warna HEX (#ff0000)')
        .setRequired(false)
    )

    .addStringOption(option =>
      option
        .setName('foto')
        .setDescription('URL gambar')
        .setRequired(false)
    )

    .addStringOption(option =>
      option
        .setName('mention')
        .setDescription('Pilih mention')
        .setRequired(false)
        .addChoices(
          {
            name: '@everyone',
            value: 'everyone'
          },
          {
            name: '@here',
            value: 'here'
          }
        )
    ),

  async execute(interaction) {

    const hasAdminRole =
      ADMIN_ROLE_ID &&
      interaction.member.roles.cache.has(ADMIN_ROLE_ID);

    if (!hasAdminRole) {
      return interaction.reply({
        content: 'â Kamu tidak memiliki izin menggunakan command ini.',
        ephemeral: true
      });
    }

    const judul = interaction.options.getString('judul');
    const deskripsi = interaction.options.getString('deskripsi');
    const warnaInput =
      interaction.options.getString('warna') || '#3498db';
    const foto =
      interaction.options.getString('foto');
    const mentionType =
      interaction.options.getString('mention');

    let warnaHex = parseInt(
      warnaInput.replace('#', ''),
      16
    );

    if (isNaN(warnaHex)) {
      warnaHex = 0x3498db;
    }

    const embed = new EmbedBuilder()
      .setTitle(judul)
      .setDescription(deskripsi)
      .setColor(warnaHex)
      .setTimestamp();

    if (foto) {
      embed.setImage(foto);
    }

    let content;

    if (mentionType === 'everyone') {
      content = '@everyone';
    } else if (mentionType === 'here') {
      content = '@here';
    }

    await interaction.deferReply({
      ephemeral: true
    });

    await interaction.channel.send({
      content,
      embeds: [embed],
      allowedMentions: {
        parse: ['everyone']
      }
    });

    await interaction.deleteReply();
  }
};