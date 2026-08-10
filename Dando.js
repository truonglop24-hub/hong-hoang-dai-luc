const {SlashCommandBuilder}=require("discord.js");
const {getPlayer,savePlayer}=require("./database");


module.exports={

data:new SlashCommandBuilder()
.setName("dando")
.setDescription("Sử dụng đan dược"),


async execute(interaction){

let p=getPlayer(interaction.user.id);


if(!p)
return interaction.reply("❌ Chưa tu luyện");


p.exp=(p.exp||0)+100;


savePlayer(p);


interaction.reply(
"💊 Bạn sử dụng đan dược +100 tu vi"
);


}

};
