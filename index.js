const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// Dữ liệu người chơi
const players = new Map();

const realms = [
  { name: "Phàm Nhân", required: 0 },
  { name: "Luyện Khí", required: 1000 },
  { name: "Trúc Cơ", required: 3000 },
  { name: "Kim Đan", required: 7000 },
  { name: "Nguyên Anh", required: 15000 },
  { name: "Hóa Thần", required: 30000 },
  { name: "Luyện Hư", required: 60000 },
  { name: "Hợp Thể", required: 120000 },
  { name: "Đại Thừa", required: 250000 },
  { name: "Độ Kiếp", required: 500000 }
];

const commands = [
  new SlashCommandBuilder()
    .setName("tu-luyen")
    .setDescription("Tu luyện để nhận tu vi"),

  new SlashCommandBuilder()
    .setName("tu-vi")
    .setDescription("Xem tu vi hiện tại của bản thân"),

  new SlashCommandBuilder()
    .setName("dot-pha")
    .setDescription("Thử đột phá cảnh giới"),

  new SlashCommandBuilder()
    .setName("thong-tin")
    .setDescription("Xem thông tin tu tiên")
].map(command => command.toJSON());

client.once("ready", async () => {
  console.log(`⚔️ Bot đã online: ${client.user.tag}`);

  const rest = new REST({ version: "10" })
    .setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log("✅ Đã đăng ký lệnh tu tiên!");
  } catch (error) {
    console.error("❌ Không thể đăng ký lệnh:", error);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const userId = interaction.user.id;

  if (!players.has(userId)) {
    players.set(userId, {
      xp: 0,
      lastTrain: 0
    });
  }

  const player = players.get(userId);

  // /tu-luyen
  if (interaction.commandName === "tu-luyen") {
    const now = Date.now();

    if (now - player.lastTrain < 30000) {
      const remaining = Math.ceil(
        (30000 - (now - player.lastTrain)) / 1000
      );

      return interaction.reply({
        content: `⏳ **Đạo hữu đang vận công!** Hãy chờ ${remaining} giây rồi tu luyện tiếp.`,
        ephemeral: true
      });
    }

    const gain = Math.floor(Math.random() * 201) + 100;
    player.xp += gain;
    player.lastTrain = now;

    const realm = getRealm(player.xp);

    return interaction.reply(
      `🧘 **${interaction.user.username} bắt đầu tu luyện!**\n\n` +
      `✨ Nhận được: **+${gain} tu vi**\n` +
      `🔮 Tu vi hiện tại: **${player.xp}**\n` +
      `⚔️ Cảnh giới: **${realm.name}**`
    );
  }

  // /tu-vi
  if (interaction.commandName === "tu-vi") {
    const realm = getRealm(player.xp);
    const next = realms.find(r => r.required > player.xp);

    return interaction.reply(
      `🔮 **TU VI CỦA ${interaction.user.username.toUpperCase()}**\n\n` +
      `⚔️ Cảnh giới: **${realm.name}**\n` +
      `✨ Tu vi: **${player.xp}**\n` +
      `📈 Cảnh giới tiếp theo: **${next ? next.name : "Đã đạt đỉnh"}**`
    );
  }

  // /dot-pha
  if (interaction.commandName === "dot-pha") {
    const currentIndex = getRealmIndex(player.xp);
    const next = realms[currentIndex + 1];

    if (!next) {
      return interaction.reply(
        `👑 **${interaction.user.username} đã đạt cảnh giới Độ Kiếp!**\n` +
        `Thiên đạo cũng phải nhường đường.`
      );
    }

    if (player.xp < next.required) {
      const missing = next.required - player.xp;

      return interaction.reply(
        `❌ **Đột phá thất bại!**\n\n` +
        `⚔️ Cảnh giới hiện tại: **${realms[currentIndex].name}**\n` +
        `🎯 Mục tiêu: **${next.name}**\n` +
        `💠 Còn thiếu: **${missing} tu vi**`
      );
    }

    player.xp = next.required;

    return interaction.reply(
      `🌟 **ĐỘT PHÁ THÀNH CÔNG!** 🌟\n\n` +
      `⚔️ ${realms[currentIndex].name} ➜ **${next.name}**\n` +
      `✨ Tu vi: **${player.xp}**\n\n` +
      `🎉 Chúc mừng **${interaction.user.username}**!`
    );
  }

  // /thong-tin
  if (interaction.commandName === "thong-tin") {
    const realm = getRealm(player.xp);

    return interaction.reply(
      `📜 **THÔNG TIN TU TIÊN**\n\n` +
      `👤 Đạo hiệu: **${interaction.user.username}**\n` +
      `⚔️ Cảnh giới: **${realm.name}**\n` +
      `✨ Tu vi: **${player.xp}**\n` +
      `🏯 Tông môn: **Chưa gia nhập**`
    );
  }
});

function getRealm(xp) {
  let current = realms[0];

  for (const realm of realms) {
    if (xp >= realm.required) {
      current = realm;
    }
  }

  return current;
}

function getRealmIndex(xp) {
  let index = 0;

  for (let i = 0; i < realms.length; i++) {
    if (xp >= realms[i].required) {
      index = i;
    }
  }

  return index;
}

client.login(process.env.TOKEN);
