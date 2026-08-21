console.log('🚀 Rajell Memulai proses inisialisasi...');
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes, ActivityType } = require('discord.js');
const config = require('./config.json');
const statusMonitor = require('./utils/statusMonitor');
const errorMonitoring = require('./utils/errormonitoring');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
client.pendingRequests = new Map();

console.log('✅ Semua module berhasil di-load.');
console.log('✅ Client Discord berhasil dibuat.');

statusMonitor(client);
errorMonitoring(client);

const commandsArray = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsArray.push(command.data.toJSON());
        console.log(`✅ Command berhasil dimuat: ${filePath}`);
      } else {
        console.warn(`[WARNING] Command di ${filePath} tidak punya properti "data" atau "execute".`);
      }
    } catch (err) {
      console.error(`❌ Gagal memuat command: ${filePath}`);
      console.error(err);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(config.token);
rest.put(Routes.applicationCommands(config.clientId), { body: commandsArray })
  .then(() => console.log('✅ Commands berhasil di-deploy (auto dari index.js)'))
  .catch(console.error);

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  try {
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`✅ Event berhasil dimuat: ${file}`);
  } catch (err) {
    console.error(`❌ Gagal memuat event: ${file}`);
    console.error(err);
  }
}

// Event ketika bot sudah siap
client.once('ready', () => {
  console.log(`🤖 Bot ${client.user.tag} sudah online!`);
  
  const watchingActivities = [
    'House Rajell',
  ];

  let index = 0;

  setInterval(() => {
    const name = watchingActivities[index % watchingActivities.length];
    client.user.setActivity(name, { type: ActivityType.Watching });
    console.log(`🎬 Mengubah aktivitas: Watching ${name}`);
    index++;
  }, 5000); // ganti setiap 5 detik 
});

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`❌ Error saat eksekusi command ${interaction.commandName}:`, err);
      await interaction.reply({ content: '❌ Terjadi kesalahan saat menjalankan command.', ephemeral: true });
    }
  }
  
  if (interaction.isButton()) {
    // Handle button interactions here
  }
});

// Error handling global
process.on('unhandledRejection', err => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err);
});

// Login bot
client.login(config.token)
  .then(() => {
    console.log('🔓 Login ke Discord berhasil.');
  })
  .catch(err => {
    console.error('❌ Gagal login ke Discord:', err);
  });