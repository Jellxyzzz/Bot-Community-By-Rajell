const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SeparatorBuilder, 
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Kelola container bot (Components V2)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Buat container baru')
                .addStringOption(option => 
                    option.setName('ukuran_judul')
                        .setDescription('Pilih ukuran judul')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Besar (H1)', value: '#' },
                            { name: 'Sedang (H2)', value: '##' },
                            { name: 'Kecil (H3)', value: '###' }
                        )
                )
                .addStringOption(option => option.setName('judul').setDescription('Judul container').setRequired(true))
                .addStringOption(option => option.setName('isi').setDescription('Isi container').setRequired(true))
                .addAttachmentOption(option => option.setName('gambar1').setDescription('Gambar utama').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit container yang sudah ada')
                .addStringOption(option => option.setName('id').setDescription('ID pesan container').setRequired(true))
                .addStringOption(option => 
                    option.setName('ukuran_judul')
                        .setDescription('Pilih ukuran judul baru')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Besar (H1)', value: '#' },
                            { name: 'Sedang (H2)', value: '##' },
                            { name: 'Kecil (H3)', value: '###' }
                        )
                )
                .addStringOption(option => option.setName('judul').setDescription('Judul baru').setRequired(false))
                .addStringOption(option => option.setName('isi').setDescription('Isi baru').setRequired(false))
                .addAttachmentOption(option => option.setName('gambar1').setDescription('Gambar utama baru').setRequired(false))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            const ukuranJudul = interaction.options.getString('ukuran_judul');
            const judul = interaction.options.getString('judul');
            const isi = interaction.options.getString('isi');
            const gambar1 = interaction.options.getAttachment('gambar1');

            const container = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${ukuranJudul} ${judul}`)
                )
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(isi)
                );

            if (gambar1) {
                container.addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems(
                        new MediaGalleryItemBuilder().setURL(gambar1.url)
                    )
                );
            }

            await interaction.deferReply({ ephemeral: true });
            
            await interaction.channel.send({ 
                components: [container], 
                flags: MessageFlags.IsComponentsV2 
            });

            return await interaction.editReply({ content: '✅ Container berhasil dibuat!' });
        }

        if (subcommand === 'edit') {
            const messageId = interaction.options.getString('id');
            const ukuranJudul = interaction.options.getString('ukuran_judul') || '#';
            const judul = interaction.options.getString('judul');
            const isi = interaction.options.getString('isi');
            const gambar1 = interaction.options.getAttachment('gambar1');

            await interaction.deferReply({ ephemeral: true });

            try {
                const targetMessage = await interaction.channel.messages.fetch(messageId);

                if (targetMessage.author.id !== interaction.client.user.id) {
                    return await interaction.editReply({ content: '❌ Pesan tersebut bukan milik bot ini!' });
                }

                const updatedContainer = new ContainerBuilder();

                if (judul) {
                    updatedContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${ukuranJudul} ${judul}`)
                    );
                    updatedContainer.addSeparatorComponents(new SeparatorBuilder());
                }

                if (isi) {
                    updatedContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(isi)
                    );
                }

                if (gambar1) {
                    updatedContainer.addMediaGalleryComponents(
                        new MediaGalleryBuilder().addItems(
                            new MediaGalleryItemBuilder().setURL(gambar1.url)
                        )
                    );
                }

                await targetMessage.edit({ 
                    components: [updatedContainer], 
                    flags: MessageFlags.IsComponentsV2 
                });

                return await interaction.editReply({ content: '✅ Container berhasil diperbarui!' });

            } catch (error) {
                console.error(error);
                return await interaction.editReply({ content: '❌ Gagal mengedit pesan. Pastikan ID pesan valid dan berada di channel ini.' });
            }
        }
    },
};
