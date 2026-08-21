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
        .setName('logsmember')
        .setDescription('Promote / Demote Member')

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        )

        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('Member yang diproses')
                .setRequired(true))

        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Role')
                .setRequired(true))

        .addStringOption(option =>
            option
                .setName('aksi')
                .setDescription('Promote atau Demote')
                .setRequired(true)
                .addChoices(
                    { name: 'Promote', value: 'promote' },
                    { name: 'Demote', value: 'demote' }
                ))

        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Catatan')
                .setRequired(true)),

    async execute(interaction) {

        const memberUser = interaction.options.getUser('member');
        const role = interaction.options.getRole('role');
        const aksi = interaction.options.getString('aksi');
        const reason = interaction.options.getString('reason');

        const member =
            await interaction.guild.members.fetch(memberUser.id);

        // Mengambil Channel ID dari config.json
        const logChannel =
            interaction.guild.channels.cache.get(config.ChannelLogMembers);

        try {

            // PROMOTE
            if (aksi === 'promote') {

                if (member.roles.cache.has(role.id)) {
                    return interaction.reply({
                        content: 'â Member sudah memiliki role tersebut.',
                        ephemeral: true
                    });
                }

                await member.roles.add(role);
            }

            // DEMOTE
            if (aksi === 'demote') {

                if (!member.roles.cache.has(role.id)) {
                    return interaction.reply({
                        content: 'â Member tidak memiliki role tersebut.',
                        ephemeral: true
                    });
                }

                await member.roles.remove(role);
            }

            // âââ URL GAMBAR BANNER DI ATAS ââââââââââââââââââââââââââââââ
            // Ganti URL di bawah ini dengan link gambar banner Anda (misal upload ke channel Discord lalu copy link-nya)
            const imageUrl = 'https://cdn.imageurlgenerator.com/uploads/8bfd69f5-8287-4df9-a604-06672524aba7.png'; 

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
                        + `Nama : ${member}\n`
                        + `Keterangan : ${aksi === 'promote' ? `Promoted to ${role}` : `Demoted from ${role}`}\n`
                        + `Catatan : ${reason}`
                    )
                );

            if (logChannel) {
                await logChannel.send({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2
                });
            } else {
                console.warn("â ï¸ Warning: logChannel tidak ditemukan atau ID di config.json salah.");
            }

            await interaction.reply({
                content:
                    aksi === 'promote'
                        ? `â Berhasil memberikan ${role} kepada ${member}.`
                        : `â Berhasil menghapus ${role} dari ${member}.`,
                ephemeral: true
            });

        } catch (err) {
            console.error(err);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'â Terjadi error saat memproses role.',
                    ephemeral: true
                });
            }
        }
    }
};
