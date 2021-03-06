/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    'use strict';

    const chai = require("chai"),
        should = chai.should(),
        expect = chai.expect;

    const Blockfolio = require("../index");

    const FAKE_TOKEN = "1915f3d2ef313e86";

    // Enable regexps for chai
    chai.use(require('chai-match'));

    describe("Blockfolio API", function() {
        describe("General", function () {
            it("Get the API version", function (done) {
                Blockfolio.getVersion((err, version) => {
                    if (err) { return done(err); }
                    should.exist(version);
                    expect(version).to.be.a("number");
                    return done();
                });
            });
            it("Get the system status of the API", function (done) {
                Blockfolio.getStatus((err, statusMsg) => {
                    if (err) { return done(err); }
                    should.exist(statusMsg);
                    expect(statusMsg).to.be.a("string");
                    return done();
                });
            });
            it("should fail at registering an already activated DEVICE_TOKEN", function (done) {
                Blockfolio._register(FAKE_TOKEN, (err, response) => {
                    should.exist(err.message);
                    should.not.exist(response);
                    return done();
                });
            });
        });
        describe("Module Instanciation", function () {
            it("getPositions called without it should return an error", function (done) {
                Blockfolio.getPositions("BTC/USD", (err, positions) => {
                    should.exist(err.message);
                    expect(err.message).to.equal("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)");
                    should.not.exist(positions);
                    return done();
                });
            });
            it("getMarketDetails called without it should return an error", function (done) {
                Blockfolio.getMarketDetails("BTC/USD").then(() => {
                    return done(new Error("Should not go here without a CLIENT_TOKEN!"));
                }).catch((err) => {
                    should.exist(err.message);
                    expect(err.message).to.equal("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)");
                    return done();
                });
            });
            it("removeCoin called without it should return an error", function (done) {
                Blockfolio.removeCoin("BTC/USD").then(() => {
                    return done(new Error("Should not go here without a CLIENT_TOKEN!"));
                }).catch((err) => {
                    should.exist(err.message);
                    expect(err.message).to.equal("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)");
                    return done();
                });
            });
            it("getHoldings called without it should return an error", function (done) {
                Blockfolio.getHoldings("BTC/USD").then(() => {
                    return done(new Error("Should not go here without a CLIENT_TOKEN!"));
                }).catch((err) => {
                    should.exist(err.message);
                    expect(err.message).to.equal("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)");
                    return done();
                });
            });
            it("getPortfolioSummary called without it should return an error", function (done) {
                Blockfolio.getPortfolioSummary().then(() => {
                    return done(new Error("Should not go here without a CLIENT_TOKEN!"));
                }).catch((err) => {
                    should.exist(err.message);
                    expect(err.message).to.equal("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)");
                    return done();
                });
            });
            it("should fail to initialize with a disposable token", function (done) {
                Blockfolio.init("40f027b891222cdf7fe7d7390a29e4bb5c79ea7adbab660c855b2d6c603de2d710c10aebcc4ee76c6da4402457cbfd50", (err) => {
                    should.exist(err.message);
                    return done();
                });
            });
            it("should initialize quickly with coin checks disabled", function (done) {
                Blockfolio.init(FAKE_TOKEN, { disableCoinCheck: true }).then(() => {
                    return done();
                }).catch((err) => { return done(err); });
            });
            it("addPosition should fail when disableCoinCheck is enabled", function (done) {
                Blockfolio.addPosition("BTC/USD").then(() => {
                    return done(new Error("Should not go here with disableCoinCheck: true!"));
                }).catch((err) => {
                    should.exist(err.message);
                    expect(err.message).to.equal("coinsList uninitialized, could not validate token pairs!");
                    return done();
                });
            });
            it("should fail to register with an existing token", function (done) {
                Blockfolio._register(FAKE_TOKEN).then(() => {
                    return done(new Error("Should not pass"));
                }).catch((err) => { should.exist(err.message); return done(); });
            });
            // Expand timeout for initialization
            this.timeout(30000);
            it("should be ok with a working token", function (done) {
                Blockfolio.init(FAKE_TOKEN).then(() => {
                    return done();
                }).catch((err) => {return done(err); });
            });
        });
        describe("Tools", function () {
            it("should return a random token", function (done) {
                const generatedToken = Blockfolio.utils.generateClientToken();
                expect(generatedToken).to.be.a("string");
                return done();
            });
            it("should convert properly XRP/BTC to a pair struct", function (done) {
                const pair = Blockfolio.utils.parseToken("XRP/BTC");
                expect(pair).to.be.deep.equal({ base: "BTC", token: "XRP" });
                return done();
            });
            it("should convert properly BTC/USD to a pair struct", function (done) {
                const pair = Blockfolio.utils.parseToken("BTC/USD");
                expect(pair).to.be.deep.equal({ base: "USD", token: "BTC" });
                return done();
            });
            it("should convert properly AEON to a pair struct", function (done) {
                const pair = Blockfolio.utils.parseToken("AEON");
                expect(pair).to.be.deep.equal({ base: "BTC", token: "AEON" });
                return done();
            });
            it("should convert properly BTC-LTC to a pair struct", function (done) {
                const pair = Blockfolio.utils.parseToken("BTC-LTC");
                expect(pair).to.be.deep.equal({ base: "BTC", token: "LTC" });
                return done();
            });
            it("should convert properly BTC-DASH to a pair struct", function (done) {
                const pair = Blockfolio.utils.parseToken("BTC-DASH");
                expect(pair).to.be.deep.equal({ base: "BTC", token: "DASH" });
                return done();
            });
            it("should convert properly BTC-BCH to a pair struct", function (done) {
                const pair = Blockfolio.utils.parseToken("BTC-BCH");
                expect(pair).to.be.deep.equal({ base: "BTC", token: "BCH" });
                return done();
            });
        });
        describe("Endpoints", function () {
            // Expand timeout for network & API lentency
            this.timeout(30000);
            describe("Misc", function () {

                it("Get the portfolio summary", function (done) {
                    Blockfolio.getPortfolioSummary().then((summary) => {
                        should.exist(summary);
                        expect(summary.btcValue).to.be.a("number");
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });

                it("Get the currencies list", function (done) {
                    Blockfolio.getCurrencies((err, currencies) => {
                        if (err) {
                            return done(err);
                        }
                        should.exist(currencies);
                        expect(currencies).to.be.an("array");
                        return done();
                    });
                });

                it("Get the coins list", function (done) {
                    Blockfolio.getCoinsList().then((coins) => {
                        should.exist(coins);
                        expect(coins).to.be.an("array");
                        return done();
                    }).catch((err) => { return done(err); });
                });

                it("Get a Disposable Device Token", function (done) {
                    Blockfolio.getDisposableDeviceToken().then((token) => {
                        should.exist(token);
                        expect(token).to.match(/[a-f0-9]{96}/);
                        return done();
                    }).catch((err) => { return done(err); });
                });
            });
            describe("Markets & Exchanges", function () {

                it("Get market details for an AEON/BTC on Bittrex", function (done) {
                    Blockfolio.getMarketDetails("AEON/BTC", {
                        exchange: "bittrex"
                    }, (err, details) => {
                        if (err) {
                            return done(err);
                        }

                        should.exist(details.ask);
                        expect(details.ask).to.be.a("string");
                        return done();
                    });
                });

                it("Get market details for an LTC/BTC on the top exchange", function (done) {
                    Blockfolio.getMarketDetails("LTC/BTC").then((details) => {
                        should.exist(details.ask);
                        expect(details.ask).to.be.a("string");
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });

                it("Get available exchanges for this token", function (done) {
                    Blockfolio.getExchanges("AEON/BTC", (err, exchanges) => {
                        if (err) {
                            return done(err);
                        }

                        expect(exchanges).to.be.an("array");
                        return done();
                    });
                });

                it("Get available exchanges for an incorrect token", function (done) {
                    Blockfolio.getExchanges("ZSKJD/BTC").then((exchanges) => {
                        should.not.exist(exchanges);
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("ZSKJD/BTC is not an available token on Blockfolio!");
                        return done();
                    });
                });

                it("Get the last price of an incorrect token on this exchange", function (done) {
                    Blockfolio.getPrice("EAZRREZREZ/BTC", {
                        exchange: "bittrex"
                    }, (err, rPrice) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("EAZRREZREZ/BTC is not an available token on Blockfolio!");
                        should.not.exist(rPrice);
                        return done();
                    });
                });

                it("... and with a valid token, but an incorrect base", function (done) {
                    Blockfolio.getPrice("BTC/DSQFSDFDSF", {
                        exchange: "bittrex"
                    }).then(() => {
                        return done(new Error("Should not be here!"));
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("BTC/DSQFSDFDSF is not an available token on Blockfolio!");
                        return done();
                    });
                });

                it("Get the last price of ETH on the top exchange", function (done) {
                    Blockfolio.getPrice("ETH").then((cPrice) => {
                        expect(cPrice).to.be.a("number");
                        return done();
                    }).catch((err) => { return done(err); });
                });

                it("Get the last price of AEON on this exchange", function (done) {
                    Blockfolio.getPrice("AEON/BTC", {
                        exchange: "bittrex"
                    }, (err, cPrice) => {
                        if (err) { return done(err); }

                        expect(cPrice).to.be.a("number");
                        return done();
                    });
                });
            });
            describe("Positions", function () {
              
                it("Add a BTC position on this pair (buy)", function (done) {
                    Blockfolio.addPosition("AEON/BTC", {
                        exchange: "bittrex",
                        price: 0.00018,
                        amount: 200,
                        note: "AEON FTW"
                    }, (err) => {
                        if (err) { return done(err); }

                        return done();
                    });
                });
                it("Add another BTC position on this pair (sell)", function (done) {
                    Blockfolio.addPosition("AEON/BTC", {
                        mode: "sell",
                        exchange: "bittrex",
                        price: 0.00018,
                        amount: 10,
                        note: "AEON FTW"
                    }, (err) => {
                        if (err) { return done(err); }

                        return done();
                    });
                });

                it("Get the summary for current position", function (done) {
                    Blockfolio.getHoldings("AEON/BTC").then((summary) => {
                        should.exist(summary.holdingValueString);
                        expect(summary.holdingValueString).to.be.a("string");
                        return done();
                    }).catch((err) => { return done(err); });
                });

                var posId = 0;
                it("Get orders details for this position", function (done) {
                    Blockfolio.getPositions("AEON/BTC").then((positions) => {
                        should.exist(positions);
                        expect(positions).to.be.an("array");
                        posId = positions[0].positionId;
                        return done();
                    }).catch((err) => { return done(err); });
                });

                it("Remove the just added position", function (done) {
                    Blockfolio.removePosition(posId).then(() => {
                        return done();
                    }).catch((err) => { return done(err); });
                });

                it("And then remove completely the coin from portfolio", function (done) {
                    Blockfolio.removeCoin("AEON/BTC", (err, res) => {
                        if (err) { return done(err); }

                        expect(res).to.equal("success");
                        return done();
                    });
                });

                it("Get actual positions left", function (done) {
                    Blockfolio.getPositions((err, positions) => {
                        if (err) { return done(err); }

                        should.exist(positions);
                        expect(positions).to.be.an("array");
                        return done();
                    });
                });

                it("Add a token pair to watch from Bittrex", function (done) {
                    Blockfolio.addPosition("AEON/BTC", {exchange: "bittrex"}, (err) => {
                        if (err) return done(err);
                        return done();
                    });
                });

                it("Watch LTC/BTC from the top exchange", function (done) {
                    Blockfolio.addPosition("LTC/BTC").then(() => {
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });

                it("addPosition should fail when no parameter is passed", function (done) {
                    Blockfolio.addPosition().then(() => {
                        return done(new Error("Should not go here with no pair!"));
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("You must provide a token to add to your position!");
                        return done();
                    });
                });
                it("removePosition should fail when no parameter is passed", function (done) {
                    Blockfolio.removePosition().then(() => {
                        return done(new Error("Should not go here with no positionId!"));
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("You must provide a position ID!");
                        return done();
                    });
                });

            });
            describe("Alerts", function () {

                it("Add an alert when LTC/EUR crosses 200", function (done) {
                    Blockfolio.addAlert("LTC/EUR", {
                        above: 200
                    }).then(() => {
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });

                it("Add an alert when BTC/EUR crosses 20000 on Coinbase", function (done) {
                    Blockfolio.addAlert("BTC/EUR", {
                        above: 20000,
                        exchange: "Coinbase"
                    }).then(() => {
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });

                it("Add an alert when ETH/EUR crosses 2000 on Bittrex with persistence", function (done) {
                    Blockfolio.addAlert("ETH/EUR", {
                        above: 2000,
                        exchange: "bittrex",
                        persistent: true
                    }).then(() => {
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });

                let alertToDelete = 1;
                it("Get the alerts for LTC/EUR", function (done) {
                    Blockfolio.getAlerts("LTC/EUR").then((alerts) => {
                        expect(alerts).to.be.an("array");
                        alertToDelete = alerts[0].alertId;
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });

                it("Pause all alerts on LTC/EUR", function (done) {
                    Blockfolio.pauseAllAlerts("LTC/EUR").then(() => {
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });

                it("... And restart them", function (done) {
                    Blockfolio.startAllAlerts("LTC/EUR").then(() => {
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });

                it("Pause just the last added alert", function (done) {
                    Blockfolio.pauseAlert(alertToDelete).then(() => {
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });

                it("... Restart it", function (done) {
                    Blockfolio.startAlert(alertToDelete).then(() => {
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });

                it("... And then remove it!", function (done) {
                    Blockfolio.removeAlert(alertToDelete).then(() => {
                        return done();
                    }).catch((err) => {
                        return done(err);
                    });
                });
                it("addAlert should fail when no parameter is passed", function (done) {
                    Blockfolio.addAlert().then(() => {
                        return done(new Error("Should not go here with no pair!"));
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("You must provide a pair to set alerts!");
                        return done();
                    });
                });
                it("addAlert should fail when boundaries are missing", function (done) {
                    Blockfolio.addAlert("XMR/BTC").then(() => {
                        return done(new Error("Should not go here with no boundaries!"));
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("You must specify at leat a boundary to set up an alert!");
                        return done();
                    });
                });
                it("getAlerts should fail when no parameter is passed", function (done) {
                    Blockfolio.getAlerts().then(() => {
                        return done(new Error("Should not go here with no pair!"));
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("You must provide a pair to get alerts from!");
                        return done();
                    });
                });
                it("pauseAlert should fail when no parameter is passed", function (done) {
                    Blockfolio.pauseAlert().then(() => {
                        return done(new Error("Should not go here with no alertId!"));
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("You must provide an alert ID!");
                        return done();
                    });
                });
                it("startAlert should fail when no parameter is passed", function (done) {
                    Blockfolio.startAlert().then(() => {
                        return done(new Error("Should not go here with no alertId!"));
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("You must provide an alert ID!");
                        return done();
                    });
                });
                it("pauseAllAlerts should fail when no parameter is passed", function (done) {
                    Blockfolio.pauseAllAlerts().then(() => {
                        return done(new Error("Should not go here with no pair!"));
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("You must provide a pair to pause alerts!");
                        return done();
                    });
                });
                it("startAllAlerts should fail when no parameter is passed", function (done) {
                    Blockfolio.startAllAlerts().then(() => {
                        return done(new Error("Should not go here with no pair!"));
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("You must provide a pair to start alerts!");
                        return done();
                    });
                });
                it("removeAlert should fail when no parameter is passed", function (done) {
                    Blockfolio.removeAlert().then(() => {
                        return done(new Error("Should not go here with no alertId!"));
                    }).catch((err) => {
                        should.exist(err.message);
                        expect(err.message).to.equal("You must provide an alert ID!");
                        return done();
                    });
                });
            });
        });
    });

})();