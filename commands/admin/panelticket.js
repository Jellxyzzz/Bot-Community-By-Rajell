const {
  SlashCommandBuilder,
  ContainerBuilder, TextDisplayBuilder,
  MediaGalleryBuilder, MediaGalleryItemBuilder,
  SeparatorBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,
} = require('discord.js');
const path = require('path');
const { ADMIN_ROLE_ID } = require(path.join(__dirname, '../../config.json'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panelticket')
    .setDescription('Menampilkan panel ticket pendaftaran lengkap dengan ketentuan trial.'),

  async execute(interaction) {
    try {
      // ── Cek Izin Admin ───────────────────────────────────────────────────
      if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
          content: '❌ Kamu tidak memiliki izin untuk menjalankan perintah ini.',
          ephemeral: true,
        });
      }

      // ── URL Banner (Silakan ganti link di bawah sesuai kebutuhan) ───────
      const BANNER_REGISTER_URL = 'https://cdn.discordapp.com/attachments/1535983525050974288/1540242602677379092/pixellab_2026-08-21T06-12-54Z.png?ex=6a893e34&is=6a87ecb4&hm=d07ae76c4a68598fd3689c0e768642cabb3e981e17e7abd056514a4025208736&';
      const BANNER_TRIAL_URL = 'https://cdn.discordapp.com/attachments/1535983525050974288/1540242609342120027/pixellab_2026-08-21T06-13-59Z.png?ex=6a893e36&is=6a87ecb6&hm=9a6707e9f4fcc762f426b22ab1adc035a901275c1a8c6d95fe557121328ed16b&';

      // ==========================================
      // CONTAINER 1: PANEL REGISTER & CARA DAFTAR
      // ==========================================
      const container1 = new ContainerBuilder();

      if (BANNER_REGISTER_URL) {
        container1.addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(BANNER_REGISTER_URL),
          ),
        );
      }

      container1.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          'Silakan tekan tombol di bawah ini untuk mengisi formulir pendaftaran. **Dilarang keras melakukan penyalahgunaan tombol (button abuse).**\n\n'
          + 'Panduan Pendaftaran:\n'
          + '1. Pilih dan klik tombol yang sesuai dengan perangkat yang Anda gunakan.\n'
          + '2. Lengkapi seluruh kolom formulir yang tersedia dengan data yang valid.\n'
          + '3. Kirimkan formulir tersebut, dan data akan otomatis diteruskan ke https://discordapp.com/channels/1524118372038737980/1535983526472847400.\n'
          + '4. Harap menunggu hingga pihak manajemen menghubungi Anda untuk tahap interview.'
        )
      );

      // ==========================================
      // CONTAINER 2: TRIAL TERMS (ATURAN 1 - 9)
      // ==========================================
      const container2 = new ContainerBuilder();

      if (BANNER_TRIAL_URL) {
        container2.addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(BANNER_TRIAL_URL),
          ),
        );
      }

      container2
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            '**[ 1. Menjaga Adab dan Saling Menghargai ]**\n'
            + '> Etika dalam berinteraksi wajib dijaga demi kenyamanan bersama. Komunitas ini tidak hanya berfokus pada skill kompetitif, melainkan juga solidaritas. Bercanda atau gurauan sesama member masih ditoleransi jika sudah akrab, namun tetap tahu batas wajar.\n\n'
            + '---'
            + '\n**[ 2. Keaktifan Selama Masa Percobaan (Trial) ]**\n'
            + '> Seluruh trial diwajibkan untuk selalu hadir dan aktif berpartisipasi dalam berbagai agenda kompetitif, seperti scrim maupun tournament, mengingat status kalian yang masih dalam tahap evaluasi.\n\n'
            + '---'
            + '\n**[ 3. Larangan Keras Menggunakan Program/File Ilegal ]**\n'
            + '> Segala bentuk tindakan curang yang memberikan keuntungan instan sangat dilarang. Ini mencakup penggunaan aimlock, no recoil, modifikasi tekstur ilegal, serta aplikasi pihak ketiga sejenisnya.\n\n'
            + '---'
            + '\n**[ 4. Menguasai Fundamental Kompetitif SA:MP ]**\n'
            + '> Kandidat trial harus sudah menguasai teknik dasar pertempuran di GTA, seperti C-Bug, C-Shoot, Wall Shoot, dan Litefoot. Skill ini merupakan standar wajib untuk membuktikan kesiapan kalian terjun di scene kompetitif SA:MP.\n\n'
            + '---'
            + '\n**[ 5. Eksklusivitas Keanggotaan (Anti-Dual Community/Clan) ]**\n'
            + '> Peserta trial dilarang keras bergabung atau aktif di dua komunitas, team, clan, atau fam secara bersamaan. Segala bentuk keterlibatan ganda di kancah kompetitif SA:MP akan langsung dikategorikan sebagai Dual.\n\n'
            + '---'
            + '\n**[ 6. Bebas dari Jejak Cheat ]**\n'
            + '> Calon anggota dipastikan tidak memiliki rekam jejak atau riwayat pernah menggunakan file ilegal/cheat di turnamen maupun komunitas manapun sebelumnya.\n\n'
            + '---'
            + '\n**[ 7. Mudah Beradaptasi dan Asik Diajak Ngobrol ]**\n'
            + '> Kalian diharapkan untuk tidak bersikap pasif atau tertutup di lingkungan yang baru. Jangan ragu untuk mencairkan suasana atau menyapa duluan, karena kami selalu menyambut member baru dengan tangan terbuka.\n\n'
            + '---'
            + '\n**[ 8. Ketentuan Rekaman Gameplay (Client Spesifik) ]**\n'
            + '> Bukti video wajib direkam memakai client SW:AC (bagi pengguna PC) dan Alyn 10.0.6 (bagi pengguna Android).\n'
            + '> Perekaman dilakukan di server SW:DM Mode Deathmatch tanpa editan/potongan video, berdurasi minimal 3 menit, serta wajib dikirim maksimal 7 hari setelah video direkam.\n\n'
            + '---'
            + '\n**[ 9. Loyalitas dan Kepatuhan pada Aturan ]**\n'
            + '> Setiap member wajib menaati dan menghormati seluruh regulasi yang berlaku di House Rajell yang telah disepakati bersama.'
          )
        );

      // ==========================================
      // CONTAINER 3: ATTENTION & TOMBOL PC / ANDRO
      // ==========================================
      const container3 = new ContainerBuilder();

      container3
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            '**Attention**\n'
            + 'Jika Anda mengalami kendala atau masalah pada bot House Rajell Support, silakan langsung hubungi Discord <@549527626281385984>.'
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('pendaftaran_pc')
              .setLabel('PC/Laptop')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('pendaftaran_andro')
              .setLabel('Android')
              .setStyle(ButtonStyle.Success),
          ),
        );

      // ── Kirim 3 Container secara berurutan ke Channel ────────────────────
      await interaction.channel.send({
        components: [container1],
        flags: MessageFlags.IsComponentsV2,
      });

      await interaction.channel.send({
        components: [container2],
        flags: MessageFlags.IsComponentsV2,
      });

      await interaction.channel.send({
        components: [container3],
        flags: MessageFlags.IsComponentsV2,
      });

      return interaction.reply({
        content: '✅ Panel ticket dan rules trial berhasil dipasang!',
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
