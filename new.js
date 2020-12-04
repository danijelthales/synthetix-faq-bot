const snxData = require('synthetix-data');

snxData.exchanges.since({minTimestamp: Math.round(new Date().getTime() / 1000) - 180}).then(result => {
    console.log("Fetching exchanges in last 5 min");
    result.forEach(r => {
        console.log("Exchanged " + r.fromAmount + " " + r.fromCurrencyKey + " to " + r.toAmount + " " + r.toCurrencyKey);
        console.log("Exchanged amount in sUSD was:" + r.toAmountInUSD);
    })
});
