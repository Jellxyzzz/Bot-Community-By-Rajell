const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ContainerBuilder, TextDisplayBuilder, 
  SeparatorBuilder, MessageFlags
} = require('discord.js');
const { 
  PENGURUS_ROLE_ID, 
  ChannelLogTicketId,
  ThreadPcId,
  ThreadAndroId
} = require('../config.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    const { customId, guild, user } = interaction;
    
    try {
      // ── Ketika Tombol PC / Andro diklik, Munculkan Modal Form ──
      if (customId === 'pendaftaran_pc' || customId === 'pendaftaran_andro') {
        const ticketTypeLabel = customId === 'pendaftaran_pc' ? 'Pendaftaran PC' : 'Pendaftaran Andro';

        const modal = new ModalBuilder()
          .setCustomId(`modal_${customId}`)
          .setTitle(`Formulir Register House Rajell (${ticketTypeLabel === 'Pendaftaran PC' ? 'PC' : 'Android'})`);

        const namaInput = new TextInputBuilder()
          .setCustomId('reg_nama')
          .setLabel('Nama')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Masukkan nama asli kamu')
          .setRequired(true);

        const asalInput = new TextInputBuilder()
          .setCustomId('reg_asal')
          .setLabel('Asal')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Contoh: Indo / Malay')
          .setRequired(true);

        const umurInput = new TextInputBuilder()
          .setCustomId('reg_umur')
          .setLabel('Umur')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Contoh: 19')
          .setRequired(true);

        const alasanInput = new TextInputBuilder()
          .setCustomId('reg_alasan')
          .setLabel('Alasan')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Alasan ingin bergabung')
          .setRequired(true);

        const gameplayInput = new TextInputBuilder()
          .setCustomId('reg_gameplay')
          .setLabel('Link Gameplay')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Link TikTok / YouTube / Video')
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(namaInput),
          new ActionRowBuilder().addComponents(asalInput),
          new ActionRowBuilder().addComponents(umurInput),
          new ActionRowBuilder().addComponents(alasanInput),
          new ActionRowBuilder().addComponents(gameplayInput)
        );

        return await interaction.showModal(modal);
      }

      // ── Handle Submit Modal Pendaftaran -> Kirim HANYA ke Thread yang Sesuai ──
      if (customId === 'modal_pendaftaran_pc' || customId === 'modal_pendaftaran_andro') {
        const isPc = customId === 'modal_pendaftaran_pc';
        const ticketTypeLabel = isPc ? 'Pendaftaran PC' : 'Pendaftaran Andro';
        
        const nama = interaction.fields.getTextInputValue('reg_nama');
        const asal = interaction.fields.getTextInputValue('reg_asal');
        const umur = interaction.fields.getTextInputValue('reg_umur');
        const alasan = interaction.fields.getTextInputValue('reg_alasan');
        const gameplay = interaction.fields.getTextInputValue('reg_gameplay');

        await interaction.deferReply({ ephemeral: true });

        // Pilih target thread secara spesifik berdasarkan pilihan user (PC atau Android)
        const targetThreadId = isPc ? ThreadPcId : ThreadAndroId;
        const targetThread = guild.channels.cache.get(targetThreadId);

        if (!targetThread) {
          return interaction.editReply({ 
            content: `❌ Gagal mengirim! ID Thread untuk ${ticketTypeLabel} belum diatur dengan benar di ` + (isPc ? '`ThreadPcId`' : '`ThreadAndroId`') + ' `config.json`.' 
          });
        }

        // 1. Kirim pesan pertama khusus untuk Mention (di luar kotak/kontainer)
        await targetThread.send({ 
          content: `<@&${PENGURUS_ROLE_ID}> <@${user.id}>` 
        });

        // Tampilan pesan formulir di dalam container V2 (tanpa mention)
        const ticketContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              '### Formulir Register House Rajell\n\n'
              + `**Nama :** ${nama}\n`
              + `**Asal :** ${asal}\n`
              + `**Umur :** ${umur}\n`
              + `**Alasan :** ${alasan}\n\n`
              + `**Gameplay :** ${gameplay}\n\n`
              + '-# House Rajell | Community Samp'
            )
          )
          .addSeparatorComponents(new SeparatorBuilder());

        // 2. Kirim pesan kedua khusus untuk Kontainer V2
        await targetThread.send({ 
          components: [ticketContainer], 
          flags: MessageFlags.IsComponentsV2 
        });

        await interaction.editReply({ 
          content: `✅ Formulir pendaftaran **${ticketTypeLabel}** berhasil dikirim ke dalam thread!` 
        });

        // Kirim log aktivitas ke admin log channel jika ada
        const logChannel = guild.channels.cache.get(ChannelLogTicketId);
        if (logChannel) {
          const logContainer = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                '# 📥 Formulir Baru Masuk (Thread)\n\n'
                + `> **User:** <@${user.id}>\n`
                + `> **Tipe:** \`${ticketTypeLabel}\``
              )
            );
          
          await logChannel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 }).catch(console.error);
        }
      }

    } catch (error) {
      console.error('Error in interaction handler:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Terjadi kesalahan saat memproses permintaan.', ephemeral: true }).catch(console.error);
      } else if (interaction.deferred) {
        await interaction.editReply({ content: '❌ Terjadi kesalahan saat memproses permintaan.' }).catch(console.error);
      }
    }
  }
};