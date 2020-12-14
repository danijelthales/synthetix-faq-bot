require("dotenv").config()

const snxData = require('synthetix-data');


let trades = null;
let trades100 = null;
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.channels.fetch('785320922278133800').then(c => {
        trades = c
    });
    client.channels.fetch('785321056197935124').then(c => {
        trades100 = c
    });
})

const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);

setTimeout(function () {
    try {
        snxData.exchanges.since({minTimestamp: Math.round(new Date().getTime() / 1000) - 12000}).then(result => {
            console.log("Fetching exchanges in last two minutes");
            result.forEach(r => {
                try {
                    console.log("Exchanged " + r.fromAmount + " " + r.fromCurrencyKey + " to " + r.toAmount + " " + r.toCurrencyKey);
                    console.log("Exchanged amount in sUSD was:" + r.toAmountInUSD);
                    if (r.toAmountInUSD < 100000) {
                        const exampleEmbed = new Discord.MessageEmbed();
                        exampleEmbed.setColor("00770f");
                        exampleEmbed.setTitle("New trade");
                        exampleEmbed.setURL("https://etherscan.io/tx/" + r.hash);
                        exampleEmbed.addField("Wallet",
                            '[0xeed09cc4ebf3fa599eb9ffd7a280e7b944b436b7](https://etherscan.io/address/' + r.fromAddress + ')');
                        exampleEmbed.addField("From",
                            r.fromAmount.toFixed(3) + " " + r.fromCurrencyKey);
                        exampleEmbed.addField("To",
                            r.toAmount.toFixed(3) + " " + r.toCurrencyKey);
                        //trades.send(exampleEmbed);
                        trades.send("Trade made:" + " Exchanged " + r.fromAmount.toFixed(3) + " " + r.fromCurrencyKey + " to " + r.toAmount.toFixed(3) + " " + r.toCurrencyKey + "."
                            + " https://etherscan.io/tx/" + r.hash);
                    }
                } catch (e) {
                    console.log(e);
                }
            })
        });
    } catch (e) {
        console.log(e);
    }
}, 100 * 60 * 2);
