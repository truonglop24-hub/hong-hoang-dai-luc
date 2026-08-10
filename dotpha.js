const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, savePlayer } = require("./database");
const realms = require("./realms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dotpha")
        .setDescription("Đột phá cảnh giới tu tiên"),

    async execute(interaction) {

        let player = getPlayer(interaction.user.id);

        if(!player){
            return interaction.reply("❌ Hãy dùng /batdau trước.");
        }

        let next = realms[player.realm + 1];

        if(!next){
            return interaction.reply("👑 Bạn đã đạt cảnh giới tối cao!");
        }

        let rate = Math.floor(Math.random()*100);

        if(rate < 50){

            player.realm++;
            player.realm_name = next.name;
            player.exp = 0;

            savePlayer(player);

            return interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setTitle("🌌 Đột Phá Thành Công")
                    .setDescription(
                    `🎉 ${interaction.user.username} đã đột phá\n\n`+
                    `✨ Cảnh giới mới: **${next.name}**`
                    )
                ]
            });

        }else{

            return interaction.reply(
            "💥 Đột phá thất bại! Căn cơ chưa đủ."
            );

        }
    }
};
