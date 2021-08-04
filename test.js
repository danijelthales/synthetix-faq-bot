require("dotenv").config()

const snxData = require('synthetix-data');
const Discord = require("discord.js")
const client = new Discord.Client();
const fetch = require('node-fetch');
const w3utils = require('web3-utils');
client.login(process.env.BOT_TOKEN);

let l2trades = null;
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.channels.fetch('871713566225485834').then(c => {
        l2trades = c;
        getl2Exchanges();
    });
})


async function getl2Exchanges() {
    try {
        const ts = Math.floor(Date.now() / 1e3);
        const oneDayAgo = ts - 60*60;
        const body = JSON.stringify({
            query: `{
      synthExchanges(
        orderBy:timestamp,
        orderDirection:desc,
        where:{timestamp_gt: ${oneDayAgo}}
      )
      {
        fromAmount
        fromAmountInUSD
        fromCurrencyKey
        toCurrencyKey
        block
        timestamp
        toAddress
        toAmount
        toAmountInUSD
        feesInUSD
      }
    }`,
            variables: null,
        });

        const response = await fetch('https://api.thegraph.com/subgraphs/name/killerbyte/optimism-exchanges', {
            method: 'POST',
            body,
        });

        const json = await response.json();
        const {synthExchanges} = json.data;
        synthExchanges.forEach(r => {
            try {
                console.log("Exchanged " + r.fromAmount + " " + fromBytes32(r.fromCurrencyKey).substring(0, 4) + " to " + r.toAmount  + " " + fromBytes32(r.toCurrencyKey).substring(0, 4));
                console.log("Exchanged amount in sUSD was:" + r.toAmountInUSD );
                const exampleEmbed = new Discord.MessageEmbed();
                exampleEmbed.setColor("ff0000");
                exampleEmbed.setTitle("New trade");
                exampleEmbed.setURL("https://optimistic.etherscan.io/address/" + r.toAddress);
                exampleEmbed.addField("Wallet",
                    '[' + r.toAddress + '](https://optimistic.etherscan.io/address/' + r.toAddress + ')');
                exampleEmbed.addField("From",
                    numberWithCommas((r.fromAmount*1.0 ).toFixed(2)) + " " + fromBytes32(r.fromCurrencyKey).substring(0, 4));
                exampleEmbed.addField("To",
                    numberWithCommas((r.toAmount*1.0 ).toFixed(2)) + " " + fromBytes32(r.toCurrencyKey).substring(0, 4));
                exampleEmbed.addField("Value",
                    numberWithCommas((r.fromAmountInUSD*1.0).toFixed(2)) + " sUSD");
                l2trades.send(exampleEmbed);
            } catch (e) {
                console.log(e);
            }
        });
    } catch (e) {
        console.log(e);
    }
};
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const fromBytes32 = key => w3utils.hexToAscii(key);
