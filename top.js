const {SlashCommandBuilder, EmbedBuilder}=require("discord.js");
const {getAllPlayers}=require("./database");


module.exports={
data:new SlashCommandBuilder()
.setName("top")
.setDescription("Bảng xếp hạng tu tiên"),


async execute(interaction){

let players=getAllPlayers();

players.sort((a,b)=>b.realm-a.realm);

let text="";

players.slice(0,10).forEach((p,i)=>{

text+=
`${i+1}. ${p.name} - ${p.realm_name}\n`;

});


interaction.reply({
embeds:[
new EmbedBuilder()
.setTitle("🏆 Hồng Hoang Bảng")
.setDescription(text||"Chưa có ai")
]
});


}

};
