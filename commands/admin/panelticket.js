const {
  SlashCommandBuilder,
  ContainerBuilder, TextDisplayBuilder, SectionBuilder,
  MediaGalleryBuilder, MediaGalleryItemBuilder,
  SeparatorBuilder, ThumbnailBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,
} = require('discord.js');
const path = require('path');
const { ADMIN_ROLE_ID } = require(path.join(__dirname, '../../config.json'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panelticket')
    .setDescription('Menampilkan panel ticket untuk pendaftaran PC & Andro (Components V2).')
    .addStringOption(option =>
      option.setName('image').setDescription('Menambahkan gambar dengan URL (opsional)').setRequired(false)),

  async execute(interaction) {
    try {
      // ── Cek Izin Admin (menggunakan config.json) ──────────────────────────
      if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
          content: '❌ Kamu tidak memiliki izin untuk menjalankan perintah ini.',
          ephemeral: true,
        });
      }

      const imageUrl = interaction.options.getString('image');
      
      // Container utama Components V2 (tanpa setAccentColor agar bersih)
      const container = new ContainerBuilder();

      // ── Header dengan thumbnail guild icon ────────────────────────────────
      const iconURL = interaction.guild.iconURL({ dynamic: true });
      if (iconURL) {
        container.addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                '# 🎟️ HOUSE RAJELL Ticket\n'
                + 'Klik tombol di bawah untuk melakukan pendaftaran sesuai perangkat Anda:\n\n'
                + '-# _Dilarang mempermainkan ticket!!_',
              ),
            )
            .setThumbnailAccessory(
              new ThumbnailBuilder().setURL(iconURL),
            ),
        );
      } else {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# 🎟️ HOUSE RAJELL Ticket'),
        );
      }

      // ── Banner Image (jika opsi image diisi) ──────────────────────────────
      if (imageUrl) {
        container.addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(imageUrl),
          ),
        );
      }

      // ── Footer ────────────────────────────────____________________________
      container
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('-# © HOUSE RAJELL'),
        );

      // ── Tombol Kategori Pendaftaran ───────────────────────────────────────
      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('pendaftaran_pc')
            .setLabel('Pendaftaran PC')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('pendaftaran_andro')
            .setLabel('Pendaftaran Andro')
            .setStyle(ButtonStyle.Success),
        ),
      );

      // ── Kirim Panel ke Channel menggunakan Components V2 ──────────────────
      await interaction.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });

      return interaction.reply({
        content: '✅ Panel ticket berhasil dipasang!',
        ephemeral: true,
      });

    } catch (error) {
      console.error('Error in panelticket command:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Terjadi kesalahan saat menampilkan panel ticket.',
          ephemeral: true,
        });
      }
    }
  },
};
