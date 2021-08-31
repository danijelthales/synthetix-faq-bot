const snxData = require('synthetix-data');


async function doMarkets() {

    let allMarkets = await snxData.binaryOptions.markets();
    let marketsMap = new Map();
    allMarkets.forEach(m => {
        marketsMap.set(m.address, m);
    })

    let markets = ['0x80a54822111c86d4c139e8637ac39114784f881f',
        '0xa59a361e670ca290b5821bbc7b83fe0ed14791d2', '0xc32899cf9b04c3e92409140b15b5b628f8007bc2',
        '0xcae07c9bec312a69856148f9821359d7c27dc51c', '0xd6f36570eead0f7aea0cf655eea47cfafd5000a9'];
    let tallyMap = new Map();
    for (let m in markets) {
        let marketTotal = 0;
        let market = markets[m];
        let transactions = await snxData.binaryOptions.optionTransactions({market: market});
        transactions.forEach(t => {
            if (t.type == "bid") {
                marketTotal += t.amount;
                tallyMap.has(t.account) ? tallyMap.set(t.account, tallyMap.get(t.account) + t.amount) : tallyMap.set(t.account, t.amount);
            }
            if (t.type == "refund") {
                marketTotal -= t.amount;
                tallyMap.has(t.account) ? tallyMap.set(t.account, tallyMap.get(t.account) - t.amount) : tallyMap.set(t.account, -1 * t.amount);
            }
        })
        console.log("Total for market: " + market + " is " + marketTotal);
        let origMarket = marketsMap.get(market);
        let creatorTally = origMarket.poolSize - marketTotal;
        if(creatorTally>0){
            creatorTally=1000;
            console.log("Creator tally is " + creatorTally);
            console.log("Total for market and creators is " + (marketTotal+creatorTally));

            tallyMap.has(origMarket.creator) ? tallyMap.set(origMarket.creator,
                tallyMap.get(origMarket.creator) + creatorTally) : tallyMap.set(origMarket.creator, creatorTally);
        }

    }

    let total = 0;
    tallyMap.forEach((value, key) => {
        console.log(value * 2)
        total += value * 2;
    })
    console.log("total is:" + total);
}

doMarkets()
