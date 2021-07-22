require("dotenv").config()

const Web3 = require('web3');
const DataFrame = require("dataframe-js");
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/2a1ba27ea6ea4b9683bd48100631ca1e"))
const axios = require('axios');
const synthetixAPI = require('synthetix');
const {ChainId, Fetcher, Route, Trade, TokenAmount, TradeType, WETH, Token} = require('@uniswap/sdk');
var yaxis = null;
var pair = null;
const bugRedisKey = 'Bug';
const {v4: uuidv4} = require('uuid');

const Discord = require("discord.js")
const client = new Discord.Client();

const clientFaqPrice = new Discord.Client();
clientFaqPrice.login(process.env.BOT_TOKEN_SNX);

const clientPegPrice = new Discord.Client();
clientPegPrice.login(process.env.BOT_TOKEN_PEG);

const clientsSEthPegPrice = new Discord.Client();
clientsSEthPegPrice.login(process.env.BOT_TOKEN_SETH_PEG);


const clientTknPrice = new Discord.Client();
clientTknPrice.login(process.env.BOT_TOKEN_TKN);

const clientEthPrice = new Discord.Client();
clientEthPrice.login(process.env.BOT_TOKEN_ETH);

const clientCRVPrice = new Discord.Client();
clientCRVPrice.login(process.env.BOT_TOKEN_CRV);

const clientSWTHPrice = new Discord.Client();
clientSWTHPrice.login(process.env.BOT_TOKEN_SWTH);

const clientPicklePrice = new Discord.Client();
clientPicklePrice.login(process.env.BOT_TOKEN_PICKLE);

const clientMetaPrice = new Discord.Client();
clientMetaPrice.login(process.env.BOT_TOKEN_META);

const clientYUSDPrice = new Discord.Client();
clientYUSDPrice.login(process.env.BOT_TOKEN_YUSD);

const clientVIDYAPrice = new Discord.Client();
clientVIDYAPrice.login(process.env.BOT_TOKEN_VIDYA);

const clientYFVPrice = new Discord.Client();
clientYFVPrice.login(process.env.BOT_TOKEN_YFV);

const clientYFVOldPrice = new Discord.Client();
clientYFVOldPrice.login(process.env.BOT_TOKEN_YFV_OLD);

const clientYaxisPrice = new Discord.Client();
clientYaxisPrice.login(process.env.BOT_TOKEN_YAXIS);

const clientYaxisSupply = new Discord.Client();
clientYaxisSupply.login(process.env.BOT_TOKEN_YAXIS_SUPPLY);

const clientSwervePrice = new Discord.Client();
clientSwervePrice.login(process.env.BOT_TOKEN_SWERVE);

const clientHegicPrice = new Discord.Client();
clientHegicPrice.login(process.env.BOT_TOKEN_HEGIC);

const clientDodoPrice = new Discord.Client();
clientDodoPrice.login(process.env.BOT_TOKEN_DODO);

const clientDrcPrice = new Discord.Client();
clientDrcPrice.login(process.env.BOT_TOKEN_DRC);

const clientPerpPrice = new Discord.Client();
clientPerpPrice.login(process.env.BOT_TOKEN_PERP);

const clientNecPrice = new Discord.Client();
clientNecPrice.login(process.env.BOT_TOKEN_NEC);

const replaceString = require('replace-string');
const https = require('https');
const http = require('http');
const redis = require("redis");
let redisClient = null;

var fs = require('fs');
var snxRewardsPerMinterUsd = 0.013;
var snxToMintUsd = 0.35;
var snxRewardsThisPeriod = "940,415 SNX";
var totalDebt = "$71,589,622";
var gasPrice = 240;
var fastGasPrice = 300;
var lowGasPrice = 200;
var instantGasPrice = 350;
var ethPrice = 360;
var tknPrice = 0.77;
var tknMarketCap = 19161119;
var swthPrice = 0.063;
var swthMarketCap = 35196236;
var picklePrice = 53;
var pickleEthPrice = 0.14334229;
var crvPrice = 3.84;

var swervePrice = 0.668;
var swerveMarketcap = 5242720;

var necPrice = 0.159;
var necMarketcap = 25318817;

var dodoPrice = 0.53;
var dodoMarketcap = 6384478;

var perpPrice = 0.89;
var perpMarketcap = 13626611;

var drcPrice = 0.052;
var drcMarketcap = 501271;

var hegicPrice = 0.122;
var hegicMarketcap = 25416960;

var yaxisCircSupply = 246040.59;
var yaxisTotalSuuply = 445188.84;

var yusdPrice = 1.14;
var yusdMarketCap = 257668486;

var yfvPrice = 7.95;
var yfvMarketCap = 29341110;

var yfvOldPrice = 7.95;
var yfvOldMarketCap = 29341110;

var vidyaPrice = 0.0298;
var vidyaEthPrice = 0.00008887;


var metaPrice = 3.90;
var metaMarketCap = 0.0105;

var yaxisPrice = 4.72;
var yaxisEth = 0.006;
var yaxisMarketCap = 860000;

var snxPrice = 6.9;
var mintGas = 415000;
var claimGas = 380000;
var burnGas = 420000;
var periodVolume = "$33,026,800";

var currentFees = "$159,604";
var unclaimedFees = "$40,808";
var poolDistribution = ["sUSD (51.1%)", "sETH (16.6%)", "sBTC (14.9%)", "iETH (8.1%)", "Others (9.2%)"];

var usdtPeg = 1;
var usdcPeg = 1;

var coingeckoUsd = 3.74;
var coingeckoEth = 0.01051993;
var coingeckoBtc = 0.000351;
var binanceUsd = 3.74;
var kucoinUsd = 3.74;

var payday = new Date('2020-08-12 05:30');

const Synth = class {
    constructor(name, price, gain) {
        this.name = name;
        this.price = price;
        this.gain = gain;
    }

    name;
    price;
    gain;
    description = '';
};

var synths = new Array();
var synthsMap = new Map();

let gasSubscribersMap = new Map();
let gasSubscribersLastPushMap = new Map();

let synthetixProposals = new Map();

let illuviumProposals = new Map();

let votesMapNew4 = new Map();

console.log("Redis URL:" + process.env.REDIS_URL);

if (process.env.REDIS_URL) {
    redisClient = redis.createClient(process.env.REDIS_URL);
    redisClient.on("error", function (error) {
        console.error(error);
    });

    redisClient.get("gasSubscribersMap", function (err, obj) {
        gasSubscribersMapRaw = obj;
        console.log("gasSubscribersMapRaw:" + gasSubscribersMapRaw);
        if (gasSubscribersMapRaw) {
            gasSubscribersMap = new Map(JSON.parse(gasSubscribersMapRaw));
            console.log("gasSubscribersMap:" + gasSubscribersMap);
        }
    });

    redisClient.get("gasSubscribersLastPushMap", function (err, obj) {
        gasSubscribersLastPushMapRaw = obj;
        console.log("gasSubscribersLastPushMapRaw:" + gasSubscribersLastPushMapRaw);
        if (gasSubscribersLastPushMapRaw) {
            gasSubscribersLastPushMap = new Map(JSON.parse(gasSubscribersLastPushMapRaw));
            console.log("gasSubscribersLastPushMap:" + gasSubscribersLastPushMap);
        }
    });

    redisClient.get("votesMapNew4", function (err, obj) {
        votesMapRaw = obj;
        console.log("votesMapRaw3:" + votesMapRaw);
        if (votesMapRaw) {
            votesMapNew4 = new Map(JSON.parse(votesMapRaw));
            console.log("votesMapNew4:" + votesMapNew4);
        }
    });

    redisClient.get("synthetixProposals", function (err, obj) {
        proposalsRaw = obj;
        if (proposalsRaw) {
            synthetixProposals = new Map(JSON.parse(proposalsRaw));
            console.log("synthetixProposals:" + synthetixProposals);
        }
    });

    redisClient.get("illuviumProposals", function (err, obj) {
        illuviumproposalsRaw = obj;
        if (illuviumproposalsRaw) {
            illuviumProposals = new Map(JSON.parse(illuviumproposalsRaw));
            console.log("illuviumProposals:" + illuviumProposals);
        }
    });


}

let channel = null;
let trades = null;
let trades100 = null;
let trades1000 = null;
let general = null;
let councilChannel = null;
let fundChannel = null;
let testChannel = null;
let channelGov = null;
let channelPdao = null;
let channelSdao = null;
let channelGdao = null;
let channelDeployer = null;
let channelShorts = null;
let channelAmbassadors = null;
let guild = null;

async function checkMessages() {
    let countsUsers = new Map();
    client.channels.fetch('413890591840272398').then(async c => {
        //+ textChannel.messages.fetch({ limit: 10 });

        const fetchAll = require('discord-fetch-all');
        const allMessages = await fetchAll.messages(c, {
            reverseArray: true, // Reverse the returned array
            userOnly: true, // Only return messages by users
            botOnly: false, // Only return messages by bots
            pinnedOnly: false, // Only returned pinned messages
        });

// Will return an array of all messages in the channel
// If the channel has no messages it will return an empty array
        console.log(allMessages);

        allMessages.forEach(mes => {
            var created = mes.createdTimestamp;
            let joinedMinsAgo = Date.now() - created;
            joinedMinsAgo = (((joinedMinsAgo / 1000) / 60));
            joinedMinsAgo = Math.round(((joinedMinsAgo) + Number.EPSILON) * 100) / 100;
            if (joinedMinsAgo < 2880) {
                var username = mes.author.username;
                if (countsUsers.has(username)) {
                    countsUsers.set(username, (countsUsers.get(username) + 1))
                } else {
                    countsUsers.set(username, 1)
                }
            }
        })

        countsUsers[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
        }

        for (let [key, value] of countsUsers) {     // get data sorted
            console.log(key + ' ' + value);
        }
    })
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.channels.fetch('785320922278133800').then(c => {
        trades = c
    });
    client.channels.fetch('785321056197935124').then(c => {
        trades100 = c
    });
    client.channels.fetch('790349176289624084').then(c => {
        trades1000 = c
    });
    client.channels.fetch('413890591840272398').then(c => {
        general = c;
    });
    client.channels.fetch('794935827436011531').then(c => {
        councilChannel = c;
    });
    client.channels.fetch('791459254862086155').then(c => {
        fundChannel = c;
    });
    client.channels.fetch('705191770903806022').then(c => {
        testChannel = c;
    });
    client.channels.fetch('804120595976421406').then(c => {
        channelGov = c;
    });
    client.channels.fetch('823701952122716210').then(c => {
        channelPdao = c;
    });
    client.channels.fetch('823701931888607262').then(c => {
        channelSdao = c;
    });
    client.channels.fetch('823701967841919016').then(c => {
        channelGdao = c;
    });
    client.channels.fetch('836246784241696778').then(c => {
        channelAmbassadors = c;
    });
    client.channels.fetch(process.env.DEPLOYER).then(c => {
        channelDeployer = c;
    });
    client.channels.fetch(process.env.SHORTS).then(c => {
        channelShorts = c;
    });


    // checkMessages();

    client.guilds.cache.forEach(function (value, key) {
        if (value.name.toLowerCase().includes('synthetix')) {
            guild = value;
        }
    });

    calculateDebt();

})
// client.on("guildMemberAdd", function (member) {
//     member.send("Hi and welcome to Synthetix! I am Synthetix FAQ bot. I will be very happy to assist you, just ask me for **help**.");
// });

client.on('messageReactionAdd', (reaction, user) => {
    let msg = reaction.message, emoji = reaction.emoji;
    if (emoji.name == '❌') {
        if (msg.author.username.includes("FAQ")) {
            if (!user.username.includes("FAQ")) {
                msg.delete({timeout: 300 /*time unitl delete in milliseconds*/});
            }
        }
    }
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function doInnerQuestion(command, doReply, msg) {
    try {
        let rawdata = fs.readFileSync('answers/' + command + '.json');
        let answer = JSON.parse(rawdata);

        const exampleEmbed = new Discord.MessageEmbed();
        exampleEmbed.setColor(answer.color);
        exampleEmbed.setTitle(answer.title);
        exampleEmbed.setDescription(answer.description);
        exampleEmbed.setURL(answer.url);

        if (command == "7") {

            exampleEmbed.addField("Safe low gas price:", lowGasPrice + ' gwei', false);
            exampleEmbed.addField("Standard gas price:", gasPrice + ' gwei', false);
            exampleEmbed.addField("Fast gas price:", fastGasPrice + ' gwei', false);
            exampleEmbed.addField("Instant gas price:", instantGasPrice + ' gwei', false);
            if (doReply) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }


        } else if (command == "9") {

            exampleEmbed.addField("USD (binance)", binanceUsd, false);
            exampleEmbed.addField("USD (kucoin)", kucoinUsd, false);
            exampleEmbed.addField("USD (coingecko)", coingeckoUsd, false);
            exampleEmbed.addField("ETH (coingecko):", coingeckoEth, false);
            exampleEmbed.addField("BTC (coingecko):", coingeckoBtc, false);
            if (doReply) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }

        } else if (command == "61") {

            https.get('https://api.coingecko.com/api/v3/coins/ethereum', (resp) => {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    let result = JSON.parse(data);
                    exampleEmbed.addField("USD", result.market_data.current_price.usd, false);
                    exampleEmbed.addField("BTC:", result.market_data.current_price.btc, false);
                    if (doReply) {
                        msg.reply(exampleEmbed);
                    } else {
                        msg.channel.send(exampleEmbed).then(function (message) {
                            message.react("❌");
                        }).catch(function () {
                            //Something
                        });
                    }
                });

            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });

        } else if (command == "8") {

            https.get('https://api.coingecko.com/api/v3/coins/nusd', (resp) => {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    let result = JSON.parse(data);
                    exampleEmbed.addField("USD (coingecko)", result.market_data.current_price.usd, false);
                    exampleEmbed.addField("USDC (1inch)", usdcPeg, false);
                    exampleEmbed.addField("USDT (1inch)", usdtPeg, false);
                    if (result.market_data.current_price.usd == 1 && usdcPeg == 1 && usdtPeg == 1) {
                        exampleEmbed.attachFiles(['images/perfect.jpg'])
                            .setImage('attachment://perfect.jpg');
                    }
                    if (doReply) {
                        msg.reply(exampleEmbed);
                    } else {
                        msg.channel.send(exampleEmbed).then(function (message) {
                            message.react("❌");
                        }).catch(function () {
                            //Something
                        });
                    }
                });

            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });

        } else if (command == "13") {

            var today = new Date();
            while (today > payday) {
                payday.setDate(payday.getDate() + 7);
            }
            var difference = payday.getTime() - today.getTime();
            var seconds = Math.floor(difference / 1000);
            var minutes = Math.floor(seconds / 60);
            var hours = Math.floor(minutes / 60);
            var days = Math.floor(hours / 24);
            hours %= 24;
            minutes %= 60;
            seconds %= 60;

            exampleEmbed.addField("Countdown:", days + " days " + hours + " hours " + minutes + " minutes " + seconds + " seconds ", false);
            if (doReply) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }

        } else if (command == "62") {

            exampleEmbed.addField("Volume in this period:", periodVolume, false);
            if (doReply) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }

        } else if (command == "66") {

            var synthsGainers = "";
            var synthsBreakEven = "";
            var synthsLosers = "";
            synths.forEach(function (s) {
                let arrow = (s.gain.replace(/%/g, "") * 1.0 == 0) ? " - " : (s.gain.replace(/%/g, "") * 1.0 > 0) ? " ⤤ " : " ⤥ ";
                if (arrow.includes("⤤")) {
                    synthsGainers += s.name + " " + s.price + " " + s.gain + arrow + "\n";
                }
                if (arrow.includes("⤥")) {
                    synthsLosers += s.name + " " + s.price + " " + s.gain + arrow + "\n";
                }
                if (arrow.includes("-")) {
                    synthsBreakEven += s.name + " " + s.price + " " + s.gain + arrow + "\n";
                }
            });

            exampleEmbed.addField("Synth gainers:", synthsGainers, false);
            exampleEmbed.addField("Synth no change:", synthsBreakEven, false);
            exampleEmbed.addField("Synth losers:", synthsLosers, false);
            if (doReply) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }

        } else if (command == "74") {

            var synthsPrices = "";
            for (var i = 0; i < 10; i++) {
                synthsPrices += synths[i].name + " " + synths[i].price + " " + synths[i].gain + " ⤤\n";
            }

            exampleEmbed.addField("Biggest gainers:", synthsPrices, false);
            if (doReply) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }

        } else if (command == "75") {

            var synthsPrices = "";
            for (var i = 1; i < 11; i++) {
                synthsPrices += synths[synths.length - i].name + " " + synths[synths.length - i].price + " " + synths[synths.length - i].gain + " ⤥\n";
            }

            exampleEmbed.addField("Biggest losers:", synthsPrices, false);
            if (doReply) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }

        } else if (command == "82") {

            for (var i = 0; i < (walletsToReturn.length > 20 ? 20 : walletsToReturn.length); i++) {
                exampleEmbed.addField(walletsToReturn[i].address,
                    "[etherscan](https://etherscan.io/address/" + walletsToReturn[i].address + "): " + walletsToReturn[i].cRatio + "%,  snxBalance:" + walletsToReturn[i].snxCount
                    + " escrowedSnxCount:" + walletsToReturn[i].escrowedSnxCount
                    , false);
            }

            if (doReply) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }

        } else if (command == "92") {

            for (const [key, value] of flaggedAccountsMap.entries()) {
                exampleEmbed.addField(key,
                    "[etherscan](https://etherscan.io/address/" + key + "): " + value.cRatio + "%,  snxBalance:" + value.snxCount
                    + " escrowedSnxCount:" + value.escrowedSnxCount + " flaggedTime:" + value.flaggedTime +
                    "\nETA to liquidation:" + value.etaToLiquidation
                    , false);
            }

            if (doReply) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }

        } else if (command == "100") {

            let counter = 1;
            for (c of council) {
                exampleEmbed.addField(counter++, c, false);
            }

            var today = new Date();
            var difference = voteDay.getTime() - today.getTime();
            var seconds = Math.floor(difference / 1000);
            var minutes = Math.floor(seconds / 60);
            var hours = Math.floor(minutes / 60);
            var days = Math.floor(hours / 24);
            hours %= 24;
            minutes %= 60;
            seconds %= 60;

            exampleEmbed.addField("Countdown:", days + " days " + hours + " hours " + minutes + " minutes " + seconds + " seconds ", false);

            if (doReply) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }

        } else {

            answer.fields.forEach(function (field) {
                exampleEmbed.addField(field.title, field.value, field.inline);
            });

            if (answer.footer.title) {
                exampleEmbed.setFooter(answer.footer.title, answer.footer.value);

            }

            if (answer.image) {
                exampleEmbed.attachFiles(['images/' + answer.image])
                    .setImage('attachment://' + answer.image);
            }

            if (answer.thumbnail) {
                exampleEmbed.attachFiles(['images/' + answer.thumbnail])
                    .setThumbnail('attachment://' + answer.thumbnail);
            }

            if (doReply) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }
        }
    } catch (e) {
        if (doReply) {
            msg.reply("Oops, there seems to be something wrong there. \nChoose your question with ***question questionNumber***, e.g. **question 1**\nYou can get the question number via **list**");
        } else {
            msg.reply("Oops, there seems to be something wrong there. \nChoose your question with ***!FAQ question questionNumber***, e.g. **question 1**\nYou can get the question number if you send me **list** in DM");
        }
    }
}

let df;
let othersDebtSum;

setInterval(function () {
    calculateDebt();
}, 60 * 1000);

client.on("message", msg => {

        if (!msg.author.username.includes("FAQ")) {

            if (!(msg.channel.type == "dm")) {
                // this is logic for channels
                if (msg.content.toLowerCase().trim() == "!faq") {
                    msg.reply("Hi, I am Synthetix FAQ bot. I will be very happy to assist you, just ask me for **help** in DM.");
                }
                    // else if (msg.content.toLowerCase().includes("<@!513707101730897921>")) {
                    //     msg.reply("I've called for master, he will be with you shortly.");
                // }
                else if (msg.content.toLowerCase().trim() == "!faq soonthetix") {
                    msg.channel.send('It will be:', {
                        files: [
                            "images/soonthetix.gif"
                        ]
                    }).then(function (message) {
                        message.react("❌");
                    }).catch(function () {
                        //Something
                    });
                } else if (msg.content.toLowerCase().trim() == "!faq help") {
                    msg.reply("I can only answer a predefined question by its number or by alias in a channel, e.g. **question 1**, or **gas price**. \n For more commands and options send me **help** in DM");
                } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("!faq question")) {
                    doQuestion(msg, "!faq question", false);
                } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("!faq q ")) {
                    doQuestion(msg, "!faq q", false);
                } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("!faq q")) {
                    const args = msg.content.slice('!faq q'.length);
                    if (!isNaN(args)) {
                        doInnerQuestion(args, false, msg);
                    }
                } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("!faq calculate rewards")) {
                    let content = msg.content.toLowerCase().trim().replace(/ +(?= )/g, '');
                    const args = content.slice("faq calculate rewards".length).split(' ');
                    args.shift();
                    const command = args.shift().trim();
                    if (command && !isNaN(command)) {
                        var gas = false;
                        if (content.includes("with")) {
                            var argsSecondPart = content.slice(content.indexOf("with") + "with".length).split(' ');
                            argsSecondPart.shift();
                            gas = argsSecondPart.shift().trim();
                        }
                        doCalculate(command, msg, gas, false);
                    }
                } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("!faq calculate susd rewards")) {
                    const args = msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').slice("!faq calculate susd rewards".length).split(' ');
                    args.shift();
                    const command = args.shift().trim();
                    if (command && !isNaN(command)) {
                        doCalculateSusd(command, msg, false);
                    }
                } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("!faq show wallet")) {
                    const args = msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').slice("!faq show wallet".length).split(' ');
                    args.shift();
                    const command = args.shift().trim();
                    getMintrData(msg, command, false);
                } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("!faq synth ")) {
                    const args = msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').slice("!faq synth".length).split(' ');
                    args.shift();
                    const command = args.shift().trim();
                    if (command) {
                        doShowSynth(command, msg, false);
                    }
                } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("!faq show chart")) {
                    msg.reply("No longer supported. Use $ticker snx");
                } else if (msg.content.toLowerCase().startsWith(`!faq hedge`)) {
                    const args = msg.content.slice(`!faq hedge`.length).trim().split(' ');
                    const command = args.shift().toLowerCase();
                    msg.channel.send(getDebtHedgeMessage(command, df, othersDebtSum));
                    getDebtHedgeMessage(command, df, othersDebtSum);
                } else if (msg.content.toLowerCase().startsWith(`!hedge`)) {
                    const args = msg.content.slice(`!hedge`.length).trim().split(' ');
                    const command = args.shift().toLowerCase();
                    msg.channel.send(getDebtHedgeMessage(command, df, othersDebtSum));
                    getDebtHedgeMessage(command, df, othersDebtSum);
                } else if (msg.content.toLowerCase() == (`!faq debt`)) {
                    msg.channel.send(getDebtHedgeMessage('debt', df, othersDebtSum));
                } else if (msg.content.toLowerCase() == (`!debt`)) {
                    msg.channel.send(getDebtHedgeMessage('debt', df, othersDebtSum));
                } else if (msg.content.toLowerCase().startsWith(`!bug`)) {
                    let bugDTO = getBugDTO(msg);
                    var port = process.env.PORT || 3000;
                    axios.post('http://localhost:' + port + '/bug', {
                        bug: bugDTO
                    }).then(res => {
                        console.log(JSON.stringify(bugDTO) + `is now created`);
                        var messageEmbed = new Discord.MessageEmbed()
                            .addFields(
                                {
                                    name: 'Bug',
                                    value: "Your bug was stored with id " + bugDTO.id + ". A spartan will follow up."
                                }
                            ).setColor("#d32222")
                        msg.channel.send(messageEmbed);
                    })
                        .catch(error => {
                            console.error(error)
                        });
                } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("!faq ")) {
                    let found = checkAliasMatching(false);
                    if (!found) {
                        let notFoundMessage = "Oops, I don't know that one. You can check out my user guide: https://www.notion.so/Synthetix-Discord-FAQ-Bot-bb9f93cd2d1148ba86c0abbc58b06da0";
                        msg.channel.send(notFoundMessage).then(function (message) {
                            message.react("❌");
                        }).catch(function () {
                            //Something
                        });
                    }
                }
            } else {
                try {

                    // this is the logic for DM
                    console.log("I got sent a DM:" + msg.content);
                   if (msg.content.toLowerCase().startsWith(`hedge`)) {
                        const args = msg.content.slice(`hedge`.length).trim().split(' ');
                        const command = args.shift().toLowerCase();
                        msg.channel.send(getDebtHedgeMessage(command, df, othersDebtSum));
                        getDebtHedgeMessage(command, df, othersDebtSum);
                    } else if (msg.content.toLowerCase() == (`debt`)) {
                        msg.channel.send(getDebtHedgeMessage('debt', df, othersDebtSum));
                    } else {
                    let found = checkAliasMatching(true);
                    // if alias is found, just reply to it, otherwise continue

                    if (!found) {
                        let encodedForm = Buffer.from(msg.content.toLowerCase()).toString('base64');
                        if (checkIfUltimateQuestion(encodedForm)) {
                            answerUltimateQuestion();
                        } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("unsubscribe")) {
                            gasSubscribersMap.delete(msg.author.id);
                            gasSubscribersLastPushMap.delete(msg.author.id);
                            if (process.env.REDIS_URL) {
                                redisClient.set("gasSubscribersMap", JSON.stringify([...gasSubscribersMap]), function () {
                                });
                                redisClient.set("gasSubscribersLastPushMap", JSON.stringify([...gasSubscribersLastPushMap]), function () {
                                });
                            }
                            msg.reply("You are now unsubscribed from gas updates");
                        } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("subscribe gas")) {
                            const args = msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').slice("subscribe gas".length).split(' ');
                            args.shift();
                            const command = args.shift().trim();
                            if (command && !isNaN(command)) {
                                gasSubscribersMap.set(msg.author.id, command);
                                gasSubscribersLastPushMap.delete(msg.author.id);
                                if (process.env.REDIS_URL) {
                                    redisClient.set("gasSubscribersMap", JSON.stringify([...gasSubscribersMap]), function () {
                                    });
                                    redisClient.set("gasSubscribersLastPushMap", JSON.stringify([...gasSubscribersLastPushMap]), function () {
                                    });
                                }
                                msg.reply(" I will send you a message once safe gas price is below " + command + " gwei , and every hour after that that it remains below that level. \nTo change the threshold level for gas price, send me a new subscribe message with the new amount.\n" +
                                    "To unsubscribe, send me another DM **unsubscribe**.");
                            } else {
                                msg.reply(command + " is not a proper integer number.");
                            }
                        } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("show wallet")) {
                            const args = msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').slice("show wallet".length).split(' ');
                            args.shift();
                            const command = args.shift().trim();
                            getMintrData(msg, command, true);
                        } else if (msg.content.toLowerCase().trim() == "aliases") {
                            showAllAliases(true);
                        } else if (msg.content.toLowerCase().trim() == "help") {
                            doFaqHelp();
                        } else if (msg.content.startsWith("help ")) {
                            const args = msg.content.slice("help".length).split(' ');
                            args.shift();
                            const command = args.shift().trim();
                            if (command == "question") {
                                msg.reply("Choose your question with ***question questionNumber***, e.g. ***question 1***\nYou can get the question number via **list** command");
                            } else if (command == "category") {
                                msg.reply("Choose your category with ***category categoryName***, e.g. ***category SNX-Rewards***\nCategory name is fetched from **categories** command");
                            } else if (command == "search") {
                                msg.reply("Search for questions with ***search searchTerm***, e.g. ***search failing transactions***");
                            } else {
                                msg.reply("I don't know that one. Try just **help** for known commands");
                            }
                        } else if (msg.content.toLowerCase().trim() == "list" || msg.content.toLowerCase().trim() == "questions") {
                            listQuestions();
                        } else if (msg.content.toLowerCase().startsWith("question ")) {
                            console.log("question asked:" + msg.content);
                            doQuestion(msg, "question", true);
                        } else if (msg.content.toLowerCase().startsWith("q ")) {
                            console.log("question asked:" + msg.content);
                            doQuestion(msg, "q", true);
                        } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("q")) {
                            const args = msg.content.slice('q'.length);
                            if (!isNaN(args)) {
                                doInnerQuestion(args, true, msg);
                            }
                        } else if (msg.content == "categories") {
                            listCategories();
                        } else if (msg.content.toLowerCase().startsWith("category")) {

                            const args = msg.content.slice("category".length).split(' ');
                            args.shift();
                            const command = args.shift();

                            let rawdata = fs.readFileSync('categories/categories.json');
                            let categories = JSON.parse(rawdata);

                            const exampleEmbed = new Discord.MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle('Questions in category ' + command + ':');

                            let found = false;
                            categories.forEach(function (category) {
                                if (category.name == command) {
                                    found = true;
                                    category.questions.forEach(function (question) {
                                        rawdata = fs.readFileSync('questions/' + question + ".txt", "utf8");
                                        exampleEmbed.addField(question, rawdata, false);
                                    });
                                }
                            });

                            if (!found) {
                                exampleEmbed.addField('\u200b', "That doesn't look like a known category. Use a category name from **categories** command, e.g. **category Staking&Minting**");
                            } else {
                                exampleEmbed.addField('\u200b', 'Choose your question with e.g. **question 1**');
                            }
                            msg.reply(exampleEmbed);

                        } else if (msg.content.toLowerCase().startsWith("search ")) {

                            const args = msg.content.slice("search".length).split(' ').slice(1);
                            const searchWord = msg.content.substring("search".length + 1);
                            doSearch(searchWord, args);

                        } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("calculate rewards")) {
                            let content = msg.content.toLowerCase().trim().replace(/ +(?= )/g, '');
                            const args = content.slice("calculate rewards".length).split(' ');
                            args.shift();
                            const command = args.shift().trim();
                            if (command && !isNaN(command)) {
                                var gas = false;
                                if (content.includes("with")) {
                                    var argsSecondPart = content.slice(content.indexOf("with") + "with".length).split(' ');
                                    argsSecondPart.shift();
                                    gas = argsSecondPart.shift().trim();
                                }
                                doCalculate(command, msg, gas, true);
                            }
                        } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("calculate susd rewards")) {
                            let content = msg.content.toLowerCase().trim().replace(/ +(?= )/g, '');
                            const args = content.slice("calculate susd rewards".length).split(' ');
                            args.shift();
                            const command = args.shift().trim();
                            if (command && !isNaN(command)) {
                                var gas = false;
                                if (content.includes("with")) {
                                    var argsSecondPart = content.slice(content.indexOf("with") + "with".length).split(' ');
                                    argsSecondPart.shift();
                                    gas = argsSecondPart.shift().trim();
                                }
                                doCalculateSusd(command, msg, true);
                            }
                        } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("synth ")) {
                            const args = msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').slice("synth".length).split(' ');
                            args.shift();
                            const command = args.shift().trim();
                            if (command) {
                                doShowSynth(command, msg, true);
                            }
                        } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("show chart")) {
                            msg.reply("No longer supported. Use $ticker snx")
                        } else {
                            if (!msg.author.username.toLowerCase().includes("faq")) {
                                if (msg.content.endsWith("?")) {
                                    const args = msg.content.substring(0, msg.content.length - 1).split(' ');
                                    const searchWord = msg.content;
                                    doCustomQuestion(searchWord, args);
                                } else {
                                    msg.reply("Oops, I don't know that one. Try **help** to see what I do know, or if you want to ask a custom question, make sure it ends with a question mark **?**");
                                }
                            }
                        }
                    }
                }
                } catch (e) {
                    msg.reply("Unknown error ocurred.  Try **help** to see what I do know, or if you want to ask a custom question, make sure it ends with a question mark **?**");
                }
            }
        }

        function showAllAliases(isDM) {
            let rawdata = fs.readFileSync('categories/aliases.json');
            let aliases = JSON.parse(rawdata);
            let questionMap = new Map();
            aliases.forEach(function (alias) {
                let aliasQuestion = questionMap.get(alias.number);
                if (aliasQuestion) {
                    aliasQuestion.push(alias.alias);
                    questionMap.set(alias.number, aliasQuestion);
                } else {
                    let aliasQuestion = new Array();
                    aliasQuestion.push(alias.alias);
                    questionMap.set(alias.number, aliasQuestion);
                }
            });

            let exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Known aliases')
                .setURL('https://github.com/dgornjakovic/synthetix-faq-bot');
            exampleEmbed.setDescription('Hello, here are the aliases I know:');

            let counter = 0;
            let pagenumber = 2;
            for (let [questionNumber, questions] of questionMap) {
                let questionsString = "";
                questions.forEach(function (q) {
                    questionsString += (isDM ? "" : "!faq ") + q + "\n";
                })
                let rawdata = fs.readFileSync('answers/' + questionNumber + '.json');
                let answer = JSON.parse(rawdata);
                exampleEmbed.addField(answer.title + ' ' + answer.description, questionsString);

                counter++;
                if (counter == 10) {
                    if (isDM) {
                        msg.reply(exampleEmbed);
                    } else {
                        msg.channel.send(exampleEmbed).then(function (message) {
                            message.react("❌");
                        }).catch(function () {
                            //Something
                        });
                    }
                    exampleEmbed = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('Known aliases page ' + pagenumber)
                        .setURL('https://github.com/dgornjakovic/synthetix-faq-bot');
                    exampleEmbed.setDescription('Hello, here are the aliases I know:');
                    pagenumber++;
                    counter = 0;
                }

            }

            if (isDM) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }
        }

        function answerUltimateQuestion() {
            const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Bravo, you found the ultimate question!');

            exampleEmbed.setDescription(Buffer.from("d2hhdCBpcyB0aGUgYW5zd2VyIHRvIGxpZmUgdGhlIHVuaXZlcnNlIGFuZCBldmVyeXRoaW5nPw==", 'base64').toString('utf-8'));
            exampleEmbed.addField("The answer is:", Buffer.from("NDI=", 'base64').toString('utf-8'));

            msg.reply(exampleEmbed);
        }

        function checkIfUltimateQuestion(encodedForm) {
            return encodedForm == "d2hhdCBpcyB0aGUgYW5zd2VyIHRvIGxpZmUgdGhlIHVuaXZlcnNlIGFuZCBldmVyeXRoaW5nPw==" ||
                encodedForm == "d2hhdCdzIHRoZSBhbnN3ZXIgdG8gbGlmZSB0aGUgdW5pdmVyc2UgYW5kIGV2ZXJ5dGhpbmc/" ||
                encodedForm == "dGhlIGFuc3dlciB0byBsaWZlIHRoZSB1bml2ZXJzZSBhbmQgZXZlcnl0aGluZw==" ||
                encodedForm == "d2hhdCBpcyB0aGUgYW5zd2VyIHRvIGxpZmUgdGhlIHVuaXZlcnNlIGFuZCBldmVyeXRoaW5nPw==";
        }

        function checkAliasMatching(doReply) {
            let potentialAlias = msg.content.toLowerCase().replace("!faq", "").trim();
            let rawdata = fs.readFileSync('categories/aliases.json');
            let aliases = JSON.parse(rawdata);
            let found = false;
            aliases.forEach(function (alias) {
                if (alias.alias.toLowerCase().trim() == potentialAlias) {
                    found = true;
                    msg.content = "!faq question " + alias.number;
                    doQuestion(msg, "!faq question", doReply);
                }
            });
            return found;
        }

        function doFaqHelp() {
            const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Synthetix Frequently Asked Questions')
                .setURL('https://help.synthetix.io/hc/en-us');

            exampleEmbed.setDescription('Hello, here is list of commands I know:');
            exampleEmbed.addField("list", "Lists all known questions");
            exampleEmbed.addField("categories", "Lists all categories of known questions");
            exampleEmbed.addField("category categoryName", "Lists all known questions for a given category name, e.g. ** category *Staking&Minting* **");
            exampleEmbed.addField("question questionNumber", "Shows the answer to the question defined by its number, e.g. ** question *7* **");
            exampleEmbed.addField("search searchTerm", "Search all known questions by given search term, e.g. ** search *SNX price* **");
            exampleEmbed.addField("aliases", "List all known aliases");
            exampleEmbed.addField("subscribe gas gasPrice",
                "I will inform you the next time safe gas price is below your target gasPrice, e.g. **subscribe gas 30** will inform you if safe gas price is below 30 gwei");
            exampleEmbed.addField("calculate rewards snxStaked",
                "Calculate weekly SNX rewards per staked snx amount, as well as minting and claiming transaction estimates at current gas price. E.g. *calculate rewards 1000*. \n You can optionally add the gas price as parameter, e.g *calculate rewards 1000 with 30 gwei*");
            exampleEmbed.addField("calculate susd rewards snxStaked",
                "Calculate weekly susd rewards per staked snx amount based on the fees in the pool and the percentage of period passed.");
            exampleEmbed.addField("show wallet walletAddress",
                "Prints the staking information for the provided wallet");
            exampleEmbed.addField("synth synthName",
                "Shows the synth last price as well as its description");
            exampleEmbed.addField("synths gainers/losers",
                "Shows the best/worse performing synths in the last 24h");
            exampleEmbed.addField("faq hedge hedgeAmount",
                "For the given hedge amount worth of debt shows the mirror strategy to invest the synths in the following manner (in sUSD terms)");
            exampleEmbed.addField("faq debt",
                "Shows the current debt pool");
            exampleEmbed.addField("bug description of the bug",
                "Place the special word !bug at start of the sentence and a bug will be created containing your sentence");
            exampleEmbed.addField("\u200b", "*Or just ask me a question and I will do my best to find a match for you, e.g. **What is the current gas price?***");

            msg.reply(exampleEmbed);
        }

        function listQuestions() {
            let exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Frequently Asked Questions')
                .setURL('https://help.synthetix.io/hc/en-us');

            fs.readdir('questions', function (err, files) {
                if (err) {
                    console.log("Error getting directory information.")
                } else {
                    let counter = 0;
                    let pagenumber = 2;
                    files.sort(function (a, b) {
                        return a.substring(0, a.lastIndexOf(".")) * 1.0 - b.substring(0, b.lastIndexOf(".")) * 1.0;
                    });
                    files.forEach(function (file) {
                        let rawdata = fs.readFileSync('questions/' + file, "utf8");
                        exampleEmbed.addField(file.substring(0, file.lastIndexOf(".")), rawdata, false)
                        counter++;
                        if (counter == 20) {
                            msg.reply(exampleEmbed);
                            exampleEmbed = new Discord.MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle('Frequently Asked Questions page ' + pagenumber)
                                .setURL('https://help.synthetix.io/hc/en-us');
                            pagenumber++;
                            counter = 0;
                        }
                    })
                }
                exampleEmbed.addField('\u200b', 'Choose your question with e.g. **question 1**');
                msg.reply(exampleEmbed);
            })
        }

        function listCategories() {
            let rawdata = fs.readFileSync('categories/categories.json');
            let categories = JSON.parse(rawdata);

            const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Categories');

            categories.forEach(function (category) {
                exampleEmbed.addField(category.name, category.desc, false);
            });

            exampleEmbed.addField('\u200b', "Choose the category with **category categoryName**, e.g. **category SNX**, or **category Synthetix.Exchange**");
            msg.reply(exampleEmbed);
        }

        function doSearch(searchWord, args) {
            const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Questions found for ***' + searchWord + '***:');

            const Match = class {
                constructor(title, value) {
                    this.title = title;
                    this.value = value;
                }

                matchedCount = 0;
                title;
                value;
            };

            const fullMatches = [];
            const partialMatches = [];
            fs.readdir('questions', function (err, files) {
                if (err) {
                    console.log("Error getting directory information.")
                } else {
                    files.sort(function (a, b) {
                        return a.substring(0, a.lastIndexOf(".")) * 1.0 - b.substring(0, b.lastIndexOf(".")) * 1.0;
                    });
                    files.forEach(function (file) {
                        let rawdata = fs.readFileSync('questions/' + file, "utf8");
                        if (rawdata.includes(searchWord)) {
                            rawdata = replaceString(rawdata, searchWord, '**' + searchWord + '**');
                            fullMatches.push(new Match(file.substring(0, file.lastIndexOf(".")), rawdata));
                        } else {
                            let matchedCount = 0;
                            args.sort(function (a, b) {
                                return a.length - b.length;
                            });
                            args.forEach(function (arg) {
                                if (rawdata.toLowerCase().includes(arg.toLowerCase())) {
                                    rawdata = replaceString(rawdata, arg, '**' + arg + '**');
                                    rawdata = replaceString(rawdata, arg.toLowerCase(), '**' + arg.toLowerCase() + '**');
                                    rawdata = replaceString(rawdata, arg.toUpperCase(), '**' + arg.toUpperCase() + '**');
                                    matchedCount++;
                                }
                            });
                            if (matchedCount > 0) {
                                let match = new Match(file.substring(0, file.lastIndexOf(".")), rawdata);
                                match.matchedCount = matchedCount;
                                partialMatches.push(match);
                            }
                        }
                    })
                }

                if (fullMatches.length == 0 && partialMatches.length == 0) {
                    exampleEmbed.setTitle('No questions found for ***' + searchWord + '***. Please refine your search.');
                } else {

                    let counter = 0;
                    fullMatches.forEach(function (match) {
                        counter++;
                        if (counter < 6) {
                            exampleEmbed.addField(match.title, match.value, false);
                        }
                    });

                    partialMatches.sort(function (a, b) {
                        return b.matchedCount - a.matchedCount;
                    });
                    partialMatches.forEach(function (match) {
                        counter++;
                        if (counter < 6) {
                            exampleEmbed.addField(match.title, match.value, false);
                        }
                    });

                    exampleEmbed.addField('\u200b', 'Choose your question with e.g. **question 1**');
                }
                msg.reply(exampleEmbed);
            })
        }

        function doCustomQuestion(searchWord, args) {
            const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Looks like you asked a custom question. This is the best I could find for your query:');

            const Match = class {
                constructor(title, value) {
                    this.title = title;
                    this.value = value;
                }

                matchedCount = 0;
                title;
                value;
            };

            const fullMatches = [];
            const partialMatches = [];
            fs.readdir('questions', function (err, files) {
                if (err) {
                    console.log("Error getting directory information.")
                } else {
                    files.sort(function (a, b) {
                        return a.substring(0, a.lastIndexOf(".")) * 1.0 - b.substring(0, b.lastIndexOf(".")) * 1.0;
                    });
                    files.forEach(function (file) {
                        let rawdata = fs.readFileSync('questions/' + file, "utf8");
                        if (rawdata.includes(searchWord)) {
                            rawdata = replaceString(rawdata, searchWord, '**' + searchWord + '**');
                            fullMatches.push(new Match(file.substring(0, file.lastIndexOf(".")), rawdata));
                        } else {
                            args.sort(function (a, b) {
                                return a.length - b.length;
                            });
                            let matchedCount = 0;
                            args.forEach(function (arg) {
                                if (rawdata.toLowerCase().includes(arg.toLowerCase())) {
                                    rawdata = replaceString(rawdata, arg, '**' + arg + '**');
                                    rawdata = replaceString(rawdata, arg.toLowerCase(), '**' + arg.toLowerCase() + '**');
                                    rawdata = replaceString(rawdata, arg.toUpperCase(), '**' + arg.toUpperCase() + '**');
                                    matchedCount++;
                                }
                            });
                            if (matchedCount > 0) {
                                let match = new Match(file.substring(0, file.lastIndexOf(".")), rawdata);
                                match.matchedCount = matchedCount;
                                partialMatches.push(match);
                            }
                        }
                    })
                }

                if (fullMatches.length == 0 && partialMatches.length == 0) {
                    exampleEmbed.setTitle('No questions found for ***' + searchWord + '***. Please refine your search.');
                } else {

                    let counter = 0;
                    fullMatches.forEach(function (match) {
                        counter++;
                        if (counter < 4) {
                            exampleEmbed.addField(match.title, match.value, false);
                        }
                    });

                    partialMatches.sort(function (a, b) {
                        return b.matchedCount - a.matchedCount;
                    });
                    partialMatches.forEach(function (match) {
                        counter++;
                        if (counter < 4) {
                            exampleEmbed.addField(match.title, match.value, false);
                        }
                    });

                    exampleEmbed.addField('\u200b', 'Choose your question with e.g. **question 1**');
                }
                msg.reply(exampleEmbed);
            })
        }


        function doQuestion(msg, toSlice, doReply) {
            const args = msg.content.slice(toSlice.length).split(' ');
            args.shift();
            const command = args.shift();
            doInnerQuestion(command, doReply, msg);
        }

    }
)

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/ethereum', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                ethPrice = result.market_data.current_price.usd;
            } catch (e) {
                console.log(e);
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/tokencard', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                tknPrice = result.market_data.current_price.usd;
                tknPrice = Math.round(((tknPrice * 1.0) + Number.EPSILON) * 100) / 100;
                tknMarketCap = result.market_data.market_cap.usd;
            } catch (e) {
                console.log(e);
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/yaxis', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                yaxisEth = result.market_data.current_price.eth;
                yaxisEth = Math.round(((yaxisEth * 1.0) + Number.EPSILON) * 10000) / 10000;
                yaxisMarketCap = result.market_data.total_supply * yaxisPrice;
                yaxisMarketCap = Math.round(((yaxisMarketCap * 1.0) + Number.EPSILON) * 100) / 100;
            } catch (e) {
                console.log(e);
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/switcheo', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                swthPrice = result.market_data.current_price.usd;
                swthPrice = Math.round(((swthPrice * 1.0) + Number.EPSILON) * 1000) / 1000;
                swthMarketCap = result.market_data.market_cap.usd;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/yvault-lp-ycurve', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                yusdPrice = result.market_data.current_price.usd;
                yusdPrice = Math.round(((yusdPrice * 1.0) + Number.EPSILON) * 1000) / 1000;
                yusdMarketCap = result.market_data.market_cap.usd;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);


setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/value-liquidity', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                yfvPrice = result.market_data.current_price.usd;
                yfvPrice = Math.round(((yfvPrice * 1.0) + Number.EPSILON) * 1000) / 1000;
                yfvMarketCap = result.market_data.market_cap.usd;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);


setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/swerve-dao', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                swervePrice = result.market_data.current_price.usd;
                swervePrice = Math.round(((swervePrice * 1.0) + Number.EPSILON) * 1000) / 1000;
                swerveMarketcap = result.market_data.market_cap.usd;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/dodo', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                dodoPrice = result.market_data.current_price.usd;
                dodoPrice = Math.round(((dodoPrice * 1.0) + Number.EPSILON) * 1000) / 1000;
                dodoMarketcap = result.market_data.market_cap.usd;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/nectar-token', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                necPrice = result.market_data.current_price.usd;
                necPrice = Math.round(((necPrice * 1.0) + Number.EPSILON) * 1000) / 1000;
                necMarketcap = result.market_data.market_cap.usd;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/dracula-token', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                drcPrice = result.market_data.current_price.usd;
                drcPrice = Math.round(((drcPrice * 1.0) + Number.EPSILON) * 1000) / 1000;
                drcMarketcap = result.market_data.market_cap.usd;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);


setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/perpetual-protocol', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                perpPrice = result.market_data.current_price.usd;
                perpPrice = Math.round(((perpPrice * 1.0) + Number.EPSILON) * 1000) / 1000;
                perpMarketcap = result.market_data.market_cap.usd;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);


setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/hegic', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                hegicPrice = result.market_data.current_price.usd;
                hegicPrice = Math.round(((hegicPrice * 1.0) + Number.EPSILON) * 1000) / 1000;
                hegicMarketcap = result.market_data.market_cap.usd;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);


setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/meta', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                metaPrice = result.market_data.current_price.usd;
                metaPrice = Math.round(((metaPrice * 1.0) + Number.EPSILON) * 1000) / 1000;
                metaMarketCap = result.market_data.market_cap.usd;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/pickle-finance', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                picklePrice = result.market_data.current_price.usd;
                picklePrice = Math.round(((picklePrice * 1.0) + Number.EPSILON) * 1000) / 1000;
                pickleEthPrice = result.market_data.current_price.eth;
                pickleEthPrice = Math.round(((pickleEthPrice * 1.0) + Number.EPSILON) * 1000) / 1000;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/vidya', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                vidyaPrice = result.market_data.current_price.usd;
                vidyaPrice = Math.round(((vidyaPrice * 1.0) + Number.EPSILON) * 10000) / 10000;
                vidyaEthPrice = result.market_data.current_price.eth;
                vidyaEthPrice = Math.round(((vidyaEthPrice * 1.0) + Number.EPSILON) * 100000) / 100000;
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/curve-dao-token', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                crvPrice = result.market_data.current_price.usd;
                crvPrice = Math.round(((crvPrice * 1.0) + Number.EPSILON) * 100) / 100;
            } catch (e) {
                console.log(e);
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/havven', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                snxPrice = result.market_data.current_price.usd;
            } catch (e) {
                console.log(e);
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 50 * 1000);


setInterval(function () {
    //'https://gasprice.poa.network/
    //https://www.gasnow.org/api/v3/gas/price
    try {


        https.get('https://www.gasnow.org/api/v3/gas/price', (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try {
                    let result = JSON.parse(data);
                    gasPrice = result.data.standard / 1000000000;
                    fastGasPrice = result.data.fast / 1000000000;
                    lowGasPrice = result.data.slow / 1000000000;
                    instantGasPrice = result.data.rapid / 1000000000;
                    gasPrice = Math.round(((gasPrice * 1.0) + Number.EPSILON) * 10) / 10;
                    fastGasPrice = Math.round(((fastGasPrice * 1.0) + Number.EPSILON) * 10) / 10;
                    lowGasPrice = Math.round(((lowGasPrice * 1.0) + Number.EPSILON) * 10) / 10;
                    instantGasPrice = Math.round(((instantGasPrice * 1.0) + Number.EPSILON) * 10) / 10;
                } catch (e) {
                    console.log(e);
                }
            });
        });
    } catch (e) {
        console.log(e);
    }

}, 30 * 1000);


function handleGasSubscription() {
    //https://www.gasnow.org/api/v3/gas/price
    //https://www.gasnow.org/api/v3/gas/price
    try {

        gasSubscribersMap.forEach(function (value, key) {
            try {
                if ((gasPrice * 1.0) < (value * 1.0)) {
                    if (gasSubscribersLastPushMap.has(key)) {
                        var curDate = new Date();
                        var lastNotification = new Date(gasSubscribersLastPushMap.get(key));
                        var hours = Math.abs(curDate - lastNotification) / 36e5;
                        if (hours > 1) {
                            if (client.users.cache.get(key)) {
                                client.users.cache.get(key).send('gas price is now below your threshold. Current safe gas price is: ' + gasPrice);
                                gasSubscribersLastPushMap.set(key, new Date().getTime());
                                if (process.env.REDIS_URL) {
                                    redisClient.set("gasSubscribersMap", JSON.stringify([...gasSubscribersMap]), function () {
                                    });
                                    redisClient.set("gasSubscribersLastPushMap", JSON.stringify([...gasSubscribersLastPushMap]), function () {
                                    });
                                }
                            } else {
                                console.log("User:" + key + " is no longer in this server");
                                gasSubscribersLastPushMap.delete(key);
                                gasSubscribersMap.delete(key);
                                if (process.env.REDIS_URL) {
                                    redisClient.set("gasSubscribersMap", JSON.stringify([...gasSubscribersMap]), function () {
                                    });
                                    redisClient.set("gasSubscribersLastPushMap", JSON.stringify([...gasSubscribersLastPushMap]), function () {
                                    });
                                }
                            }
                        }
                    } else {
                        if (client.users.cache.get(key)) {
                            client.users.cache.get(key).send('gas price is now below your threshold. Current safe gas price is: ' + gasPrice);
                            gasSubscribersLastPushMap.set(key, new Date());
                            if (process.env.REDIS_URL) {
                                redisClient.set("gasSubscribersMap", JSON.stringify([...gasSubscribersMap]), function () {
                                });
                                redisClient.set("gasSubscribersLastPushMap", JSON.stringify([...gasSubscribersLastPushMap]), function () {
                                });
                            }
                        } else {
                            console.log("User:" + key + " is no longer in this server");
                            gasSubscribersLastPushMap.delete(key);
                            gasSubscribersMap.delete(key);
                            if (process.env.REDIS_URL) {
                                redisClient.set("gasSubscribersMap", JSON.stringify([...gasSubscribersMap]), function () {
                                });
                                redisClient.set("gasSubscribersLastPushMap", JSON.stringify([...gasSubscribersLastPushMap]), function () {
                                });
                            }
                        }
                    }
                } else {
                    //console.log("Not sending a gas notification for: " + key + " because " + value + " is below gas " + gasPrice);
                }
            } catch (e) {
                console.log("Error occured when going through subscriptions for key: " + key + "and value " + value + " " + e);
            }
        });
    } catch (e) {
        console.log(e);
    }

}

const puppeteer = require('puppeteer');

async function getSnxToolStaking() {
    try {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        console.log("Fetching SNX tools data");
        const page = await browser.newPage();
        await page.setViewport({width: 1000, height: 926});
        await page.goto("https://snx.tools/calculator/staking/", {waitUntil: 'networkidle2'});

        /** @type {string[]} */
        var prices = await page.evaluate(() => {
            var div = document.querySelectorAll('span.text-white');

            var prices = []
            div.forEach(element => {
                prices.push(element.textContent);
            });

            return prices
        })

        if (!isNaN(prices[3].split(' ')[0] * 1.0)) {
            snxRewardsPerMinterUsd = prices[3].split(' ')[0] * 1.0;
        }
        snxRewardsThisPeriod = prices[5];
        totalDebt = prices[6];
        console.log("Fetched SNX tools data");
        console.log("Fetched snxRewardsThisPeriod:" + snxRewardsThisPeriod);
        browser.close()
    } catch (e) {
        console.log("Error happened on getting data from SNX tools.");
        console.log(e);
    }
}

async function getSnxToolHome() {
    try {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const page = await browser.newPage();
        await page.setViewport({width: 1000, height: 926});
        await page.goto("https://snx.tools/home", {waitUntil: 'networkidle2'});

        /** @type {string[]} */
        var prices = await page.evaluate(() => {
            var div = document.querySelectorAll('span.text-2xl');

            var prices = []
            div.forEach(element => {
                prices.push(element.textContent);
            });

            return prices
        })

        periodVolume = prices[3];
        browser.close()
    } catch (e) {
        console.log("Error happened on getting data from SNX tools home.");
        console.log(e);
    }
}


async function getDashboard() {
    try {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const page = await browser.newPage();
        await page.setViewport({width: 1000, height: 926});
        await page.goto("https://dashboard.synthetix.io/", {waitUntil: 'networkidle2'});

        /** @type {string[]} */
        var prices = await page.evaluate(() => {


            var prices = []

            var div = document.querySelectorAll('.cpEXSW');
            div.forEach(element => {
                prices.push(element.textContent);
            });

            div = document.querySelectorAll('.iDnUTE div');
            div.forEach(element => {
                prices.push(element.textContent);
            });

            return prices
        })

        currentFees = prices[5];
        poolDistribution = prices.slice(11, 21);
        browser.close()
    } catch (e) {
        console.log("Error happened on getting data from dashboard")
    }
}

async function getExchange() {
    try {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const page = await browser.newPage();
        await page.setViewport({width: 1000, height: 926});
        await page.goto("https://synthetix.exchange/#/synths", {waitUntil: 'networkidle2'});
        await delay(5000);

        /** @type {string[]} */
        var prices = await page.evaluate(() => {
            var div = document.querySelectorAll('.table-body-row span');

            var prices = []
            div.forEach(element => {
                prices.push(element.textContent);
            });

            return prices
        })

        var i = 0;
        synths = new Array();
        while (i < prices.length) {
            if (prices[2] == '-') break;
            let synthName = prices[i].substring(0, prices[i].lastIndexOf(prices[i + 1]));
            let gain = prices[i + 3];
            if (gain == "-") {
                gain = "0%";
            }
            let synth = new Synth(synthName, prices[i + 2], gain);
            if (synthsMap.has(synthName.toLowerCase())) {
                synth = synthsMap.get(synthName.toLowerCase());
                synth.gain = gain;
                synth.price = prices[i + 2];
            }
            synths.push(synth);
            if (prices[i + 3] == "-" && synthName.toLowerCase() != "susd") {
                i = i + 5;
            } else {
                i = i + 4;
            }
            synthsMap.set(synthName.toLowerCase(), synth);
        }
        synths.sort(function (a, b) {
            return b.gain.replace(/%/g, "") * 1.0 - a.gain.replace(/%/g, "") * 1.0;
        });

        browser.close()
    } catch (e) {
        console.log("Error happened on getting data from synthetix exchange");
        console.log(e);
    }
}

async function getSynthInfo(synth) {
    try {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const page = await browser.newPage();
        await page.setViewport({width: 1000, height: 1226});
        await page.goto("https://synthetix.exchange/#/synths/" + synth, {waitUntil: 'networkidle2'});
        await page.waitForSelector('div.isELEY');
        await delay(5000);

        const rect = await page.evaluate(() => {
            const element = document.querySelector('div.isELEY');
            const {x, y, width, height} = element.getBoundingClientRect();
            return {left: x, top: y, width, height, id: element.id};
        });

        await page.screenshot({
            path: 'charts/chart' + synth.toLowerCase() + '.png',
            clip: {
                x: rect.left - 0,
                y: rect.top - 0,
                width: rect.width + 0 * 2,
                height: rect.height + 0 * 2
            }
        });
        console.log("Got screenshot for: " + synth);
        browser.close()
    } catch (e) {
        console.log("Error happened on getting data from synthetix exchange");
        console.log(e);
    }
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

let sethPeg = 1
setInterval(function () {
    try {
        https.get('https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb&toTokenAddress=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&amount=10000000000000000000', (resp) => {
            try {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    try {
                        let result = JSON.parse(data).toTokenAmount / 1e19;
                        sethPeg = Math.round(((result * 1.0) + Number.EPSILON) * 1000) / 1000;
                    } catch
                        (e) {
                        console.log("Error on fetching 1inch peg: ", e);
                    }
                });
            } catch (e) {
                console.log("Error on fetching 1inch peg: ", e);
            }

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch
        (e) {
        console.log("Error on fetching 1inch peg: ", e);
    }

}, 60 * 1000);

setInterval(function () {
    try {
        https.get('https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=0x57Ab1ec28D129707052df4dF418D58a2D46d5f51&toTokenAddress=0xdAC17F958D2ee523a2206206994597C13D831ec7&amount=10000000000000000000000', (resp) => {
            try {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    try {
                        let result = JSON.parse(data).toTokenAmount / 1e10;
                        usdtPeg = Math.round(((result * 1.0) + Number.EPSILON) * 1000) / 1000;
                    } catch
                        (e) {
                        console.log("Error on fetching 1inch peg: ", e);
                    }
                });
            } catch (e) {
                console.log("Error on fetching 1inch peg: ", e);
            }

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch
        (e) {
        console.log("Error on fetching 1inch peg: ", e);
    }

}, 60 * 1000);

setInterval(function () {
    try {
        https.get('https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=0x57Ab1ec28D129707052df4dF418D58a2D46d5f51&toTokenAddress=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&amount=10000000000000000000000', (resp) => {
            try {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    try {
                        let result = JSON.parse(data).toTokenAmount / 1e10;
                        usdcPeg = Math.round(((result * 1.0) + Number.EPSILON) * 1000) / 1000;
                    } catch (e) {
                        console.log("Error: ", e);
                    }
                });
            } catch
                (e) {
                console.log("Error on fetching 1inch peg: ", e);
            }

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch
        (e) {
        console.log("Error on fetching 1inch peg: ", e);
    }

}, 60 * 1000);

setInterval(function () {
    try {
        https.get('https://api.coingecko.com/api/v3/coins/havven', (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try {
                    let result = JSON.parse(data);
                    coingeckoUsd = result.market_data.current_price.usd;
                    coingeckoEth = result.market_data.current_price.eth;
                    coingeckoEth = Math.round(((coingeckoEth * 1.0) + Number.EPSILON) * 1000) / 1000;
                    coingeckoBtc = result.market_data.current_price.btc;
                    coingeckoBtc = Math.round(((coingeckoBtc * 1.0) + Number.EPSILON) * 1000000) / 1000000;
                } catch (e) {
                    console.log(e);
                }
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch (e) {
        console.log(e);
    }
}, 30 * 1000);

setInterval(function () {
    https.get('https://api.binance.com/api/v1/ticker/price?symbol=SNXUSDT', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                let result = JSON.parse(data);
                binanceUsd = Math.round(((result.price * 1.0) + Number.EPSILON) * 100) / 100;
            } catch (e) {
                console.log(e);
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}, 30 * 1000);

setInterval(function () {

    clientYaxisPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("759905699232481280").setNickname("$" + yaxisPrice);
            value.members.cache.get("759905699232481280").user.setActivity("Ξ=" + coingeckoEth + " marketcap=$" + getNumberLabel(yaxisMarketCap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });

    clientYaxisSupply.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("762450845312745482").setNickname("c.supply=" + yaxisTotalSuuply);
            value.members.cache.get("762450845312745482").user.setActivity("totalSupply=" + 1000000, {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });

    clientFaqPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("745782311382941787").setNickname("$" + binanceUsd);
            value.members.cache.get("745782311382941787").user.setActivity("eth=" + coingeckoEth + " btc=" + coingeckoBtc, {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientPegPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("745786402817441854").setNickname("$" + Math.round(((((usdcPeg + usdtPeg) / 2)) + Number.EPSILON) * 100) / 100);
            value.members.cache.get("745786402817441854").user.setActivity("usdt=" + usdtPeg + " usdc=" + usdcPeg, {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientsSEthPegPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("844321938456313887").setNickname("sETH peg");
            value.members.cache.get("844321938456313887").user.setActivity("" + sethPeg, {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientEthPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("745936624935895071").setNickname("$" + ethPrice);
        } catch (e) {
            console.log(e);
        }
    });
    clientTknPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("745936898870083614").setNickname("$" + tknPrice);
            value.members.cache.get("745936898870083614").user.setActivity("marketcap=$" + getNumberLabel(tknMarketCap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientCRVPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("746121396396097587").setNickname("$" + crvPrice);
        } catch (e) {
            console.log(e);
        }
    });
    clientSWTHPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("746120731204649050").setNickname("$" + swthPrice);
            value.members.cache.get("746120731204649050").user.setActivity("marketcap=$" + getNumberLabel(swthMarketCap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientYUSDPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("758075102779932782").setNickname("$" + yusdPrice);
            value.members.cache.get("758075102779932782").user.setActivity("marketcap=$" + getNumberLabel(yusdMarketCap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientYFVPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("759166562589868054").setNickname("$" + yfvPrice);
            value.members.cache.get("759166562589868054").user.setActivity("marketcap=$" + getNumberLabel(yfvMarketCap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientYFVOldPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("768480537630343179").setNickname("$" + yfvOldPrice);
            value.members.cache.get("768480537630343179").user.setActivity("marketcap=$" + getNumberLabel(yfvOldMarketCap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientSwervePrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("766063695037333514").setNickname("$" + swervePrice);
            value.members.cache.get("766063695037333514").user.setActivity("marketcap=$" + getNumberLabel(swerveMarketcap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientDodoPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("766064081483726909").setNickname("$" + dodoPrice);
            value.members.cache.get("766064081483726909").user.setActivity("marketcap=$" + getNumberLabel(dodoMarketcap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientDrcPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("772406482184175636").setNickname("$" + drcPrice);
            value.members.cache.get("772406482184175636").user.setActivity("marketcap=$" + getNumberLabel(drcMarketcap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientPerpPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("775312068106125343").setNickname("$" + perpPrice);
            value.members.cache.get("775312068106125343").user.setActivity("marketcap=$" + getNumberLabel(perpMarketcap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientNecPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("776881969450582026").setNickname("$" + necPrice);
            value.members.cache.get("776881969450582026").user.setActivity("marketcap=$" + getNumberLabel(necMarketcap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientHegicPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("770275139291185233").setNickname("$" + hegicPrice);
            value.members.cache.get("770275139291185233").user.setActivity("marketcap=$" + getNumberLabel(hegicMarketcap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
    clientMetaPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("757338136039653558").setNickname("$" + metaPrice);
            value.members.cache.get("757338136039653558").user.setActivity("marketcap=$" + getNumberLabel(metaMarketCap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });

    clientPicklePrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("755401176656379924").user.setActivity("price=$" + picklePrice + " Ξ" + pickleEthPrice, {type: 'WATCHING'});
        } catch (e) {
            console.log(e);
        }
    });

    clientVIDYAPrice.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("758674094022590525").setNickname("$" + vidyaPrice);
            value.members.cache.get("758674094022590525").user.setActivity("Ξ" + vidyaEthPrice, {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });
}, 45 * 1000);

//FIXME: dont forget

function getNumberLabel(labelValue) {

    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

        ? Math.round(Math.abs(Number(labelValue)) / 1.0e+9) + "B"
        // Six Zeroes for Millions
        : Math.abs(Number(labelValue)) >= 1.0e+6

            ? Math.round(Math.abs(Number(labelValue)) / 1.0e+6) + "M"
            // Three Zeroes for Thousands
            : Math.abs(Number(labelValue)) >= 1.0e+3

                ? Math.round(Math.abs(Number(labelValue)) / 1.0e+3) + "K"

                : Math.abs(Number(labelValue));

}


setInterval(async function () {
    try {
        yaxis = new Token(ChainId.MAINNET, '0xb1dC9124c395c1e97773ab855d66E879f053A289', 18)

        // note that you may want/need to handle this async code differently,
        // for example if top-level await is not an option
        pair = await Fetcher.fetchPairData(yaxis, WETH[yaxis.chainId])

        var route = new Route([pair], WETH[yaxis.chainId])

        yaxisPrice = route.midPrice.invert().toSignificant(6) * ethPrice;
        yaxisPrice = Math.round(((yaxisPrice * 1.0) + Number.EPSILON) * 100) / 100;
    } catch (e) {
        console.log(e);
    }
}, 60 * 1000);

setInterval(function () {
    try {
        https.get('https://trade.kucoin.com/_api/trade-front/market/getSymbolTick?symbols=SNX-USDT', (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try {
                    let result = JSON.parse(data);
                    kucoinUsd = result.data[0].lastTradedPrice;
                    kucoinUsd = Math.round(((kucoinUsd * 1.0) + Number.EPSILON) * 100) / 100;
                } catch (e) {
                    console.log(e);
                }
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch (e) {
        console.log(e);
    }
}, 60 * 1000);


setInterval(function () {
    try {
        https.get('https://yaxis.io/api/circulatingSupply', (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try {
                    let result = JSON.parse(data);
                    yaxisCircSupply = result;
                    yaxisCircSupply = Math.round(((yaxisCircSupply * 1.0) + Number.EPSILON) * 100) / 100;
                } catch (e) {
                    console.log(e);
                }
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });

        https.get('https://yaxis.io/api/totalSupply', (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try {
                    let result = JSON.parse(data);
                    yaxisTotalSuuply = result;
                    yaxisTotalSuuply = Math.round(((yaxisTotalSuuply * 1.0) + Number.EPSILON) * 100) / 100;
                } catch (e) {
                    console.log(e);
                }
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch (e) {
        console.log(e);
    }
}, 1000 * 60 * 5);

function doCalculate(command, msg, gasPriceParam, fromDM) {
    try {
        snxToMintUsd = 1 / (snxPrice / 4);
        var gasPriceToUse = gasPrice;
        if (gasPriceParam) {
            gasPriceToUse = gasPriceParam;
        }
        let resRew = Math.round(((command * snxRewardsPerMinterUsd / snxToMintUsd) + Number.EPSILON) * 100) / 100;
        let resRewInSusd = Math.round(((resRew * snxPrice) + Number.EPSILON) * 100) / 100;
        let mintingPrice = Math.round(((mintGas * gasPriceToUse * ethPrice * 0.000000001) + Number.EPSILON) * 100) / 100;
        let claimPrice = Math.round(((claimGas * gasPriceToUse * ethPrice * 0.000000001) + Number.EPSILON) * 100) / 100;
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Calculated rewards:');
        exampleEmbed.addField("SNX weekly rewards", "You are expected to receive **" + resRew + "** SNX per week for **" + command + "** staked SNX"
            + "\n The estimated value of SNX rewards is: **" + resRewInSusd + "$**");
        exampleEmbed.addField("Transaction costs", "With the gas price at **" + gasPriceToUse + " gwei** minting would cost **" + mintingPrice + "$** and claiming would cost **"
            + claimPrice + "$**");
        exampleEmbed.addField("General info", "Total SNX rewards this week:**" + snxRewardsThisPeriod + "**\n" + "Total Debt:**" + totalDebt + "**\n" + "SNX to mint 1 sUSD:**" + snxToMintUsd + "**\n");
        if (!fromDM) {
            exampleEmbed.setFooter("By the way, you can calculate rewards in a private DM conversation with the bot" +
                " if you don't want to reveal your very large (or very small!) amounts in a public forum." +
                "  Just omit the \"!faq\" prefix. Send a DM message to FAQ bot with the command: calculate rewards [stakedSnxAmount]");
        }
        if (fromDM) {
            msg.reply(exampleEmbed);
        } else {
            msg.channel.send(exampleEmbed).then(function (message) {
                message.react("❌");
            }).catch(function () {
                //Something
            });
        }
    } catch
        (e) {
        console.log(e);
    }
}

function doCalculateSusd(command, msg, fromDM) {
    try {
        var today = new Date();
        while (today > payday) {
            payday.setDate(payday.getDate() + 7);
        }
        var difference = payday.getTime() - today.getTime();
        var seconds = Math.floor(difference / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);

        var totalFeesNumber = currentFees.replace(/,/g, '').replace(/\$/g, '') * 1.0;
        var feesPeriod = totalFeesNumber;
        var percentagePassed = Math.round(((100 - (hours * 100) / (7 * 24)) + Number.EPSILON) * 100) / 100;
        var scaledPeriod = feesPeriod * ((200 - percentagePassed) / 100);
        scaledPeriod = Math.round((scaledPeriod + Number.EPSILON) * 100) / 100;

        var totalDebtNumber = totalDebt.replace(/,/g, '').replace(/\$/g, '') * 1.0;
        var sUsdRewardPerMintedSusd = scaledPeriod / totalDebtNumber;


        let resRew = Math.round(((command * sUsdRewardPerMintedSusd / snxToMintUsd) + Number.EPSILON) * 100) / 100;
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Calculated rewards:');
        exampleEmbed.addField("sUSD weekly rewards", "You are expected to receive **" + resRew + "** sUSD per week for **" + command + "** staked SNX");
        exampleEmbed.addField("General info", "sUSD fees in this period:**$" + feesPeriod + "**\n"
            + "Percentage of the period passed:**" + percentagePassed + "%**\n"
            + "sUSD fees scaled for whole period:**$" + scaledPeriod + "**\n"
            + "Total debt:**" + totalDebt + "**\n"
            + "sUSD rewards per minted sUSD:**" + sUsdRewardPerMintedSusd + "**\n"
            + "SNX to mint 1 sUSD:**" + snxToMintUsd + "**\n");
        if (!fromDM) {
            exampleEmbed.setFooter("By the way, you can calculate rewards in a private DM conversation with the bot if you don't want to reveal your very large (or very small!)" +
                " amounts in a public forum.  Just omit the \"!faq\" prefix. Send a DM message to FAQ bot with the command: calculate susd rewards [stakedSnxAmount]");
        }
        if (fromDM) {
            msg.reply(exampleEmbed);
        } else {
            msg.channel.send(exampleEmbed).then(function (message) {
                message.react("❌");
            }).catch(function () {
                //Something
            });
        }
    } catch
        (e) {
        console.log(e);
    }
}

function doShowSynth(command, msg, fromDm) {
    try {
        let synthInfo = synthsMap.get(command);
        if (synthInfo) {
            const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Synth info:');

            let arrow = (synthInfo.gain.replace(/%/g, "") * 1.0 == 0) ? " - " : (synthInfo.gain.replace(/%/g, "") * 1.0 > 0) ? " ⤤ " : " ⤥ ";
            exampleEmbed.addField(synthInfo.name,
                "Price:**" + synthInfo.price + "**\n"
                + "Gain:**" + synthInfo.gain + arrow + "**\n"
            );


            exampleEmbed.attachFiles(['charts/chart' + command.toLowerCase() + '.png'])
                .setImage('attachment://' + 'chart' + command.toLowerCase() + '.png');

            if (fromDm) {
                msg.reply(exampleEmbed);
            } else {
                msg.channel.send(exampleEmbed).then(function (message) {
                    message.react("❌");
                }).catch(function () {
                    //Something
                });
            }
        } else {
            msg.reply("Synth not available");
        }
    } catch (e) {
        console.log("Error occurred on show synth");
    }
}

function doShowChart(type, msg, fromDM) {
    try {
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(type + ' SNX price chart');
        exampleEmbed.addField("Possible options:", "realtime, 24H, 7D, 1M, 3M, 6M, YTD, 1Y, ALL");
        exampleEmbed.attachFiles(['charts/chart' + type.toLowerCase() + '.png'])
            .setImage('attachment://' + 'chart' + type.toLowerCase() + '.png');
        if (fromDM) {
            msg.reply(exampleEmbed);
        } else {
            msg.channel.send(exampleEmbed).then(function (message) {
                message.react("❌");
            }).catch(function () {
                //Something
            });
        }
    } catch (e) {
        console.log("Exception happened when showing the chart");
        console.log(e);
    }
}

setTimeout(function () {
    try {
        var increment = 1;
        synthsMap.forEach(function (value, key) {
            increment += 1;
            setTimeout(function () {
                getSynthInfo(value.name)
            }, 1000 * 30 * increment);
        });
    } catch (e) {
        console.log(e);
    }
}, 2 * 60 * 1000);

setInterval(function () {
    try {
        var increment = 1;
        synthsMap.forEach(function (value, key) {
            increment += 1;
            setTimeout(function () {
                getSynthInfo(value.name)
            }, 1000 * 30 * increment);
        });
    } catch (e) {
        console.log(e);
    }
}, 30 * 60 * 1000);


setTimeout(function () {
    try {
        getSnxToolStaking();
    } catch (e) {
        console.log(e);
    }
}, 20 * 1000);
setInterval(function () {
    try {
        getSnxToolStaking();
    } catch (e) {
        console.log(e);
    }
}, 60 * 10 * 1000);

setTimeout(function () {
    try {
        getSnxToolHome();
    } catch (e) {
        console.log(e);
    }
}, 30 * 1000);
setInterval(function () {
    try {
        getSnxToolHome();
    } catch (e) {
        console.log(e);
    }
}, 60 * 7 * 1000);

setTimeout(function () {
    try {
        getDashboard();
    } catch (e) {
        console.log(e);
    }
}, 20 * 1000);
setTimeout(function () {
    try {
        getDashboard();
    } catch (e) {
        console.log(e);
    }
}, 100 * 1000);
setInterval(function () {
    try {
        getDashboard();
    } catch (e) {
        console.log(e);
    }
}, 60 * 13 * 1000);

setTimeout(function () {
    try {
        getExchange();
    } catch (e) {
        console.log(e);
    }
}, 40 * 1000);

setTimeout(function () {
    try {
        getExchange();
    } catch (e) {
        console.log(e);
    }
}, 60 * 1000 * 3);
setInterval(function () {
    try {
        getExchange();
    } catch (e) {
        console.log(e);
    }
}, 60 * 10 * 1000);

setInterval(function () {
    try {
        handleGasSubscription();
    } catch (e) {
        console.log(e);
    }
}, 60 * 1000);


client.login(process.env.BOT_TOKEN);


const ethers = require('ethers');
let contractRaw = fs.readFileSync('contracts/Synthetix.json');
let contract = JSON.parse(contractRaw);


const provider = ethers.getDefaultProvider("homestead");
const synthetix = new ethers.Contract('0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
    contract, provider);

async function getMintrData(msg, address, isDM) {
    try {
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Wallet info');

        const transferable = await synthetix.transferableSynthetix(address);
        let numberSNXTransferable = transferable.toString() / 1000000000000000000;
        console.log(numberSNXTransferable);

        const debt = await synthetix.debtBalanceOf(address, '0x7355534400000000000000000000000000000000000000000000000000000000');
        let numberDebt = debt.toString() / 1000000000000000000;
        console.log(numberDebt);

        const cRatio = await synthetix.collateralisationRatio(address);
        let numberCRatio = 100000000000000000000 / cRatio.toString();
        console.log(numberCRatio);

        const balance = await synthetix.balanceOf(address);
        let notEscrowedSnx = balance.toString() / 1000000000000000000;
        console.log(notEscrowedSnx);

        const maxIssuableSynths = await synthetix.maxIssuableSynths(address);
        let maxIssuableSynthsNum = maxIssuableSynths.toString() / 1000000000000000000;
        console.log(maxIssuableSynthsNum);

        let mintableSusd = maxIssuableSynthsNum - numberDebt;

        const totalSNX = await synthetix.collateral(address);
        let totalSNXNum = totalSNX.toString() / 1000000000000000000;
        console.log(totalSNXNum);

        let escrowedSNX = totalSNXNum - notEscrowedSnx;


        numberCRatio = Math.round(((numberCRatio * 1.0) + Number.EPSILON) * 100) / 100;
        totalSNXNum = Math.round(((totalSNXNum * 1.0) + Number.EPSILON) * 100) / 100;
        notEscrowedSnx = Math.round(((notEscrowedSnx * 1.0) + Number.EPSILON) * 100) / 100;
        escrowedSNX = Math.round(((escrowedSNX * 1.0) + Number.EPSILON) * 100) / 100;
        mintableSusd = Math.round(((mintableSusd * 1.0) + Number.EPSILON) * 100) / 100;
        numberSNXTransferable = Math.round(((numberSNXTransferable * 1.0) + Number.EPSILON) * 100) / 100;
        numberDebt = Math.round(((numberDebt * 1.0) + Number.EPSILON) * 100) / 100;

        var reply = "cRatio: **" + numberCRatio + "%**" + "\n";
        reply += "totalSNX: **" + totalSNXNum + "**\n";
        reply += "ownedSNX: **" + notEscrowedSnx + "**\n";
        reply += "escrowedSNX: **" + escrowedSNX + "**\n";
        reply += "transferableSNX: **" + numberSNXTransferable + "**\n";
        reply += "debt: **" + numberDebt + "**\n";
        reply += "mintableSusd: **" + mintableSusd + "**\n";

        exampleEmbed.addField(address, reply);
        msg.reply(exampleEmbed);
    } catch (e) {
        msg.reply("error occurred");
    }
}


const snxData = require('synthetix-data');

setTimeout(function () {
    snxData.synths.issuers({max: 10000}).then(result => {
        getAllWallets(result);
    });
}, 1000 * 10
)


setTimeout(function () {
    setInterval(function () {
        wallets = [];
        snxData.synths.issuers({max: 10000}).then(result => {
            getAllWallets(result);
        });
    }, 1000 * 60 * 10
    )
}, 1000 * 60 * 60
)


var ignoreAddresses = new Set();

async function getAllWallets(results) {
    try {
        for (let i = 0; i < results.length; i++) {
            try {
                if (!ignoreAddresses.has(results[i])) {
                    getWalletInfo(results[i]);
                }
                await delay(500);
            } catch (e) {
                //console.log(e);
            }
        }
    } catch (e) {
        //console.log(e);
    }
}


class WalletInfo {

    constructor(cRatio, snxCount, address, escrowedSnxCount) {
        this.cRatio = cRatio;
        this.snxCount = snxCount;
        this.address = address;
        this.escrowedSnxCount = escrowedSnxCount;
    }

    cRatio;
    snxCount;
    escrowedSnxCount;
    address;
    flaggedTime;
    etaToLiquidation;
}

var wallets = [];
var mapToReturn = new Map();
var walletsToReturn = [];


async function getWalletInfo(address) {
    try {

        const cRatio = await synthetix.collateralisationRatio(address);
        let numberCRatio = 100000000000000000000 / cRatio.toString();
        if (numberCRatio == Infinity) {
            ignoreAddresses.add(address);
            return;
        }
        numberCRatio = Math.round(((numberCRatio * 1.0) + Number.EPSILON) * 100) / 100;
        if (numberCRatio > 400) {
            ignoreAddresses.add(address);
            return;
        }

        const totalSNX = await synthetix.collateral(address);
        let totalSNXNum = totalSNX.toString() / 1000000000000000000;
        totalSNXNum = Math.round(((totalSNXNum * 1.0) + Number.EPSILON) * 100) / 100;
        if (totalSNXNum < 1000 && numberCRatio > 350) {
            ignoreAddresses.add(address);
            return;
        }

        const balance = await synthetix.balanceOf(address);
        let notEscrowedSnx = balance.toString() / 1000000000000000000;

        let escrowedSNX = totalSNXNum - notEscrowedSnx;
        escrowedSNX = Math.round(((escrowedSNX * 1.0) + Number.EPSILON) * 100) / 100;

        wallets.push(new WalletInfo(numberCRatio, totalSNXNum, address, escrowedSNX));
    } catch (e) {
        //console.log(e);
    }
}


function sortWallets() {
    try {
        console.log("wallets count is: " + wallets.length);
        wallets.sort(function (a, b) {
            return a.cRatio - b.cRatio;
        });
        wallets.forEach(w => {
            mapToReturn.set(w.address, w);
        });
        if (wallets.length > 20) {
            wallets = wallets.slice(0, 20);
        }
    } catch (e) {
        console.log(e);
    }
}

setInterval(function () {
    sortWallets();
}, 1000 * 55
)

setInterval(function () {
    sortWalletsToReturn();
}, 1000 * 60
)

function sortWalletsToReturn() {
    try {
        walletsToReturn = [];
        for (const [key, value] of mapToReturn.entries()) {
            walletsToReturn.push(value);
        }
        walletsToReturn.sort(function (a, b) {
            return a.cRatio - b.cRatio;
        });
        if (walletsToReturn.length > 20) {
            walletsToReturn = walletsToReturn.slice(0, 20);
        }
    } catch (e) {
        console.log(e);
    }
}

const clientPayday = new Discord.Client();
clientPayday.login(process.env.BOT_TOKEN_PAYDAY);

setInterval(function () {

    clientPayday.guilds.cache.forEach(function (value, key) {
        try {

            var today = new Date();
            while (today > payday) {
                payday.setDate(payday.getDate() + 7);
            }
            var difference = payday.getTime() - today.getTime();
            var seconds = Math.floor(difference / 1000);
            var minutes = Math.floor(seconds / 60);
            var hours = Math.floor(minutes / 60);
            var days = Math.floor(hours / 24);
            hours %= 24;
            minutes %= 60;
            seconds %= 60;

            value.members.cache.get("769312697610928158").setNickname(days + "D:" + hours + "H:" + minutes + "M");
            value.members.cache.get("769312697610928158").user.setActivity("🌜⌛💲💲💲⌛🌛", {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });

}, 30 * 1000);


var flaggedAccountsMap = new Map();

setInterval(function () {
    try {
        http.get('http://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=1&toBlock=latest&topic0=0xc77e4625de0c70adaf3bd1aabb5f22f9eae8f565367c706fc209030c13857996', (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try {
                    let result = JSON.parse(data);
                    var results = result.result;
                    var flaggedWallet = new Object();
                    var tempFlaggedAccountsMap = new Map();
                    results.forEach(fl => {
                        var address = fl.topics[1];
                        address = address.substring(26, address.length);
                        var flaggedTime = fl.timeStamp;
                        flaggedTime = parseInt(flaggedTime, 16);
                        var w = new WalletInfo();
                        w.flaggedTime = new Date(flaggedTime * 1000);
                        tempFlaggedAccountsMap.set(address, w);
                    });
                    for (const [key, value] of tempFlaggedAccountsMap.entries()) {
                        if (!flaggedAccountsMap.get(key)) {
                            flaggedAccountsMap.set(key, value);
                        }
                    }
                    for (const [key, value] of flaggedAccountsMap.entries()) {
                        if (!tempFlaggedAccountsMap.get(key)) {
                            flaggedAccountsMap.delete(key);
                        }
                    }

                } catch (e) {
                    console.log(e);
                }
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch (e) {
        console.log(e);
    }
}, 50 * 1000);

// setInterval(function () {
//     try {
//         http.get('http://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=1&toBlock=latest&topic0=0xaadb11d74982254be0fa96d24a08db29d68f446bc96b3092a9c9120b5c89caf2', (resp) => {
//             let data = '';
//
//             // A chunk of data has been recieved.
//             resp.on('data', (chunk) => {
//                 data += chunk;
//             });
//
//             // The whole response has been received. Print out the result.
//             resp.on('end', () => {
//                 try {
//                     let result = JSON.parse(data);
//                     var results = result.result;
//                     var sum = 0
//                     results.forEach(fl => {
//                         var dat = fl.data;
//                         dat = dat.substring(2, 66);
//                         var dec= parseInt(dat, 16)/1000000000000000000;
//                         sum=sum+dec;
//                     });
//                     console.log("Total liquidated SNX:" + sum);
//
//                 } catch (e) {
//                     console.log(e);
//                 }
//             });
//
//         }).on("error", (err) => {
//             console.log("Error: " + err.message);
//         });
//     } catch (e) {
//         console.log(e);
//     }
// }, 10 * 1000);


setInterval(function () {
    try {
        for (const [key, value] of flaggedAccountsMap.entries()) {
            getFlaggedWalletInfo(key);
        }
    } catch (e) {
        console.log(e);
    }
}, 65 * 1000);


async function getFlaggedWalletInfo(address) {
    try {

        const cRatio = await synthetix.collateralisationRatio(address);
        let numberCRatio = 100000000000000000000 / cRatio.toString();
        if (numberCRatio == Infinity) {
            ignoreAddresses.add(address);
            return;
        }
        numberCRatio = Math.round(((numberCRatio * 1.0) + Number.EPSILON) * 100) / 100;
        if (numberCRatio > 300) {
            ignoreAddresses.add(address);
            return;
        }

        const totalSNX = await synthetix.collateral(address);
        let totalSNXNum = totalSNX.toString() / 1000000000000000000;
        totalSNXNum = Math.round(((totalSNXNum * 1.0) + Number.EPSILON) * 100) / 100;
        if (totalSNXNum < 1000 && numberCRatio > 250) {
            ignoreAddresses.add(address);
            return;
        }

        const balance = await synthetix.balanceOf(address);
        let notEscrowedSnx = balance.toString() / 1000000000000000000;

        let escrowedSNX = totalSNXNum - notEscrowedSnx;
        escrowedSNX = Math.round(((escrowedSNX * 1.0) + Number.EPSILON) * 100) / 100;

        var w = new WalletInfo(numberCRatio, totalSNXNum, address, escrowedSNX);
        w.flaggedTime = flaggedAccountsMap.get(address).flaggedTime;
        var liquidationDate = new Date(w.flaggedTime);
        liquidationDate.setDate(liquidationDate.getDate() + 3);
        var difference = liquidationDate.getTime() - (new Date()).getTime();
        if (difference > 0) {
            var seconds = Math.floor(difference / 1000);
            var minutes = Math.floor(seconds / 60);
            var hours = Math.floor(minutes / 60);
            var days = Math.floor(hours / 24);
            hours %= 24;
            minutes %= 60;
            seconds %= 60;
            w.etaToLiquidation = days + " days " + hours + " hours " + minutes + " minutes ";
        } else {
            w.etaToLiquidation = "0";
        }
        flaggedAccountsMap.set(address, w);
    } catch (e) {
        //console.log(e);
    }
}


setInterval(function () {
    try {
        https.get('https://api.etherscan.io/api?module=account&action=balance&address=0xac63b3a69604925dadf2abd13877d7a4a7113308&tag=latest', (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try {
                    let result = JSON.parse(data);

                    let ethBalance = result.result / 1e18;

                    if (ethBalance < 0.5) {
                        client.channels.fetch('705191770903806022').then(c => {
                            c.send("https://etherscan.io/address/0xac63b3a69604925dadf2abd13877d7a4a7113308 has less than 0.5 ETH")
                        });
                    }
                } catch (e) {
                    console.log(e);
                }
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch (e) {
        console.log(e);
    }
}, 60 * 1000 * 60);


let council = [];
let voteDay = new Date('2021-03-15 07:00');

async function getCouncil() {
    try {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const page = await browser.newPage();
        await page.setViewport({width: 1000, height: 926});
        await page.goto("https://council.synthetix.io/#/spartancouncil.eth/proposal/QmT8e5oWmyyM61gnjv5dRx5L5dcX7SZ24Ako62dPS7oHhE", {waitUntil: 'networkidle2'});

        await delay(10000);

        /** @type {string[]} */
        var prices = await page.evaluate(() => {
            var div = document.querySelectorAll('div.p-4 .mb-1');

            var prices = []
            div.forEach(element => {
                prices.push(element.textContent);
            });

            return prices
        })

        council = [];
        council = council.concat(prices.slice(6, 14));
        browser.close()
    } catch (e) {
        console.log("Error happened on getting data from SNX tools.");
        console.log(e);
    }
}

setTimeout(getCouncil, 1000 * 30);
setInterval(getCouncil, 1000 * 60 * 2);

setInterval(function () {
    try {
        snxData.exchanges.since({minTimestamp: Math.round(new Date().getTime() / 1000) - 300}).then(result => {
            console.log("Fetching exchanges in last 5 min");
            result.forEach(r => {
                try {
                    console.log("Exchanged " + r.fromAmount + " " + r.fromCurrencyKey + " to " + r.toAmount + " " + r.toCurrencyKey);
                    console.log("Exchanged amount in sUSD was:" + r.toAmountInUSD);
                    if (r.toAmountInUSD >= 1000000) {
                        const exampleEmbed = new Discord.MessageEmbed();
                        exampleEmbed.setColor("ff0000");
                        exampleEmbed.setTitle("New trade");
                        exampleEmbed.setURL("https://etherscan.io/tx/" + r.hash);
                        exampleEmbed.addField("Wallet",
                            '[' + r.fromAddress + '](https://etherscan.io/address/' + r.fromAddress + ')');
                        exampleEmbed.addField("From",
                            numberWithCommas(r.fromAmount.toFixed(2)) + " " + r.fromCurrencyKey);
                        exampleEmbed.addField("To",
                            numberWithCommas(r.toAmount.toFixed(2)) + " " + r.toCurrencyKey);
                        exampleEmbed.addField("Value",
                            numberWithCommas(r.fromAmountInUSD.toFixed(2)) + " sUSD");
                        trades1000.send(exampleEmbed);
                    } else if (r.toAmountInUSD >= 100000) {
                        const exampleEmbed = new Discord.MessageEmbed();
                        exampleEmbed.setColor("ff0000");
                        exampleEmbed.setTitle("New trade");
                        exampleEmbed.setURL("https://etherscan.io/tx/" + r.hash);
                        exampleEmbed.addField("Wallet",
                            '[' + r.fromAddress + '](https://etherscan.io/address/' + r.fromAddress + ')');
                        exampleEmbed.addField("From",
                            numberWithCommas(r.fromAmount.toFixed(2)) + " " + r.fromCurrencyKey);
                        exampleEmbed.addField("To",
                            numberWithCommas(r.toAmount.toFixed(2)) + " " + r.toCurrencyKey);
                        exampleEmbed.addField("Value",
                            numberWithCommas(r.fromAmountInUSD.toFixed(2)) + " sUSD");
                        trades100.send(exampleEmbed);
                    }
                } catch (e) {
                    console.log(e);
                }
            })
        });
    } catch (e) {
        console.log(e);
    }
}, 1000 * 60 * 5);


setInterval(function () {
    try {
        snxData.exchanges.since({minTimestamp: Math.round(new Date().getTime() / 1000) - 120}).then(result => {
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
                            '[' + r.fromAddress + '](https://etherscan.io/address/' + r.fromAddress + ')');
                        exampleEmbed.addField("From",
                            r.fromAmount.toFixed(3) + " " + r.fromCurrencyKey);
                        exampleEmbed.addField("To",
                            r.toAmount.toFixed(3) + " " + r.toCurrencyKey);
                        trades.send(exampleEmbed);
                    }
                } catch (e) {
                    console.log(e);
                }
            })
        });
    } catch (e) {
        console.log(e);
    }
}, 1000 * 60 * 2);


let volume = 100000;
let distinctTraders = new Set();

function getVolume() {
    volume = 0;
    distinctTraders = new Set();
    try {
        snxData.exchanges.since({minTimestamp: Math.round(new Date().getTime() / 1000) - 3600 * 24}).then(result => {
            console.log("Fetching exchanges in last day");
            result.forEach(r => {
                try {
                    volume += r.toAmountInUSD;
                    distinctTraders.add(r.fromAddress)
                } catch (e) {
                    console.log(e);
                }
            })
        });
    } catch (e) {
        console.log(e);
    }
}

setTimeout(getVolume, 1000 * 60 * 1);
setInterval(function () {
    getVolume();
}, 1000 * 60 * 30);

const clientKwenta = new Discord.Client();
clientKwenta.login(process.env.BOT_TOKEN_KWENTA);
setInterval(function () {

    clientKwenta.guilds.cache.forEach(function (value, key) {
        try {
            if (volume > 0) {
                value.members.cache.get("784489616781869067").setNickname("24h = $" + getNumberLabel(volume));
                value.members.cache.get("784489616781869067").user.setActivity("Traders=" + distinctTraders.size, {type: 'PLAYING'});
            }
        } catch (e) {
            console.log(e);
        }
    });

}, 60 * 1000)


let choices = new Map();
choices.set(1, "NaotoSake");
choices.set(2, "MrSolver");
choices.set(3, "MoneyManDoug");
choices.set(4, "BigPenny");
choices.set(5, "Spreek");
choices.set(6, "TerraBellus");
choices.set(7, "Bojan");
choices.set(8, "Danijel");
choices.set(9, "Farmwell");
choices.set(10, "Synthaman");
choices.set(11, "justwanttoknowathing");
choices.set(12, "Farmer Joe - The DeFi Oracle");
choices.set(13, "Kaleb");
choices.set(14, "Akin");
choices.set(15, "Samantha");
choices.set(16, "Michael | Framework");
choices.set(17, "Chevis");
choices.set(18, "Simone | Dialectic");
choices.set(19, "larpras");
choices.set(20, "Andy | synthetix");
choices.set(21, "Jackson | synthetix");
choices.set(22, "redmarglar");


setInterval(function () {
    console.log("Getting votes");
    try {
        https.get('https://hub.snapshot.page/api/spartancouncil.eth/proposal/QmT8e5oWmyyM61gnjv5dRx5L5dcX7SZ24Ako62dPS7oHhE', (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try {
                    let results = JSON.parse(data);
                    let print = false;
                    console.log("Votes " + results);
                    for (const result in results) {
                        let vote = results[result];
                        let voter = vote.address;
                        if (votesMapNew4.has(voter)) {
                            let choice = votesMapNew4.get(voter);
                            if (choice != vote.msg.payload.choice) {
                                console.log("Vote change");
                                const exampleEmbed = new Discord.MessageEmbed();
                                exampleEmbed.setColor("00770f");
                                exampleEmbed.setTitle("Vote Changed");
                                exampleEmbed.setURL("https://council.synthetix.io/#/spartancouncil.eth/proposal/QmT8e5oWmyyM61gnjv5dRx5L5dcX7SZ24Ako62dPS7oHhE");
                                exampleEmbed.addField("From",
                                    choices.get(choice));
                                exampleEmbed.addField("To",
                                    choices.get(vote.msg.payload.choice));
                                exampleEmbed.addField("Voter",
                                    "[" + voter + "](https://etherscan.io/address/" + voter + ")");
                                //councilChannel.send(exampleEmbed);
                            }
                        } else {
                            console.log("New Vote" + vote.msg.payload.choice);
                            console.log("New Voter" + voter);
                            const exampleEmbed = new Discord.MessageEmbed();
                            exampleEmbed.setColor("00770f");
                            exampleEmbed.setTitle("New Vote");
                            exampleEmbed.setURL("https://council.synthetix.io/#/spartancouncil.eth/proposal/QmT8e5oWmyyM61gnjv5dRx5L5dcX7SZ24Ako62dPS7oHhE");
                            exampleEmbed.addField("For",
                                choices.get(vote.msg.payload.choice));
                            exampleEmbed.addField("Voter",
                                "[" + voter + "](https://etherscan.io/address/" + voter + ")");
                            //councilChannel.send(exampleEmbed);
                        }
                        votesMapNew4.set(voter, vote.msg.payload.choice);

                        if (process.env.REDIS_URL) {
                            redisClient.set("votesMapNew4", JSON.stringify([...votesMapNew4]), function () {
                            });
                        }
                    }
                } catch (e) {
                    console.log(e);
                }

            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch (e) {
        console.log(e);
    }

}, 60 * 1000 * 3);

const {request, gql} = require('graphql-request');
const queryPerformanceHistory = gql`
    {
        performanceHistory(address: "0x0f0f7f24ce3a52b9508b9fbce1a6bdb2ebb0d7ed", period:"week") {
            day
            week
        }
    }
`

let performance = null;
setInterval(function () {
    request('https://api.dhedge.org/graphql', queryPerformanceHistory).then((data) => {
            console.log(data);
            performance = data.performanceHistory;
        }
    );
}, 1000 * 60)

const fundInfo = gql`
    {
        fund(address: "0x0f0f7f24ce3a52b9508b9fbce1a6bdb2ebb0d7ed") {
            fundComposition{
                tokenName
                amount
                rate
            }
            totalValue
        }
    }
`


let fund = null;
setInterval(function () {
    request('https://api.dhedge.org/graphql', fundInfo).then((data) => {
            fund = data.fund;
        }
    );
}, 1000 * 300)


function printFund() {
    const exampleEmbed = new Discord.MessageEmbed();
    exampleEmbed.setColor("00770f");
    exampleEmbed.setTitle("Synthetix Community Pool Daily digest");
    exampleEmbed.setURL("https://app.dhedge.org/pool/0x0f0f7f24ce3a52b9508b9fbce1a6bdb2ebb0d7ed");
    let dayperf = (performance.day / 1e18 - 1) * 100;
    let weekerf = (performance.week / 1e18 - 1) * 100;
    exampleEmbed.addField("Performance",
        "Day: " + (dayperf).toFixed(2) + "%\n Week: " + (weekerf).toFixed(2) + "%");
    let composition = "";
    fund.fundComposition.forEach(c => {
        if ((c.amount * 1.0) > 0) {
            composition += "Token: " + c.tokenName;
            composition += " Amount: " + (c.amount / 1e18).toFixed(2);
            composition += " Value: $" + (c.amount / 1e18 * c.rate / 1e18).toFixed(2);
            composition += "\n";
        }
    })
    exampleEmbed.addField("Composition",
        composition);
    exampleEmbed.addField("Total value",
        "$" + getNumberLabel(fund.totalValue / 1e18));
    fundChannel.send(exampleEmbed);
}


var schedule = require('node-schedule');

schedule.scheduleJob('0 1 * * *', function () {
    printFund();
});


var express = require("express");
var app = express();
var cors = require('cors');
app.use(cors());
const bodyParser = require("body-parser");
app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port " + (process.env.PORT || 3000));
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


var allMembers = [];
setTimeout(function () {
    guild.members.fetch().then(fetchedMembers => {
        allMembers = fetchedMembers;
    });
}, 6 * 1000);

setInterval(function () {
    guild.members.fetch().then(fetchedMembers => {
        allMembers = fetchedMembers;
    });
}, 60 * 1000);

app.post("/pdao", async (req, res) => {
        try {
            let content = req.body;
            console.log(content);
            if (
                content.status.toLowerCase().includes("confirmed")
            ) {
                if (content.from.toLowerCase().includes("0xeb9a82736cc030fc4a4cd4b53e9b2c67e153208d".toLowerCase())
                    ||
                    content.to.toLowerCase().includes("0xeb9a82736cc030fc4a4cd4b53e9b2c67e153208d".toLowerCase())) {
                    channelGdao.send("New transaction from gDAO: https://etherscan.io/tx/" + content.hash);
                }
                if (content.from.toLowerCase().includes("0xeb3107117fead7de89cd14d463d340a2e6917769".toLowerCase()) ||
                    content.to.toLowerCase().includes("0xeb3107117fead7de89cd14d463d340a2e6917769".toLowerCase())) {
                    channelPdao.send("New transaction from pDAO: https://etherscan.io/tx/" + content.hash);
                }
                if (content.from.toLowerCase().includes("0x49BE88F0fcC3A8393a59d3688480d7D253C37D2A".toLowerCase()) ||
                    content.to.toLowerCase().includes("0x49BE88F0fcC3A8393a59d3688480d7D253C37D2A".toLowerCase())) {
                    channelSdao.send("New transaction from sDAO: https://etherscan.io/tx/" + content.hash);
                }
                if (content.from.toLowerCase().includes("0xDe910777C787903F78C89e7a0bf7F4C435cBB1Fe".toLowerCase()) ||
                    content.to.toLowerCase().includes("0xDe910777C787903F78C89e7a0bf7F4C435cBB1Fe".toLowerCase())) {
                    channelDeployer.send("New transaction from Synthetix Deployer: https://etherscan.io/tx/" + content.hash);
                }
                if (content.from.toLowerCase().includes("0x46abFE1C972fCa43766d6aD70E1c1Df72F4Bb4d1".toLowerCase()) ||
                    content.to.toLowerCase().includes("0x46abFE1C972fCa43766d6aD70E1c1Df72F4Bb4d1".toLowerCase())) {
                    channelAmbassadors.send("New transaction from Synthetix Ambassadors: https://etherscan.io/tx/" + content.hash);
                }
                if (content.from.toLowerCase().includes("0x1f2c3a1046c32729862fcb038369696e3273a516".toLowerCase()) ||
                    content.to.toLowerCase().includes("0x1f2c3a1046c32729862fcb038369696e3273a516".toLowerCase())) {
                    const exampleEmbed = new Discord.MessageEmbed();
                    exampleEmbed.setColor("00770f");
                    exampleEmbed.setTitle("New loan tx");
                    exampleEmbed.setURL("https://etherscan.io/tx/" + content.hash);
                    exampleEmbed.addField("Type",
                        content.contractCall.methodName);
                    exampleEmbed.addField("From",
                        "[" + content.from + "]" + "(https://etherscan.io/address/" + content.from + ")");
                    if (content.contractCall.methodName.toLowerCase() == "open") {
                        let asset = "ETH";
                        if (content.contractCall.params.currency.includes("734254")) {
                            asset = "BTC";
                        }
                        exampleEmbed.addField("Short",
                            asset);
                        let amount = content.contractCall.params.amount * 1.0 / 1e18;
                        amount = amount.toFixed(2);
                        exampleEmbed.addField("Amount",
                            amount);
                    }
                    channelShorts.send(exampleEmbed);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
)

app.post("/verify", async (req, res) => {
        try {
            let address = req.body.value.address + "";
            let sig = req.body.value.sig;
            let msg = req.body.value.msg;
            let username = req.body.value.username;

            const sigUtil = require('eth-sig-util')

            const recovered = sigUtil.recoverPersonalSignature({
                data: msg,
                sig: sig
            });
            if (recovered.toLowerCase() === address.toLowerCase()) {
                var roleToAssign = null;
                guild.roles.cache.forEach(function (value, key) {
                    console.log(value.name);
                    if (value.name.toLowerCase().includes("chess")) {
                        roleToAssign = value;
                    }
                });

                var url = 'https://api.etherscan.io/api' +
                    '?module=account&action=tokenbalance&contractaddress=0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f&address=AddressToReplace&tag=latest&apikey=YourApiKeyToken';
                url = url.replace("AddressToReplace", address.toString());
                https.get(url, (resp) => {
                    let data = '';

                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });

                    // The whole response has been received. Print out the result.
                    resp.on('end', () => {
                        let result = JSON.parse(data);
                        let amount = result.result / 1e18;
                        if (amount > 9) {
                            allMembers.forEach(m => {
                                var usernameDiscriminator = m.user.username + '#' + m.user.discriminator;
                                if (usernameDiscriminator.toLowerCase() === username.toLowerCase()) {
                                    m.roles.add(roleToAssign);
                                }
                            })
                        }
                    });

                }).on("error", (err) => {
                    console.log("Error: " + err.message);
                });

            }

        } catch (e) {
            console.log(e);
        }
    }
)


var knownAddress = new Set();
knownAddress.add("0x461783A831E6dB52D68Ba2f3194F6fd1E0087E04");
knownAddress.add("0xBD015d82a36C9a05108ebC5FEE12672F24dA0Cf4");
knownAddress.add("0x9d256b839C1b46e57122eBb3C5e6da97288FaCf1");
knownAddress.add("0x9cFc4cfB2aa99bedc98d52E2DCc0Eb010F20718f");
knownAddress.add("0x0bc3668d2AaFa53eD5E5134bA13ec74ea195D000");
knownAddress.add("0x65DCD62932fEf5af25AdA91F0F24658e94e259c5");
knownAddress.add("0x0120666306F4D15bb125696f322BFD8EE83423a9");
knownAddress.add("0x935D2fD458fdf41B6F7B62471f593797866a3Ce6");
knownAddress.add("0x682C4184286415344a35a0Ff6699bb8EdAbDdc17");
knownAddress.add("0xbf49b454818783d12bf4f3375ff17c59015e66cb");
knownAddress.add("0x0120666306f4d15bb125696f322bfd8ee83423a9");

const dateformat = require('dateformat');
setInterval(function () {
    https.get('https://hub.snapshot.page/api/snxgov.eth/proposals', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', async () => {
            try {
                let results = JSON.parse(data);
                let print = false;
                if (synthetixProposals.size > 0) {
                    print = true;
                }
                var counterInc = 0;
                let keys = [];
                for (const result in results) {
                    keys.push(result);
                }
                keys = keys.reverse();
                for (const res in keys) {
                    let result = keys[res];
                    if (!synthetixProposals.has(result)) {
                        let proposal = results[result];
                        synthetixProposals.set(result, proposal);
                        let start = new Date(proposal.msg.payload.start * 1000);
                        let end = new Date(proposal.msg.payload.end * 1000);
                        let content = proposal.msg.payload.body;
                        let name = proposal.msg.payload.name;

                        if (content.length > 1024) {
                            content = content.substring(0, 1020) + "...";
                        }

                        const exampleEmbed = new Discord.MessageEmbed();
                        exampleEmbed.setColor("00770f");
                        exampleEmbed.setTitle("New proposal");
                        exampleEmbed.setURL("https://staking.synthetix.io/gov/snxgov.eth/" + result);
                        exampleEmbed.addField("Name",
                            name);
                        exampleEmbed.addField("Start",
                            dateformat(new Date(start), 'dd.mm.yyyy.HH:MM'));
                        exampleEmbed.addField("End",
                            dateformat(new Date(end), 'dd.mm.yyyy.HH:MM'));
                        exampleEmbed.addField("Description",
                            content);
                        if (print) {

                            counterInc += 5;
                            setTimeout(
                                function () {
                                    https.get('https://hub.snapshot.page/api/synthetixproposal/proposal/' + result, (resp) => {
                                        let data = '';

                                        // A chunk of data has been recieved.
                                        resp.on('data', (chunk) => {
                                            data += chunk;
                                        });

                                        // The whole response has been received. Print out the result.
                                        resp.on('end', () => {
                                            try {
                                                let resultsV = JSON.parse(data);
                                                let print = false;
                                                let yes = 0;
                                                let no = 0;
                                                for (const resultV in resultsV) {
                                                    let vote = resultsV[resultV];
                                                    let voter = vote.address;
                                                    if (knownAddress.has(voter)) {
                                                        let voteRes = vote.msg.payload.choice;
                                                        if (voteRes == '2') {
                                                            no++;
                                                        } else {
                                                            yes++;
                                                        }
                                                    }
                                                }
                                                exampleEmbed.addField("Votes",
                                                    "sYES: " + yes + " iNO: " + no);

                                                channelGov.send(exampleEmbed);
                                            } catch
                                                (e) {
                                                console.log(e);
                                            }

                                        });


                                    })
                                }, counterInc * 1000)


                        }

                        if (process.env.REDIS_URL) {
                            redisClient.set("synthetixProposals", JSON.stringify([...synthetixProposals]), function () {
                            });
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 1000 * 60 * 5);

const clientIllGov = new Discord.Client();
clientIllGov.login(process.env.BOT_TOKEN_ILLUVIUM_GOVERNANCE);

var channelIllProposals = null;
clientIllGov.on("ready", () => {
    console.log(`Logged in as ${clientIllGov.user.tag}!`);
    clientIllGov.channels.fetch('809220730608680990').then(c => {
        channelIllProposals = c;
    });
})

setInterval(function () {
    https.get('https://hub.snapshot.page/api/ilvgov.eth/proposals', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', async () => {
            try {
                let results = JSON.parse(data);
                let print = false;
                if (illuviumProposals.size > 0) {
                    print = true;
                }
                var counterInc = 0;
                let keys = [];
                for (const result in results) {
                    keys.push(result);
                }
                keys = keys.reverse();
                for (const res in keys) {
                    let result = keys[res];
                    if (!illuviumProposals.has(result)) {
                        let proposal = results[result];
                        illuviumProposals.set(result, proposal);
                        let start = new Date(proposal.msg.payload.start * 1000);
                        let end = new Date(proposal.msg.payload.end * 1000);
                        let content = proposal.msg.payload.body;
                        let name = proposal.msg.payload.name;

                        if (content.length > 1024) {
                            content = content.substring(0, 1020) + "...";
                        }

                        const exampleEmbed = new Discord.MessageEmbed();
                        exampleEmbed.setColor("00770f");
                        exampleEmbed.setTitle("New proposal");
                        exampleEmbed.setURL("https://gov.illuvium.io/#/ilvgov.eth/proposal/" + result);
                        exampleEmbed.addField("Name",
                            name);
                        exampleEmbed.addField("Start",
                            dateformat(new Date(start), 'dd.mm.yyyy.HH:MM'));
                        exampleEmbed.addField("End",
                            dateformat(new Date(end), 'dd.mm.yyyy.HH:MM'));
                        exampleEmbed.addField("Description",
                            content);
                        if (print) {
                            channelIllProposals.send(exampleEmbed);
                        }

                        if (process.env.REDIS_URL) {
                            redisClient.set("illuviumProposals", JSON.stringify([...illuviumProposals]), function () {
                            });
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 1000 * 60 * 5);


function getDebtHedgeMessage(debtValue, df, othersDebtSum) {
    if (debtValue != 'debt') {
        var hedgeMessage = new Discord.MessageEmbed()
            .setTitle("Hedge command")
            .setDescription("In order to hedge a sUSD " + debtValue + " worth of debt, the mirror strategy is to invest the synths in the following manner (in sUSD terms):")
            .setColor("#0060ff")
        let counter = 1;
        for (const dfElement of df.toArray()) {
            var percentMain = (debtValue / 100) * dfElement[5];
            var unitsMain = (percentMain / dfElement[4]);
            if (unitsMain > 1) {
                unitsMain = Math.round((unitsMain + Number.EPSILON) * 100) / 100;
            } else {
                unitsMain = unitsMain.toFixed(5);
            }
            hedgeMessage.addField(counter + ') ' + dfElement[3].replace("s", "") + ' ' + dfElement[5] + '%', '  $' + percentMain.toFixed(2) + ' worth | ' + unitsMain + ' units')
            counter++;
        }
        var percent = (debtValue / 100) * Math.round(parseFloat(othersDebtSum) * 100);
        hedgeMessage.addField(counter + ') others ' + Math.round(parseFloat(othersDebtSum) * 100) + '%', '$' + percent.toFixed(2) + ' worth');
        return hedgeMessage;
    } else {
        var debtMessage = new Discord.MessageEmbed()
            .setTitle("Debt command")
            .setDescription("Debt pool:")
            .setColor("#0060ff")
        let counter = 1;
        for (const dfElement of df.toArray()) {
            debtMessage.addField(counter + ') ' + dfElement[3].replace("s", "") + ' ' + dfElement[5] + '%', "\u200b")
            counter++;
        }
        debtMessage.addField(counter + ') others ' + Math.round(parseFloat(othersDebtSum) * 100) + '%', "\u200b");
        return debtMessage;
    }
}

const calculateDebt = async () => {
    var network = 'mainnet';
    const EtherWrapper = synthetixAPI.getTarget({network, contract: 'EtherWrapper'});
    const provider = ethers.getDefaultProvider();
    const {abi} = synthetixAPI.getSource({
        network,
        contract: "SynthUtil"
    });
    const {address} = synthetixAPI.getTarget({
        network,
        contract: "SynthUtil"
    });

    const SynthUtil = new ethers.Contract(address, abi, provider);
    Promise.all([getAPI('https://api.etherscan.io/api?module=contract&action=getabi&address=' +
        EtherWrapper.address + '&apikey=YKYE3MBJ1YXMAUQRNK7HZ7YQPKGIT1X6PJ'),
        getMultiCollateralIssuance('sETH'), getMultiCollateralIssuance('sBTC'), getMultiCollateralIssuance('sUSD'), getSynthMarketCap(SynthUtil)])
        .then(function (results) {
            const multicolateralResultsETH = (parseFloat(results[1].long.toString()) + parseFloat(results[1].short.toString())) / 1e24
            const multicolateralResultsBTC = (parseFloat(results[2].long.toString()) + parseFloat(results[2].short.toString())) / 1e24
            const multicolateralResultsUSD = (parseFloat(results[3].long.toString()) + parseFloat(results[3].short.toString())) / 1e24
            var newDf = adjustDataFrame(results[4]);
            var contractABI = "";
            contractABI = JSON.parse(results[0].data.result);
            var etherWrapper = new web3.eth.Contract(contractABI, EtherWrapper.address);
            Promise.all([getWrapprETH(etherWrapper), getWrapprUSD(etherWrapper)])
                .then(function (results) {
                    var wrapprETH = results[0] / 1e24
                    console.log("Wrapper ETH is " + wrapprETH)
                    var wrapprUSD = results[1] / 1e24
                    console.log("Wrapper USD is " + wrapprUSD)
                    newDf = newDf.map(row => row.set('supply', row.get('synth') == 'sETH' ? row.get('supply') - multicolateralResultsETH - wrapprETH : row.get('supply')));
                    newDf = newDf.map(row => row.set('supply', row.get('synth') == 'sBTC' ? row.get('supply') - multicolateralResultsBTC : row.get('supply')));
                    newDf = newDf.map(row => row.set('supply', row.get('synth') == 'sUSD' ? row.get('supply') - multicolateralResultsUSD - wrapprUSD : row.get('supply')));
                    newDf = newDf.map(row => row.set('cap', row.get('price') * row.get('supply')));
                    var marketCapAbs = [];
                    for (const caps of newDf.select('cap').toArray()) {
                        if (caps && !isNaN(caps))
                            marketCapAbs.push(Math.abs(caps))
                    }
                    var marketCapSum = sum(marketCapAbs);
                    newDf = newDf.map(row => row.set('debt_pool_percentage', Math.abs(row.get('cap') / marketCapSum)));
                    var debtPercentages = [];
                    for (const debt of newDf.select('debt_pool_percentage').toArray()) {
                        if (debt && !isNaN(debt) && debt[0] < 0.05)
                            debtPercentages.push(debt[0])
                    }
                    othersDebtSum = sum(debtPercentages);
                    newDf = newDf.filter(row => row.get('debt_pool_percentage') > 0.05);
                    newDf = newDf.map(row => row.set('synth', row.get('synth') == 'sETH' && (row.get('cap') < 0) ? 'Short sETH' : row.get('synth')));
                    newDf = newDf.rename('supply', 'units');
                    newDf = newDf.map(row => row.set('cap', parseFloat(row.get('cap'))));
                    newDf = newDf.sortBy(['debt_pool_percentage'], true)
                    df = newDf.map(row => row.set('debt_pool_percentage', (Math.round(parseFloat(row.get('debt_pool_percentage')) * 100))));
                });
        });
}


const getAPI = function (url) {
    return axios.get(url);
}

const sum = function (array) {
    var total = 0;
    for (var i in array) {
        total += array[i];
    }
    return total;
}


const getWrapprETH = function (contractInstance) {
    return contractInstance.methods.sETHIssued().call();
}

const getWrapprUSD = function (contractInstance) {
    return contractInstance.methods.sUSDIssued().call();
}

const getMultiCollateralIssuance = function (currency) {

    var network = 'mainnet';
    var provider = ethers.getDefaultProvider();
    var {abi} = synthetixAPI.getSource({
        network,
        contract: "CollateralManagerState"
    });
    var {address} = synthetixAPI.getTarget({
        network,
        contract: "CollateralManagerState"
    });

    var CollateralManagerState = new ethers.Contract(address, abi, provider);

    return CollateralManagerState.totalIssuedSynths(
        synthetixAPI.toBytes32(currency));
}


const adjustDataFrame = function (dataFrame) {

    let initDF = new DataFrame.DataFrame(dataFrame).transpose();
    let adjustedDF = new DataFrame.DataFrame(initDF.toArray(), ["synthHex", "supply", "cap"])
    const replacer = new RegExp('\x00', 'g')
    adjustedDF = adjustedDF.map(row => row.set('synth', convertHexToStr(row.get('synthHex')).replace(replacer, "")));
    adjustedDF = adjustedDF.filter(row => row.get('supply') > 0);
    adjustedDF = adjustedDF.map(row => row.set('price', row.get('cap') / row.get('supply')));
    adjustedDF = adjustedDF.map(row => row.set('cap', row.get('cap') / 1e24));
    adjustedDF = adjustedDF.map(row => row.set('supply', row.get('supply') / 1e24));

    return adjustedDF;

}


const getSynthMarketCap = function (contractInstance) {
    return contractInstance.synthsTotalSupplies();
}

const convertHexToStr = function (str1) {
    var hex = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
};


function getBugDTO(message) {
    return {
        content: message.content,
        reporter: message.author.username,
        time: formatDate(new Date()),
        timestamp: message.createdTimestamp,
        id: uuidv4(),
        messageLink: message.url
    }
}


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [day, month, year].join('-');
}


app.get('/bugs', (req, res) => {
    redisClient.llen(bugRedisKey, function (err, listSize) {
        redisClient.lrange(bugRedisKey, 0, listSize, function (err, bugs) {
            var obj = [];
            bugs.forEach(function (bug) {
                obj.push(JSON.parse(bug));
            });
            res.send(obj);
        });
    });
});


app.post('/bug', (req, res) => {
    let bugRequest = req.body.bug;
    let bugJson = JSON.stringify(bugRequest);
    redisClient.lpush(bugRedisKey, bugJson);
    res.send(bugRequest.id);
});

app.delete('/bug/:bugid', (req, res) => {
    const bugId = req.params.bugid;
    redisClient.llen(bugRedisKey, function (err, listSize) {
        redisClient.lrange(bugRedisKey, 0, listSize, function (err, bugs) {
            bugs.forEach(function (bug) {
                var bugDTO = JSON.parse(bug);
                if (bugDTO.id == bugId) {
                    redisClient.lrem(bugRedisKey, 0, bug);
                }
            });
        });
        res.send('bug with id ' + bugId + ' is deleted');
    });
});

