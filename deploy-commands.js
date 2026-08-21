const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('./config.json');

const commands = [];

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(`[WARNING] Command di ${file} tidak punya "data" atau "execute".`);
    }
  }
}

const rest = new REST().setToken(config.token);

async function deployCommands() {
  try {
    console.log(`🔄 Registering ${commands.length} commands...`);
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );
    console.log('✅ Semua command berhasil didaftarkan.');
  } catch (error) {
    console.error('❌ Gagal daftar command:', error);
  }
}

deployCommands();
