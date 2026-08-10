const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// =========================
// DATABASE
// =========================

const DATA_FILE = "./data.json";

let database = {};

if (fs.existsSync(DATA_FILE)) {
  try {
    database = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    database = {};
  }
}

function saveDatabase() {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(database, null, 2)
  );
}

function getUser(id) {
  if (!database[id]) {
    database[id] = {
      exp: 0,
      realm: 0,
      linhThach: 100,
      danDuoc: 3,
      lastTrain: 0
    };

    saveDatabase();
  }

  return database[id];
}

// =========================
// CẢNH GIỚI
// =========================

const realms = [
  {
    name: "Luyện Khí",
    max: 1000,
    success: 100
  },
  {
    name: "Trúc Cơ",
    max: 3000,
    success: 80
  },
  {
    name: "Kim Đan",
    max: 7000,
    success: 65
  },
  {
    name: "Nguyên Anh",
    max: 15000,
    success: 50
  },
  {
    name: "Hóa Thần",
    max: 30000,
    success: 40
  },
  {
    name: "Luyện Hư",
    max: 60000,
    success: 30
  },
  {
    name: "Hợp Thể",
    max: 120000,
    success: 25
  },
  {
    name: "Đại Thừa",
    max: 250000,
    success: 20
  },
  {
    name: "Độ Kiếp",
    max: Infinity,
    success: 15
  }
];

// =========================
// SLASH COMMANDS
// =========================

const commands = [
  new SlashCommandBuilder()
    .setName("tuvi")
    .setDescription("Xem thông tin tu tiên của bản thân"),

  new SlashCommandBuilder()
    .setName("luyentap")
    .setDescription("Tu luyện để nhận tu vi"),

  new SlashCommandBuilder()
    .setName("dotpha")
    .setDescription("Đột phá cảnh giới"),

  new SlashCommandBuilder()
    .setName("linhthach")
    .setDescription("Xem số linh thạch"),

  new SlashCommandBuilder()
    .setName("danduoc")
    .setDescription("Xem số đan dược"),

  new SlashCommandBuilder()
    .setName("top")
    .setDescription("Xem bảng xếp hạng tu sĩ")
].map(command => command.toJSON());

// =========================
// READY
// =========================

client.once("ready", async () => {
  console.log(`Bot đã online: ${client.user.tag}`);

  const rest = new REST({ version: "10" })
    .setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      {
        body: commands
      }
    );

    console.log("Đã đăng ký lệnh tu tiên!");
  } catch (error) {
    console.error(error);
  }
});

// =========================
// COMMAND HANDLER
// =========================

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const user = getUser(interaction.user.id);

  // =========================
  // /tuvi
  // =========================

  if (interaction.commandName === "tuvi") {

    const realm = realms[user.realm];

    return interaction.reply({
      content:
`☯️ **THÔNG TIN TU SĨ**

👤 Tu sĩ: **${interaction.user.username}**

⚔️ Cảnh giới: **${realm.name}**

✨ Tu vi: **${user.exp.toLocaleString()}**
💎 Linh thạch: **${user.linhThach.toLocaleString()}**
💊 Đan dược: **${user.danDuoc}**

📈 Tu vi cần để đột phá:
**${realm.max === Infinity ? "Đã đạt cảnh giới tối cao" : realm.max.toLocaleString()}**

🌌 Tỷ lệ đột phá:
**${realm.success}%**`
    });
  }

  // =========================
  // /luyentap
  // =========================

  if (interaction.commandName === "luyentap") {

    const cooldown = 60 * 1000;
    const now = Date.now();

    if (now - user.lastTrain < cooldown) {

      const remaining =
        Math.ceil(
          (cooldown - (now - user.lastTrain)) / 1000
        );

      return interaction.reply({
        content:
`⏳ **Ngươi đang vận công!**

Hãy chờ **${remaining} giây** rồi tiếp tục tu luyện.`,
        ephemeral: true
      });
    }

    const gain =
      Math.floor(
        Math.random() * 401
      ) + 500;

    user.exp += gain;
    user.linhThach += 10;
    user.lastTrain = now;

    saveDatabase();

    return interaction.reply(
`🧘 **TU LUYỆN THÀNH CÔNG!**

✨ Ngươi hấp thu linh khí trời đất.

⚡ Tu vi nhận được: **+${gain}**
💎 Linh thạch nhận được: **+10**

📊 Tu vi hiện tại:
**${user.exp.toLocaleString()}**

⏳ Cooldown: **60 giây**`
    );
  }

  // =========================
  // /dotpha
  // =========================

  if (interaction.commandName === "dotpha") {

    if (user.realm >= realms.length - 1) {

      return interaction.reply(
`🌌 **ĐỘ KIẾP**

Ngươi đã đạt cảnh giới cao nhất hiện tại.

⚡ Không thể đột phá thêm.`
      );
    }

    const realm = realms[user.realm];

    if (user.exp < realm.max) {

      return interaction.reply(
`❌ **Đột phá thất bại!**

Cảnh giới hiện tại:
**${realm.name}**

✨ Tu vi hiện tại:
**${user.exp.toLocaleString()}**

📈 Cần:
**${realm.max.toLocaleString()} tu vi**

💡 Hãy tiếp tục dùng \`/luyentap\`.`
      );
    }

    if (user.danDuoc <= 0) {

      return interaction.reply(
`❌ **Không đủ đan dược!**

Muốn đột phá cần ít nhất **1 đan dược**.

💊 Đan dược hiện tại:
**0**`
      );
    }

    user.danDuoc--;

    const success =
      Math.random() * 100 < realm.success;

    if (success) {

      user.realm++;
      user.exp = 0;

      saveDatabase();

      return interaction.reply(
`🌟 **ĐỘT PHÁ THÀNH CÔNG!**

⚡ Cảnh giới mới:
**${realms[user.realm].name}**

💊 Đã sử dụng:
**1 đan dược**

🔥 Con đường tu tiên của ngươi lại tiến thêm một bước!`
      );

    } else {

      saveDatabase();

      return interaction.reply(
`💥 **ĐỘT PHÁ THẤT BẠI!**

⚔️ Cảnh giới:
**${realm.name}**

📉 Tỷ lệ thành công:
**${realm.success}%**

💊 Đã tiêu hao:
**1 đan dược**

😔 Căn cơ chưa đủ vững, hãy tiếp tục tu luyện.`
      );
    }
  }

  // =========================
  // /linhthach
  // =========================

  if (interaction.commandName === "linhthach") {

    return interaction.reply(
`💎 **LINH THẠCH**

👤 ${interaction.user.username}

💰 Linh thạch:
**${user.linhThach.toLocaleString()} viên**`
    );
  }

  // =========================
  // /danduoc
  // =========================

  if (interaction.commandName === "danduoc") {

    return interaction.reply(
`💊 **ĐAN DƯỢC**

👤 ${interaction.user.username}

🧪 Đan dược:
**${user.danDuoc} viên**

💡 Đan dược được sử dụng khi **đột phá cảnh giới**.`
    );
  }

  // =========================
  // /top
  // =========================

  if (interaction.commandName === "top") {

    const ranking = Object.entries(database)
      .sort((a, b) => {

        const scoreA =
          a[1].realm * 1000000 + a[1].exp;

        const scoreB =
          b[1].realm * 1000000 + b[1].exp;

        return scoreB - scoreA;
      })
      .slice(0, 10);

    if (ranking.length === 0) {
      return interaction.reply("📜 Chưa có tu sĩ nào.");
    }

    let text =
`🏆 **BẢNG XẾP HẠNG TU TIÊN**

`;

    for (let i = 0; i < ranking.length; i++) {

      const [id, data] = ranking[i];

      const member =
        await interaction.guild.members
          .fetch(id)
          .catch(() => null);

      const name =
        member?.user.username || "Tu sĩ";

      text +=
`${i + 1}. **${name}**
⚔️ ${realms[data.realm].name}
✨ ${data.exp.toLocaleString()} tu vi

`;
    }

    return interaction.reply(text);
  }

});

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);
