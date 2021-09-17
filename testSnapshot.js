require("dotenv").config();


const Discord = require("discord.js");
const clientReminder = new Discord.Client();
clientReminder.login(process.env.BOT_TOKEN_COUNCIL_REMINDER);

let guild = null;
let councilChannel = null;
clientReminder.on("ready", () => {
    console.log(`Logged in as ${clientReminder.user.tag}!`);
    clientReminder.channels.fetch('887660245063725106').then(c => {
        councilChannel = c
    });

    clientReminder.guilds.cache.forEach(function (value, key) {
        if (value.name.toLowerCase().includes('synthetix') || value.name.toLowerCase().includes('playground')) {
            guild = value;
        }
    });

    checkVotes();
});


const {request, gql} = require('graphql-request');
const activeproposals = gql`
    query Proposals {
        proposals(
            first: 20,
            skip: 0,
            where: {
                space_in: ["snxgov.eth"],
                state: "active"
            },
            orderBy: "created",
            orderDirection: desc
        ) {
            id
            title
            body
            choices
            start
            end
            snapshot
            state
            author
            space {
                id
                name
            }
        }
    }
`;

let votes = gql`
    query getVotes($voteid: String!){
        votes (
            first: 1000
            skip: 0
            where: {
                proposal: $voteid
            }
            orderBy: "created",
            orderDirection: desc
        ) {
            id
            voter
            created
            proposal {
                id
            }
            choice
            space {
                id
            }
        }
    }

`;

let voters = [
    {
        name: 'kain',
        address: '0x42f9134E9d3Bf7eEE1f8A5Ac2a4328B059E7468c',
        discordId: '420339322785366019'
    },
    {
        name: 'sm',
        address: '0x0bc3668d2AaFa53eD5E5134bA13ec74ea195D000',
        discordId: '530165298360483850'
    },
    {
        name: 'spreek',
        address: '0x935D2fD458fdf41B6F7B62471f593797866a3Ce6',
        discordId: '136272881666621440'
    },
    {
        name: 'brian',
        address: '0xB0a5a05ac5791AD5a28905B57182CAB1DF9B10aA',
        discordId: '382531227288076288'
    },
    {
        name: 'michael',
        address: '0x65DCD62932fEf5af25AdA91F0F24658e94e259c5',
        discordId: '319916151415242755'
    },
    {
        name: 'jackson',
        address: '0x0120666306F4D15bb125696f322BFD8EE83423a9',
        discordId: '420339322785366019'
    },
    {
        name: 'danijel',
        address: '0x461783A831E6dB52D68Ba2f3194F6fd1E0087E04',
        discordId: '513707101730897921'
    },
    {
        name: 'bojan',
        address: '0x4412bCaf3c6e37d0e6Fb14a00167B5d98D1dd8C1',
        discordId: '513707101730897921'
    }
]

let performance = null;

function checkVotes() {
    try {
        request('https://hub.snapshot.org/graphql', activeproposals).then((data) => {
            console.log(data.proposals);

            data.proposals.forEach(p => {
                const variables = {
                    voteid: p.id,
                }
                request('https://hub.snapshot.org/graphql', votes, variables).then((datavotes) => {
                    console.log(datavotes);
                    let votedVoters = datavotes.votes.map(v => {
                        return v.voter;
                    })
                    voters.forEach(v => {
                        if (!votedVoters.includes(v.address)) {
                            let discordUser = '<@!' + v.discordId + '>';
                            councilChannel.send('Reminding ' + discordUser + ' to vote on https://staking.synthetix.io/gov/snxgov.eth/' + p.id);
                            // TODO: the below doesnt work
                            guild.members.fetch(v.discordId).then(member => {
                                member.send('Reminder to vote on https://staking.synthetix.io/gov/snxgov.eth/' + p.id);
                            });
                        }
                    })
                    console.log(votedVoters);
                });
            })
        });
    } catch (e) {
        console.log(e);
    }
}
