require("dotenv").config();

const {
    Client,
    Collection,
    GatewayIntentBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});


client.commands = new Collection();


// =========================
// LOAD COMMAND
// =========================

const commandFiles = fs.readdirSync(__dirname)
.filter(file => file.endsWith(".js"))
.filter(file =>
    ![
        "index.js",
        "database.js",
        "deploy-commands.js",
        "realms.js"
    ].includes(file)
);


for (const file of commandFiles) {

    try {

        const command = require(
            path.join(__dirname, file)
        );


        if (
            command.data &&
            command.execute
        ) {

            client.commands.set(
                command.data.name,
                command
            );

            console.log(
                `✅ Đã tải /${command.data.name}`
            );

        } else {

            console.log(
                `⚠️ Bỏ qua ${file}`
            );

        }


    } catch(error){

        console.log(
            `❌ Lỗi tải ${file}:`,
            error.message
        );

    }

}



client.once(
    "clientReady",
    () => {

        console.log(
`
==============================
🌌 HỒNG HOANG ĐẠI LỤC
==============================

🤖 Bot: ${client.user.tag}

📜 Số lệnh: ${client.commands.size}

==============================
`
        );

    }
);



// =========================
// INTERACTION
// =========================

client.on(
"interactionCreate",
async interaction => {


    if(!interaction.isChatInputCommand())
        return;


    const command =
        client.commands.get(
            interaction.commandName
        );


    if(!command)
        return;


    try{

        await command.execute(
            interaction
        );


    }catch(error){

        console.error(error);


        if(interaction.replied)
        {
            interaction.followUp({
                content:
                "❌ Lỗi khi thực hiện lệnh!",
                ephemeral:true
            });

        }
        else
        {
            interaction.reply({
                content:
                "❌ Lỗi khi thực hiện lệnh!",
                ephemeral:true
            });
        }

    }

});



client.login(
    process.env.TOKEN
);
