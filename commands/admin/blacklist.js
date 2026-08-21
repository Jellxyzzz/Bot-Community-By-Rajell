const {
    SlashCommandBuilder,
    ContainerBuilder, TextDisplayBuilder,
    SeparatorBuilder,
    MediaGalleryBuilder, MediaGalleryItemBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

// Import file config.json (sesuaikan path relatif jika file config ada di folder berbeda)
const config = require('../../config.json'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Blacklist a member from the server')

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        )

        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('Member yang akan di-blacklist')
                .setRequired(true))

        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Alasan blacklist')
                .setRequired(true)),

    async execute(interaction) {

        const memberUser = interaction.options.getUser('member');
        const reason = interaction.options.getString('reason');

        const member = await interaction.guild.members.fetch(memberUser.id).catch(() => null);

        // Mengambil Channel ID khusus blacklist dari config.json
        const logChannel = interaction.guild.channels.cache.get(config.ChannelLogBlacklist);

        try {
            // âââ URL GAMBAR BANNER BLACKLIST DI ATAS ââââââââââââââââââââââ
            // Ganti URL di bawah ini dengan link gambar banner blacklist Anda
            const imageUrl = 'https://cdn.imageurlgenerator.com/uploads/24bf468b-49da-4eef-b382-56334e0ed209.png'; 

            // âââ Membuat Container V2 ââââââââââââââââââââââââââââââââââ
            const container = new ContainerBuilder();

            // Memasukkan gambar ke bagian paling atas Container
            if (imageUrl) {
                container.addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems(
                        new MediaGalleryItemBuilder().setURL(imageUrl)
                    )
                );
            }

            container
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `Staff : ${interaction.user}\n`
                        + `Nama : ${memberUser}\n`
                        + `Discord ID : ${memberUser.id}\n`
                        + `Reason : ${reason}`
                    )
                );

            if (logChannel) {
                await logChannel.send({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2
                });
            } else {
                console.warn("â ï¸ Warning: ChannelLogBlacklist tidak ditemukan atau ID di config.json salah.");
            }

            // Optional: Jika Anda ingin bot otomatis memberikan role blacklist atau melakukan kick/ban, silakan tambahkan kodenya di sini.

            await interaction.reply({
                content: `â Berhasil mencatat blacklist untuk member ${memberUser.tag}.`,
                ephemeral: true
            });

        } catch (err) {
            console.error(err);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'â Terjadi error saat memproses blacklist.',
                    ephemeral: true
                });
            }
        }
    }
};
