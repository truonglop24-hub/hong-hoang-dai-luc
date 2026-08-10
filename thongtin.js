const {SlashCommandBuilder,EmbedBuilder}=require("discord.js");
const {getPlayer}=require("./database");


module.exports={

data:new SlashCommandBuilder()

.setName("thongtin")

.setDescription("Xem hồ sơ tu tiên"),


async execute(interaction){

let p=getPlayer(interaction.user.id);


if(!p)
return interaction.reply("❌ Chưa bắt đầu tu tiên");


interaction.reply({

embeds:[

new EmbedBuilder()

.setTitle("🌌 Hồ Sơ Tu Tiên")

.addFields(

{
name:"👤 Đạo hữu",
value:p.name
},

{
name:"🔥 Cảnh giới",
value:p.realm_name
},

{
name:"✨ Tu vi",
value:String(p.exp||0)
},

{
name:"💎 Linh thạch",
value:String(p.linhthach||0)
}

)

]

});


}

};
