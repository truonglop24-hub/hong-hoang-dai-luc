const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const {
    createPlayer,
    getPlayer
} = require("./database");



module.exports = {


data:

new SlashCommandBuilder()

.setName("batdau")

.setDescription(
"Gia nhập Hồng Hoang Đại Lục và bắt đầu tu tiên"
),



async execute(interaction){


const userId =
interaction.user.id;



// kiểm tra đã có nhân vật chưa

const old =
getPlayer(userId);



if(old){

return interaction.reply({

content:
"⚠️ Bạn đã có nhân vật tu tiên rồi!",

ephemeral:true

});

}



// tạo nhân vật

createPlayer(
userId,
interaction.user.username
);



const embed =
new EmbedBuilder()

.setTitle(
"🌌 HỒNG HOANG ĐẠI LỤC"
)

.setDescription(

`
✨ Chúc mừng **${interaction.user.username}**

Bạn đã bước vào con đường tu tiên!

━━━━━━━━━━━━━━

🌱 Cảnh giới:
**Luyện Khí Nhất Tầng**

💎 Linh thạch:
**100**

🔥 Linh lực:
**0**

━━━━━━━━━━━━━━

Hãy dùng:

⚔️ \`/tu-luyen\`
để hấp thu linh khí

📜 \`/tuvi\`
để xem hồ sơ

`

)

.setColor(
0x8b5cf6
);



return interaction.reply({

embeds:[
embed
]

});


}


};
