import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } from 'discord.js';

class DiscordBot {
  private client: Client;
  private apiBaseUrl: string;

  constructor() {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.setupBot();
  }

  private async setupBot() {
    // Handle interactions
    this.client.on('interactionCreate', async (interaction) => {
      if (interaction.isAutocomplete()) {
        await this.handleAutocomplete(interaction);
        return;
      }

      if (!interaction.isChatInputCommand()) return;

      try {
        if (interaction.commandName === 'report') {
          await this.handleReportCommand(interaction);
        } else if (interaction.commandName === 'info') {
          await this.handleInfoCommand(interaction);
        }
      } catch (error) {
        console.error('Error handling interaction:', error);

        const errorMessage = 'Si è verificato un errore durante l\'esecuzione del comando.';

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      }
    });

    this.client.on('ready', async () => {
      console.log(`Bot Discord connesso come ${this.client.user?.tag}!`);
      // Register slash commands after bot is ready
      await this.registerCommands();
    });

    this.client.on('error', (error) => {
      console.error('Errore del bot Discord:', error);
    });
  }

  private generateClasses() {
    const classes = [];
    // Generate all 18 classes: 1A to 3F
    for (let year = 1; year <= 3; year++) {
      for (let letter = 'A'.charCodeAt(0); letter <= 'F'.charCodeAt(0); letter++) {
        const className = String.fromCharCode(letter);
        classes.push({ name: `${year}${className}`, value: `${year}${className}` });
      }
    }
    return classes;
  }

  private async registerCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName('report')
        .setDescription('Segnala un fatto su una persona')
        .addStringOption(option =>
          option.setName('nome')
            .setDescription('Nome e cognome completo della persona (es: Mario Rossi)')
            .setRequired(true)
            .setAutocomplete(true))
        .addStringOption(option =>
          option.setName('fatto')
            .setDescription('Il fatto da segnalare')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('classe')
            .setDescription('Classe (formato: numero + lettera MAIUSCOLA, es: 2A, 3F)')
            .setRequired(true) // Classe ora è obbligatoria
            .setAutocomplete(true)), // Aggiunto autocomplete per la classe

      new SlashCommandBuilder()
        .setName('info')
        .setDescription('Ottieni tutte le informazioni su una persona')
        .addStringOption(option =>
          option.setName('nome')
            .setDescription('Nome e cognome completo della persona (es: Mario Rossi)')
            .setRequired(true)
            .setAutocomplete(true))
    ];

    const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

    try {
      console.log('Registrazione comandi slash in corso...');

      if (!this.client.user?.id) {
        throw new Error('Bot non ancora connesso');
      }

      await rest.put(Routes.applicationCommands(this.client.user.id), {
        body: commands,
      });
      console.log('Comandi slash registrati con successo!');
    } catch (error) {
      console.error('Errore nella registrazione dei comandi:', error);
    }
  }

  private async handleReportCommand(interaction: any) {
    const nome = interaction.options.getString('nome');
    let classe = interaction.options.getString('classe');
    const fatto = interaction.options.getString('fatto');
    const reportedBy = `${interaction.user.tag}`;

    // 1. Conversione automatica delle lettere in maiuscolo per le classi
    if (classe) {
      classe = classe.toUpperCase();
    }

    // 2. Validazione che le classi non superino la 3F e controllo formato
    const validClasses = this.generateClasses().map(c => c.value);
    const classPattern = /^[1-3][A-F]$/;
    
    if (classe) {
      // Controllo formato base (numero da 1-3 e lettera A-F)
      if (!classPattern.test(classe)) {
        await interaction.reply({
          content: '❌ Formato classe non valido. Usa il formato: numero (1-3) + lettera (A-F). Esempi: 1A, 2B, 3C.',
          ephemeral: true
        });
        return;
      }
      
      // Controllo che la classe sia nelle classi valide (1A-3F)
      if (!validClasses.includes(classe)) {
        await interaction.reply({
          content: '❌ La classe inserita non è valida. Le classi disponibili vanno da 1A a 3F. Non si possono inserire classi oltre la terza.',
          ephemeral: true
        });
        return;
      }
    }

    // Messaggio che specifica di inserire nome e cognome
    const nameParts = nome.trim().split(' ');
    if (nameParts.length < 2) {
      await interaction.reply({
        content: '❌ Devi inserire sia il nome che il cognome. (es: Mario Rossi)',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    try {
      // 3. Conferma quando esiste già una persona con nome uguale ma classe diversa
      let personData = null;
      try {
        const personResponse = await fetch(`${this.apiBaseUrl}/people?name=${encodeURIComponent(nome)}`);
        if (personResponse.ok) {
          const people = await personResponse.json();
          personData = people.find((p: any) => p.name === nome);
        }
      } catch (fetchError) {
        console.error('Errore nel recupero dati persona per controllo classe:', fetchError);
      }

      if (personData && personData.class !== classe) {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        
        const confirmRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('confirm_yes')
              .setLabel('Sì, registra con classe diversa')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('confirm_no')
              .setLabel('No, annulla')
              .setStyle(ButtonStyle.Danger)
          );

        const confirmationMessage = await interaction.followUp({
          content: `⚠️ **Attenzione**: Esiste già una persona chiamata **${nome}** ma in una classe diversa (**${personData.class}**). Vuoi comunque registrarla con la classe **${classe}**?`,
          components: [confirmRow],
          ephemeral: true
        });

        const filter = (i: any) => i.user.id === interaction.user.id;
        
        try {
          const confirmation = await confirmationMessage.awaitMessageComponent({ 
            filter, 
            time: 60000 // 1 minuto per rispondere
          });

          if (confirmation.customId === 'confirm_yes') {
            await confirmation.update({ 
              content: '✅ Confermato! Registrazione in corso...', 
              components: [] 
            });
            await this.sendReportToApi(interaction, nome, classe, fatto, reportedBy);
          } else {
            await confirmation.update({ 
              content: '❌ Operazione annullata.', 
              components: [] 
            });
          }
        } catch (error) {
          await confirmationMessage.edit({
            content: '⏰ Tempo scaduto. Operazione annullata.',
            components: []
          });
        }

        return; // Esci dalla funzione principale per attendere la risposta
      }

      // Se non ci sono conflitti di classe o se la classe non è stata specificata
      await this.sendReportToApi(interaction, nome, classe, fatto, reportedBy);

    } catch (error) {
      console.error('Errore nel comando report:', error);
      await interaction.followUp({
        content: '❌ Si è verificato un errore durante il salvataggio del report.',
        ephemeral: true
      });
    }
  }

  private async sendReportToApi(interaction: any, nome: string, classe: string | null, fatto: string, reportedBy: string) {
    const fullName = classe ? `${nome} (${classe})` : nome;

    try {
      const response = await fetch(`${this.apiBaseUrl}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personName: fullName,
          fact: fatto,
          reportedBy: reportedBy,
          className: classe // Aggiunto per poter salvare la classe nel database
        }),
      });

      if (!response.ok) {
        console.error(`Errore API report: ${response.status} - ${await response.text()}`);
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('✅ Report Aggiunto')
        .setDescription(`Il fatto è stato aggiunto con successo per **${fullName}**`)
        .addFields(
          { name: 'Fatto', value: fatto, inline: false },
          { name: 'Segnalato da', value: reportedBy, inline: true }
        )
        .setTimestamp();

      if (classe) {
        embed.addFields({ name: 'Classe', value: classe, inline: true });
      }

      await interaction.followUp({ embeds: [embed] });
    } catch (error) {
      console.error('Errore nell invio del report all API:', error);
      await interaction.followUp({
        content: '❌ Si è verificato un errore durante il salvataggio del report.',
        ephemeral: true
      });
    }
  }

  private async handleAutocomplete(interaction: any) {
    const focusedValue = interaction.options.getFocused();
    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name === 'nome') {
      try {
        // Fetch existing people from API
        const response = await fetch(`${this.apiBaseUrl}/people`);
        if (response.ok) {
          const people = await response.json();

          // Filter names based on what user has typed
          const filtered = people
            .map((person: any) => person.name)
            .filter((name: string) =>
              name.toLowerCase().includes(focusedValue.toLowerCase())
            )
            .slice(0, 25) // Discord limits to 25 choices
            .map((name: string) => ({
              name: name,
              value: name
            }));

          await interaction.respond(filtered);
        } else {
          await interaction.respond([]);
        }
      } catch (error) {
        console.error('Error in autocomplete for nome:', error);
        await interaction.respond([]);
      }
    } else if (focusedOption.name === 'classe') {
      // Autocomplete per le classi
      const validClasses = this.generateClasses().map(c => c.name);
      const filteredClasses = validClasses
        .filter(className => className.toLowerCase().startsWith(focusedValue.toLowerCase()))
        .slice(0, 25) // Discord limits to 25 choices
        .map(className => ({
          name: className,
          value: className
        }));
      await interaction.respond(filteredClasses);
    }
  }

  private async handleInfoCommand(interaction: any) {
    const nome = interaction.options.getString('nome');

    await interaction.deferReply();

    try {
      const response = await fetch(`${this.apiBaseUrl}/people/${encodeURIComponent(nome)}`);

      if (response.status === 404) {
        await interaction.followUp({
          content: `❌ Nessuna informazione trovata per **${nome}**.`,
          ephemeral: true
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const person = await response.json();

      if (!person.reports || person.reports.length === 0) {
        await interaction.followUp({
          content: `ℹ️ **${nome}** è presente nel database ma non ci sono ancora report disponibili.`,
          ephemeral: true
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`📋 Informazioni su ${person.name}`)
        .setDescription(`Ecco tutti i report raccolti su **${person.name}**:`)
        .setTimestamp();

      // Aggiungi ogni report come campo separato
      person.reports.forEach((report: any, index: number) => {
        const reportDate = new Date(report.createdAt).toLocaleDateString('it-IT');
        embed.addFields({
          name: `Report #${index + 1}`,
          value: `**Fatto:** ${report.fact}\n**Segnalato da:** ${report.reportedBy}\n**Data:** ${reportDate}`,
          inline: false
        });
      });

      embed.setFooter({ text: `Totale report: ${person.reports.length}` });

      await interaction.followUp({ embeds: [embed] });
    } catch (error) {
      console.error('Errore nel comando info:', error);
      await interaction.followUp({
        content: '❌ Si è verificato un errore durante il recupero delle informazioni.',
        ephemeral: true
      });
    }
  }

  public async start() {
    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN!);
    } catch (error) {
      console.error('Errore nel login del bot:', error);
    }
  }

  public getClient() {
    return this.client;
  }

  public getBotStats() {
    return {
      isOnline: this.client.isReady(),
      serverCount: this.client.guilds.cache.size,
      userCount: this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    };
  }
}

export default DiscordBot;