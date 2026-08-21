const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  AttachmentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ContainerBuilder, TextDisplayBuilder, 
  SeparatorBuilder, MessageFlags
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { 
  CategoryTicketIdPc, 
  CategoryTicketIdAndro, 
  FOUNDER_ROLE_ID, 
  NGURUS_ROLE_ID, 
  ChannelLogTicketId 
} = require('../config.json');

// Fungsi untuk meload data tiket berdasarkan tipe (PC / Andro)
const getTicketPath = (type) => {
  const fileName = type === 'Pendaftaran Andro' ? 'ticketandro.json' : 'ticketspc.json';
  return path.join(__dirname, `../data/${fileName}`);
};

const loadTicketData = (type) => {
  try {
    const ticketPath = getTicketPath(type);
    if (!fs.existsSync(ticketPath)) {
      const dir = path.dirname(ticketPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return {};
    }
    return JSON.parse(fs.readFileSync(ticketPath, 'utf-8'));
  } catch (error) {
    console.error('Error loading ticket data:', error);
    return {};
  }
};

const saveTicketData = (type, data) => {
  try {
    const ticketPath = getTicketPath(type);
    const dir = path.dirname(ticketPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ticketPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving ticket data:', error);
  }
};

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    const { customId, guild, user, channel } = interaction;
    
    try {
      if (customId === 'panggil_pengurus') {
        return interaction.reply({
          content: `🔔 <@&${FOUNDER_ROLE_ID}> <@&${NGURUS_ROLE_ID}> telah dipanggil oleh <@${user.id}>.`,
          ephemeral: false
        });
      }
      
      if (customId === 'contoh_format') {
        const formatContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              '# 📄 FORMAT PENDAFTARAN\n\n'
              + '***Nama :***\n'
              + '***Umur :***\n'
              + '***Device :***\n'
              + '***Ex Community :***\n'
              + '***Berapa lama bermain SA-MP :***\n'
              + '***Kesibukan :***\n'
              + '***Link Gp 1menit no cut :***\n\n'
              + '***Apa tujuan lu mau masuk ke sini :***\n'
              + '***Apakah pernah masuk comun lain :***'
            )
          );

        return interaction.reply({
          components: [formatContainer],
          flags: MessageFlags.IsComponentsV2,
          ephemeral: true
        });
      }

      if (customId === 'pendaftaran_pc' || customId === 'pendaftaran_andro') {
        const ticketTypeLabel = customId === 'pendaftaran_pc' ? 'Pendaftaran PC' : 'Pendaftaran Andro';
        const targetCategory = customId === 'pendaftaran_pc' ? CategoryTicketIdPc : CategoryTicketIdAndro;
        const ticketData = loadTicketData(ticketTypeLabel);

        if (ticketData[user.id]) {
          const existingChannel = guild.channels.cache.get(ticketData[user.id].channelId);
          if (existingChannel) {
            return interaction.reply({ 
              content: `❌ Anda telah mencapai jumlah maksimum tiket yang diizinkan untuk ${ticketTypeLabel} (1). ${existingChannel}`, 
              ephemeral: true 
            });
          } else {
            delete ticketData[user.id];
            saveTicketData(ticketTypeLabel, ticketData);
          }
        }

        await interaction.deferReply({ ephemeral: true });

        const ticketName = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        const randomId = Math.floor(1000 + Math.random() * 9000);

        if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          return interaction.editReply({ 
            content: '❌ Bot tidak memiliki permission untuk membuat channel!' 
          });
        }

        const category = guild.channels.cache.get(targetCategory);
        if (!category) {
          return interaction.editReply({ 
            content: `❌ Category untuk ${ticketTypeLabel} tidak ditemukan di config.json!` 
          });
        }

        const ticketChannel = await guild.channels.create({
          name: ticketName,
          type: ChannelType.GuildText,
          parent: targetCategory,
          permissionOverwrites: [
            { 
              id: guild.id, 
              deny: [PermissionsBitField.Flags.ViewChannel] 
            },
            { 
              id: user.id, 
              allow: [
                PermissionsBitField.Flags.ViewChannel, 
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ] 
            },
            { 
              id: FOUNDER_ROLE_ID, 
              allow: [
                PermissionsBitField.Flags.ViewChannel, 
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ] 
            },
            { 
              id: NGURUS_ROLE_ID, 
              allow: [
                PermissionsBitField.Flags.ViewChannel, 
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ] 
            }
          ]
        });

        const ticketContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `<@${user.id}>\n\n`
              + '# 🎟️ HOUSE RAJELL Ticket\n'
              + `Terima kasih telah memilih jalur **${ticketTypeLabel}**. Harap tunggu respon dari tim pengurus.\n\n`
              + `> **ID Ticket:** \`${randomId}\`\n`
              + `> **Dibuat Oleh:** <@${user.id}>\n`
              + `> **Kategori:** \`${ticketTypeLabel}\``
            )
          )
          .addSeparatorComponents(new SeparatorBuilder());

        const actionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('panggil_pengurus')
            .setLabel('🔔 Panggil Pengurus')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('contoh_format')
            .setLabel('📄 Contoh Format')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('❌ Close Ticket')
            .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ 
          components: [ticketContainer, actionRow], 
          flags: MessageFlags.IsComponentsV2
        });

        await interaction.editReply({ 
          content: `✅ Ticket ${ticketTypeLabel} berhasil dibuat: ${ticketChannel}` 
        });

        ticketData[user.id] = {
          channelId: ticketChannel.id,
          idTicket: randomId,
          userId: user.id,
          ticketType: ticketTypeLabel,
          createdAt: new Date().toISOString()
        };
        saveTicketData(ticketTypeLabel, ticketData);

        const logChannel = guild.channels.cache.get(ChannelLogTicketId);
        if (logChannel) {
          const logContainer = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                '# 📥 Ticket Dibuka\n\n'
                + `> **Nama Ticket:** \`${ticketChannel.name}\`\n`
                + `> **User:** <@${user.id}>\n`
                + `> **ID Ticket:** \`${randomId}\`\n`
                + `> **Tipe:** \`${ticketTypeLabel}\``
              )
            );
          
          await logChannel.send({ 
            components: [logContainer], 
            flags: MessageFlags.IsComponentsV2 
          }).catch(console.error);
        }
      }

      if (customId === 'close_ticket') {
        // Cek ke kedua file data (PC / Andro) untuk mencocokkan channel penutupan
        const pcData = loadTicketData('Pendaftaran PC');
        const androData = loadTicketData('Pendaftaran Andro');

        const pcOwner = Object.keys(pcData).find(key => pcData[key].channelId === channel.id);
        const androOwner = Object.keys(androData).find(key => androData[key].channelId === channel.id);
        
        if (!pcOwner && !androOwner) {
          return interaction.reply({ 
            content: '❌ Data ticket tidak ditemukan!', 
            ephemeral: true 
          });
        }

        const modal = new ModalBuilder()
          .setCustomId('close_ticket_modal')
          .setTitle('Reason Close Ticket');

        const reasonInput = new TextInputBuilder()
          .setCustomId('close_reason')
          .setLabel('Alasan Penutupan')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Ketik alasan penutupan tiket di sini...')
          .setRequired(true)
          .setMaxLength(500);

        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
      }

      if (customId === 'close_ticket_modal') {
        const reason = interaction.fields.getTextInputValue('close_reason');
        
        const pcData = loadTicketData('Pendaftaran PC');
        const androData = loadTicketData('Pendaftaran Andro');

        let ticketOwner = Object.keys(pcData).find(key => pcData[key].channelId === channel.id);
        let ticketTypeLabel = 'Pendaftaran PC';
        let ticketData = pcData;

        if (!ticketOwner) {
          ticketOwner = Object.keys(androData).find(key => androData[key].channelId === channel.id);
          ticketTypeLabel = 'Pendaftaran Andro';
          ticketData = androData;
        }
        
        if (!ticketOwner) {
          return interaction.reply({ 
            content: '❌ Data ticket tidak ditemukan!', 
            ephemeral: true 
          });
        }

        const ticketInfo = ticketData[ticketOwner];

        await interaction.reply({ 
          content: '📄 Menutup ticket dalam 5 detik...', 
          ephemeral: true 
        });

        setTimeout(async () => {
          try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const content = messages
              .reverse()
              .map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`)
              .join('\n');

            const transcriptFile = new AttachmentBuilder(
              Buffer.from(content), 
              { name: `${channel.name}-transcript.txt` }
            );

            const owner = await interaction.client.users.fetch(ticketOwner).catch(() => null);
            if (owner) {
              await owner.send({
                content: `📄 Berikut transcript ticket kamu (${channel.name}):`,
                files: [transcriptFile]
              }).catch(console.error);
            }

            const logChannel = guild.channels.cache.get(ChannelLogTicketId);
            if (logChannel) {
              const closeContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    '# 📄 Ticket Ditutup\n\n'
                    + `> **Nama Ticket:** \`${channel.name}\`\n`
                    + `> **User:** <@${ticketOwner}>\n`
                    + `> **Ditutup Oleh:** <@${user.id}>\n`
                    + `> **Ticket Type:** \`${ticketTypeLabel}\`\n`
                    + `> **Reason:** ${reason}`
                  )
                );
              
              await logChannel.send({ 
                components: [closeContainer], 
                flags: MessageFlags.IsComponentsV2 
              }).catch(console.error);
            }

            delete ticketData[ticketOwner];
            saveTicketData(ticketTypeLabel, ticketData);
            await channel.delete().catch(console.error);
            
          } catch (error) {
            console.error('Error closing ticket:', error);
          }
        }, 5000);
      }

    } catch (error) {
      console.error('Error in interaction handler:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Terjadi kesalahan saat memproses permintaan.',
          ephemeral: true
        }).catch(console.error);
      } else if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ Terjadi kesalahan saat memproses permintaan.'
        }).catch(console.error);
      }
    }
  }
};
