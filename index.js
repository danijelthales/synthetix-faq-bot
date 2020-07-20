require("dotenv").config()
const Discord = require("discord.js")
const client = new Discord.Client();
const replaceString = require('replace-string');
const https = require('https');

var fs = require('fs');

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})
client.on("message", msg => {

    if (msg.author.username != "FAQ") {
        if (!(msg.channel.type == "dm")) {
            if (msg.content.startsWith("!FAQ")) {
                msg.reply("Hi, I am Synthetix FAQ bot. I will be very happy to assist you, just ask me for help in DM.");
            }
        } else {

            if (msg.content == "help") {

                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Synthetix Frequently Asked Questions')
                    .setURL('https://help.synthetix.io/hc/en-us');

                exampleEmbed.setDescription('Hello, here is list of commands I know:');
                exampleEmbed.addField("list", "List all known questions");
                exampleEmbed.addField("categories", "Lists all categories of known questions");
                exampleEmbed.addField("category {categoryName}", "List all known questions for a given category");
                exampleEmbed.addField("question {questionNumber}", "Show the answer to the question defined by its number");
                exampleEmbed.addField("search {keyword}", "Search all known questions by given {keyword}");

                msg.reply(exampleEmbed);

            } else if (msg.content == "list") {

                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Frequently Asked Questions')
                    .setURL('https://help.synthetix.io/hc/en-us');

                fs.readdir('questions', function (err, files) {
                    if (err) {
                        console.log("Error getting directory information.")
                    } else {
                        files.forEach(function (file) {
                            let rawdata = fs.readFileSync('questions/' + file, "utf8");
                            exampleEmbed.addField(file.substring(0, file.lastIndexOf(".")), rawdata, false)
                        })
                    }
                    exampleEmbed.setFooter('Choose your question with e.g. "question 1"', 'https://iafFAQ.files.wordpress.com/2020/03/FAQ-image-iaf-2.png?w=1200');
                    msg.reply(exampleEmbed);
                })

            } else if (msg.content.startsWith("question")) {

                const args = msg.content.slice("question".length).split(' ');
                args.shift();
                const command = args.shift();


                let rawdata = fs.readFileSync('answers/' + command + '.json');
                let answer = JSON.parse(rawdata);

                const exampleEmbed = new Discord.MessageEmbed();
                exampleEmbed.setColor(answer.color);
                exampleEmbed.setTitle(answer.title);
                exampleEmbed.setDescription(answer.description);
                exampleEmbed.setURL(answer.url);

                if (command == "7") {

                    https.get('https://ethgasstation.info/api/ethgasAPI.json', (resp) => {
                        let data = '';

                        // A chunk of data has been recieved.
                        resp.on('data', (chunk) => {
                            data += chunk;
                        });

                        // The whole response has been received. Print out the result.
                        resp.on('end', () => {
                            let result = JSON.parse(data);
                            exampleEmbed.addField("Safe low gas price:", result.safeLow / 10 + ' gwei', false);
                            exampleEmbed.addField("Standard gas price:", result.average / 10 + ' gwei', false);
                            exampleEmbed.addField("Fast gas price:", result.fast / 10 + ' gwei', false);
                            msg.reply(exampleEmbed);
                        });

                    }).on("error", (err) => {
                        console.log("Error: " + err.message);
                    });

                } else if (command == "9") {

                    https.get('https://api.coingecko.com/api/v3/coins/havven', (resp) => {
                        let data = '';

                        // A chunk of data has been recieved.
                        resp.on('data', (chunk) => {
                            data += chunk;
                        });

                        // The whole response has been received. Print out the result.
                        resp.on('end', () => {
                            let result = JSON.parse(data);
                            exampleEmbed.addField("USD", result.market_data.current_price.usd, false);
                            exampleEmbed.addField("ETH:", result.market_data.current_price.eth, false);
                            exampleEmbed.addField("BTC:", result.market_data.current_price.btc, false);
                            msg.reply(exampleEmbed);
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
                            exampleEmbed.addField("USD", result.market_data.current_price.usd, false);
                            msg.reply(exampleEmbed);
                        });

                    }).on("error", (err) => {
                        console.log("Error: " + err.message);
                    });

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

                    msg.reply(exampleEmbed);
                }

            } else if (msg.content == "categories") {

                let rawdata = fs.readFileSync('categories/categories.json');
                let categories = JSON.parse(rawdata);

                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Categories');

                categories.forEach(function (category) {
                    exampleEmbed.addField(category.name, category.desc, false);
                });

                exampleEmbed.setFooter('Choose the category with "category {categoryName}", e.g. "category SNX"',
                    'https://iafFAQ.files.wordpress.com/2020/03/FAQ-image-iaf-2.png?w=1200');
                msg.reply(exampleEmbed);

            } else if (msg.content.startsWith("category")) {

                const args = msg.content.slice("category".length).split(' ');
                args.shift();
                const command = args.shift();

                let rawdata = fs.readFileSync('categories/categories.json');
                let categories = JSON.parse(rawdata);

                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Questions in category ' + command + ':');

                categories.forEach(function (category) {
                    if (category.name == command) {
                        category.questions.forEach(function (question) {
                            rawdata = fs.readFileSync('questions/' + question + ".txt", "utf8");
                            exampleEmbed.addField(question, rawdata, false);
                        });
                    }
                });

                exampleEmbed.setFooter('Choose your question with e.g. "question 1"', 'https://iafFAQ.files.wordpress.com/2020/03/FAQ-image-iaf-2.png?w=1200');
                msg.reply(exampleEmbed);

            } else if (msg.content.startsWith("search")) {

                const args = msg.content.slice("search".length).split(' ').slice(1);

                const searchWord = msg.content.substring("search".length + 1);

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
                        files.forEach(function (file) {
                            let rawdata = fs.readFileSync('questions/' + file, "utf8");
                            if (rawdata.includes(searchWord)) {
                                rawdata = replaceString(rawdata, searchWord, '***' + searchWord + '***');
                                fullMatches.push(new Match(file.substring(0, file.lastIndexOf(".")), rawdata));
                            } else {
                                let matchedCount = 0;
                                args.forEach(function (arg) {
                                    if (rawdata.includes(arg)) {
                                        rawdata = replaceString(rawdata, arg, '***' + arg + '***');
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

                        fullMatches.forEach(function (match) {
                            exampleEmbed.addField(match.title, match.value, false);
                        });

                        partialMatches.sort(function (a, b) {
                            return b.matchedCount - a.matchedCount;
                        });
                        partialMatches.forEach(function (match) {
                            exampleEmbed.addField(match.title, match.value, false);
                        });

                        exampleEmbed.setFooter('Choose your question with e.g. "question 1"', 'https://iafFAQ.files.wordpress.com/2020/03/FAQ-image-iaf-2.png?w=1200');
                    }
                    msg.reply(exampleEmbed);
                })

            } else {
                if (msg.author.username != "FAQ") {
                    msg.reply("Oops, I don't know that one. Try 'help' to see what I do know.");
                }
            }
        }
    }
})
client.login(process.env.BOT_TOKEN)
