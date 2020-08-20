require("dotenv").config()
const Discord = require("discord.js")
const client = new Discord.Client();

const clientFaqPrice = new Discord.Client();
clientFaqPrice.login(process.env.BOT_TOKEN_SNX);

const clientPegPrice = new Discord.Client();
clientPegPrice.login(process.env.BOT_TOKEN_PEG);

const clientTknPrice = new Discord.Client();
clientTknPrice.login(process.env.BOT_TOKEN_TKN);

const clientEthPrice = new Discord.Client();
clientEthPrice.login(process.env.BOT_TOKEN_ETH);

const clientgasPrice = new Discord.Client();
clientgasPrice.login(process.env.BOT_TOKEN_GAS);

const clientCRVPrice = new Discord.Client();
clientCRVPrice.login(process.env.BOT_TOKEN_CRV);

const clientSWTHPrice = new Discord.Client();
clientSWTHPrice.login(process.env.BOT_TOKEN_SWTH);

const replaceString = require('replace-string');
const https = require('https');
const redis = require("redis");
let redisClient = null;

var fs = require('fs');
var snxRewardsPerMinterUsd = 0.013;
var snxToMintUsd = 1.933;
var snxRewardsThisPeriod = "940,415 SNX";
var totalDebt = "$71,589,622";
var gasPrice = 40;
var ethPrice = 360;
var tknPrice = 0.77;
var swthPrice = 0.063;
var crvPrice = 3.84;
var snxPrice = 4;
var mintGas = 993602;
var claimGas = 1092941;
var periodVolume = "$33,026,800";

var currentFees = "$159,604";
var unclaimedFees = "$40,808";
var poolDistribution = ["sUSD (51.1%)", "sETH (16.6%)", "sBTC (14.9%)", "iETH (8.1%)", "Others (9.2%)"];

var usdtPeg = 1;
var usdcPeg = 1;

var coingeckoUsd;
var coingeckoEth;
var coingeckoBtc;
var binanceUsd;
var kucoinUsd;

var payday = new Date('2020-08-12 10:37');

const Synth = class {
    constructor(name, price, gain) {
        this.name = name;
        this.price = price;
        this.gain = gain;
    }

    name;
    price;
    gain;
};

var synths = new Array();

let gasSubscribersMap = new Map();
let gasSubscribersLastPushMap = new Map();

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
        console.log("gasSubscribersMapRaw:" + gasSubscribersLastPushMapRaw);
        if (gasSubscribersLastPushMapRaw) {
            gasSubscribersLastPushMap = new Map(JSON.parse(gasSubscribersLastPushMapRaw));
            console.log("gasSubscribersLastPushMap:" + gasSubscribersLastPushMap);
        }
    });


}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})
client.on("guildMemberAdd", function (member) {
    member.send("Hi and welcome to Synthetix! I am Synthetix FAQ bot. I will be very happy to assist you, just ask me for **help**.");
});

client.on("message", msg => {

        if (msg.author.username != "FAQ") {
            if (!(msg.channel.type == "dm")) {
                // this is logic for channels
                if (msg.content.toLowerCase().trim() == "!faq") {
                    msg.reply("Hi, I am Synthetix FAQ bot. I will be very happy to assist you, just ask me for **help** in DM.");
                } else if (msg.content.toLowerCase().trim() == "!faq help") {
                    msg.reply("I can only answer a predefined question by its number or by alias in a channel, e.g. **question 1**, or **gas price**. \n For more commands and options send me **help** in DM");
                } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("!faq question")) {
                    doQuestion(msg, "!faq question", false);
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
                } else if (msg.content.toLowerCase().trim().replace(/ +(?= )/g, '').startsWith("!faq ")) {
                    let found = checkAliasMatching(false);
                    if (!found) {
                        msg.reply("Oops, I don't know that one. You can get all aliases if you send me a DM **aliases** \n You can check out https://github.com/dgornjakovic/synthetix-faq-bot for list of known questions and aliases");
                    }
                }
            } else {
                try {

                    // this is the logic for DM
                    console.log("I got sent a DM:" + msg.content);

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
                                msg.reply(" I will send you a message once safe gas price is below " + command + " gwei , and every hour after that that it remains below that level. \nTo change the threshold level for gas price, send me a new subscribe message with the new amount.\n" +
                                    "To unsubscribe, send me another DM **unsubscribe**.");
                            } else {
                                msg.reply(command + " is not a proper integer number.");
                            }
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
                        msg.channel.send(exampleEmbed);
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
                msg.channel.send(exampleEmbed);
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

            try {
                let rawdata = fs.readFileSync('answers/' + command + '.json');
                let answer = JSON.parse(rawdata);

                const exampleEmbed = new Discord.MessageEmbed();
                exampleEmbed.setColor(answer.color);
                exampleEmbed.setTitle(answer.title);
                exampleEmbed.setDescription(answer.description);
                exampleEmbed.setURL(answer.url);

                if (command == "7") {

                    https.get('https://gasprice.poa.network/', (resp) => {
                        let data = '';

                        // A chunk of data has been recieved.
                        resp.on('data', (chunk) => {
                            data += chunk;
                        });

                        // The whole response has been received. Print out the result.
                        resp.on('end', () => {
                            let result = JSON.parse(data);
                            exampleEmbed.addField("Safe low gas price:", result.slow + ' gwei', false);
                            exampleEmbed.addField("Standard gas price:", result.standard + ' gwei', false);
                            exampleEmbed.addField("Fast gas price:", result.fast + ' gwei', false);
                            exampleEmbed.addField("Instant gas price:", result.instant + ' gwei', false);
                            if (doReply) {
                                msg.reply(exampleEmbed);
                            } else {
                                msg.channel.send(exampleEmbed);
                            }
                        });

                    }).on("error", (err) => {
                        console.log("Error: " + err.message);
                    });

                } else if (command == "9") {

                    exampleEmbed.addField("USD (binance)", binanceUsd, false);
                    exampleEmbed.addField("USD (kucoin)", kucoinUsd, false);
                    exampleEmbed.addField("USD (coingecko)", coingeckoUsd, false);
                    exampleEmbed.addField("ETH (coingecko):", coingeckoEth, false);
                    exampleEmbed.addField("BTC (coingecko):", coingeckoBtc, false);
                    if (doReply) {
                        msg.reply(exampleEmbed);
                    } else {
                        msg.channel.send(exampleEmbed);
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
                                msg.channel.send(exampleEmbed);
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
                                msg.channel.send(exampleEmbed);
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
                        msg.channel.send(exampleEmbed);
                    }

                } else if (command == "62") {

                    exampleEmbed.addField("Volume in this period:", periodVolume, false);
                    if (doReply) {
                        msg.reply(exampleEmbed);
                    } else {
                        msg.channel.send(exampleEmbed);
                    }

                } else if (command == "63") {

                    var distribution = "";
                    poolDistribution.forEach(function (d) {
                        distribution += d + "\n";
                    });

                    exampleEmbed.addField("Debt distribution:", distribution, false);
                    if (doReply) {
                        msg.reply(exampleEmbed);
                    } else {
                        msg.channel.send(exampleEmbed);
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
                        msg.channel.send(exampleEmbed);
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
                        msg.channel.send(exampleEmbed);
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
                        msg.channel.send(exampleEmbed);
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
                        msg.channel.send(exampleEmbed);
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
            let result = JSON.parse(data);
            ethPrice = result.market_data.current_price.usd;
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 60 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/tokencard', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let result = JSON.parse(data);
            tknPrice = result.market_data.current_price.usd;
            tknPrice = Math.round(((tknPrice * 1.0) + Number.EPSILON) * 100) / 100;

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 60 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/switcheo', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let result = JSON.parse(data);
            swthPrice = result.market_data.current_price.usd;
            swthPrice = Math.round(((swthPrice * 1.0) + Number.EPSILON) * 1000) / 1000;

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 60 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/curve-dao-token', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let result = JSON.parse(data);
            crvPrice = result.market_data.current_price.usd;
            crvPrice = Math.round(((crvPrice * 1.0) + Number.EPSILON) * 100) / 100;

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 60 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/havven', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let result = JSON.parse(data);
            snxPrice = result.market_data.current_price.usd;
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 60 * 1000);


setInterval(function () {
    https.get('https://gasprice.poa.network/', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let result = JSON.parse(data);
            gasPrice = result.standard;
            gasSubscribersMap.forEach(function (value, key) {
                try {
                    if (result.standard < value) {
                        if (gasSubscribersLastPushMap.has(key)) {
                            var curDate = new Date();
                            var lastNotification = gasSubscribersLastPushMap.get(key);
                            var hours = Math.abs(curDate - lastNotification) / 36e5;
                            if (hours > 1) {
                                client.users.cache.get(key).send('gas price is now below your threshold. Current safe gas price is: ' + result.standard);
                                gasSubscribersLastPushMap.set(key, new Date());
                                if (process.env.REDIS_URL) {
                                    redisClient.set("gasSubscribersMap", JSON.stringify([...gasSubscribersMap]), function () {
                                    });
                                    redisClient.set("gasSubscribersLastPushMap", JSON.stringify([...gasSubscribersLastPushMap]), function () {
                                    });
                                }
                            }
                        } else {
                            if (client.users.cache.get(key)) {
                                client.users.cache.get(key).send('gas price is now below your threshold. Current safe gas price is: ' + result.standard);
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
                    }
                } catch (e) {
                    console.log("Error occured when going through subscriptions for key: " + key + "and value " + value + " " + e);
                }
            });

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 60 * 1000);


const puppeteer = require('puppeteer');

async function getSnxToolStaking() {
    try {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
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

        console.log("I got the prices:" + prices);
        snxRewardsPerMinterUsd = prices[3].split(' ')[0] * 1.0;
        snxToMintUsd = prices[4].split(' ')[0] * 1.0;
        snxRewardsThisPeriod = prices[5];
        totalDebt = prices[6];
        browser.close()
    } catch (e) {
        console.log("Error happened on getting data from SNX tools.")
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

        console.log("I got the prices:" + prices);
        periodVolume = prices[3];
        browser.close()
    } catch (e) {
        console.log("Error happened on getting data from SNX tools home.")
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
            var div = document.querySelectorAll('h2');

            var prices = []
            div.forEach(element => {
                prices.push(element.textContent);
            });

            div = document.querySelectorAll('.pieLegendElement');
            div.forEach(element => {
                prices.push(element.textContent);
            });

            return prices
        })

        console.log("I got the dashboard prices:" + prices);
        currentFees = prices[13];
        unclaimedFees = prices[14];
        poolDistribution = prices.slice(27, prices.length);
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

        /** @type {string[]} */
        var prices = await page.evaluate(() => {
            var div = document.querySelectorAll('.table-body-row span');

            var prices = []
            div.forEach(element => {
                prices.push(element.textContent);
            });

            return prices
        })

        console.log("I got the synthetix exchange prices:" + prices);
        var i = 0;
        synths = new Array();
        while (i < prices.length) {
            let synthName = prices[i].substring(0, prices[i].lastIndexOf(prices[i + 1]));
            let gain = prices[i + 3];
            if (gain == "-") {
                gain = "0%";
            }
            synths.push(new Synth(synthName, prices[i + 2], gain));
            if (prices[i + 3] == "-" && synthName.toLowerCase() != "susd") {
                i = i + 5;
            } else {
                i = i + 4;
            }
        }
        synths.sort(function (a, b) {
            return b.gain.replace(/%/g, "") * 1.0 - a.gain.replace(/%/g, "") * 1.0;
        });
        browser.close()
    } catch (e) {
        console.log("Error happened on getting data from synthetix exchange")
    }
}

setInterval(function () {
    https.get('https://api.1inch.exchange/v1.1/quote?fromTokenSymbol=sUSD&toTokenSymbol=USDC&amount=10000000000000000000000', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let result = JSON.parse(data);
            usdcPeg = Math.round(((result.toTokenAmount / 10000000000) + Number.EPSILON) * 100) / 100;
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 60 * 1000);


setInterval(function () {
    https.get('https://api.1inch.exchange/v1.1/quote?fromTokenSymbol=sUSD&toTokenSymbol=USDT&amount=10000000000000000000000', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let result = JSON.parse(data);
            usdtPeg = Math.round(((result.toTokenAmount / 10000000000) + Number.EPSILON) * 100) / 100;
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 60 * 1000);

setInterval(function () {
    https.get('https://api.coingecko.com/api/v3/coins/havven', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let result = JSON.parse(data);
            coingeckoUsd = result.market_data.current_price.usd;
            coingeckoEth = result.market_data.current_price.eth;
            coingeckoBtc = result.market_data.current_price.btc;
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}, 60 * 1000);

setInterval(function () {
    https.get('https://api.binance.com/api/v1/ticker/price?symbol=SNXUSDT', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let result = JSON.parse(data);
            binanceUsd = Math.round(((result.price * 1.0) + Number.EPSILON) * 100) / 100;
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}, 60 * 1000);

setInterval(function () {
    clientFaqPrice.guilds.cache.forEach(function (value, key) {
        value.members.cache.get("745782311382941787").setNickname("$" + binanceUsd);
    });
    clientPegPrice.guilds.cache.forEach(function (value, key) {
        value.members.cache.get("745786402817441854").setNickname("$" + Math.round(((((usdcPeg + usdtPeg) / 2)) + Number.EPSILON) * 100) / 100);
    });
    clientEthPrice.guilds.cache.forEach(function (value, key) {
        value.members.cache.get("745936624935895071").setNickname("$" + ethPrice);
    });
    clientgasPrice.guilds.cache.forEach(function (value, key) {
        value.members.cache.get("745936096336019578").setNickname(gasPrice + " gwei");
    });
    clientTknPrice.guilds.cache.forEach(function (value, key) {
        value.members.cache.get("745936898870083614").setNickname("$" + tknPrice);
    });
    clientCRVPrice.guilds.cache.forEach(function (value, key) {
        value.members.cache.get("746121396396097587").setNickname("$" + crvPrice);
    });
    clientSWTHPrice.guilds.cache.forEach(function (value, key) {
        value.members.cache.get("746120731204649050").setNickname("$" + swthPrice);
    });
}, 70 * 1000);

setInterval(function () {
    https.get('https://trade.kucoin.com/_api/trade-front/market/getSymbolTick?symbols=SNX-USDT', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let result = JSON.parse(data);
            kucoinUsd = result.data[0].lastTradedPrice;
            kucoinUsd = Math.round(((kucoinUsd * 1.0) + Number.EPSILON) * 100) / 100;
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}, 60 * 1000);

function doCalculate(command, msg, gasPriceParam, fromDM) {
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
    msg.reply(exampleEmbed);
}

function doCalculateSusd(command, msg, fromDM) {
    var today = new Date();
    while (today > payday) {
        payday.setDate(payday.getDate() + 7);
    }
    var difference = payday.getTime() - today.getTime();
    var seconds = Math.floor(difference / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);

    var totalFeesNumber = currentFees.replace(/,/g, '').replace(/\$/g, '') * 1.0;
    var unclaimedFeesNumber = unclaimedFees.replace(/,/g, '').replace(/\$/g, '') * 1.0;
    var feesPeriod = totalFeesNumber - unclaimedFeesNumber;
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
    msg.reply(exampleEmbed);
}

setTimeout(getSnxToolStaking, 10 * 1000);
setInterval(getSnxToolStaking, 60 * 10 * 1000);

setTimeout(getSnxToolHome, 30 * 1000);
setInterval(getSnxToolHome, 60 * 7 * 1000);

setTimeout(getDashboard, 20 * 1000);
setInterval(getDashboard, 60 * 13 * 1000);

setTimeout(getExchange, 4 * 1000);
setInterval(getExchange, 60 * 5 * 1000);


client.login(process.env.BOT_TOKEN);
