const {SlashCommandBuilder}=require("discord.js");
const {getPlayer}=require("./database");


module.exports={

data:new SlashCommandBuilder()
.setName("linhthach")
.setDescription("Xem linh thạch"),


async execute(interaction){

let p=getPlayer(interaction.user.id);

if(!p)
return interaction.reply("❌ Chưa có nhân vật");


interaction.reply(
`💎 Linh thạch: **${p.linhthach||0}**`
);

}

};
