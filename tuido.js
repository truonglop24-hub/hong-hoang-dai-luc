const {SlashCommandBuilder,EmbedBuilder}=require("discord.js");
const {getPlayer}=require("./database");


module.exports={

data:new SlashCommandBuilder()
.setName("tuidou")
.setDescription("Xem túi đồ"),


async execute(interaction){

let p=getPlayer(interaction.user.id);


interaction.reply({

embeds:[

new EmbedBuilder()

.setTitle("🎒 Túi đồ")

.setDescription(
`
💊 Đan dược: ${p.dan_duoc||0}

💎 Linh thạch: ${p.linhthach||0}
`
)

]

});

}

};
