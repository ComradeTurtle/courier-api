"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourierCenter = exports.SendX = exports.EasyMail = exports.Speedex = exports.Geniki = exports.SpeedPak = exports.DHL = exports.ACS = exports.Elta = void 0;
const axios_1 = __importDefault(require("axios"));
const jsdom_1 = require("jsdom");
class Elta {
    get(tracking) {
        return new Promise((resolve, reject) => {
            axios_1.default.request({
                method: "POST",
                url: "https://www.elta-courier.gr/track.php",
                data: `number=${tracking}`
            }).then((result) => {
                const data = result.data.result[tracking].result;
                if (typeof data === "string")
                    reject({ status: "no result" });
                else
                    resolve(data);
            }).catch(reject);
        });
    }
}
exports.Elta = Elta;
class ACS {
    get(tracking) {
        return new Promise((resolve, reject) => {
            axios_1.default.request({
                method: "GET",
                url: `https://api.acscourier.net/api/parcels/search/${tracking}`,
                headers: {
                    "Accept-Language": "el",
                    "X-Country": "GR",
                }
            }).then((result) => {
                let obj = 0, trData = {};
                result.data.items[0].statusHistory.forEach((item) => {
                    if (!trData[obj])
                        trData[obj] = {};
                    trData[obj].status = item.description;
                    trData[obj].place = item.controlPoint;
                    trData[obj].date = new Intl.DateTimeFormat("el", {
                        dateStyle: "short",
                    }).format(new Date(item.controlPointDate));
                    trData[obj].time = new Intl.DateTimeFormat("el", {
                        timeStyle: "medium",
                        hour12: false
                    }).format(new Date(item.controlPointDate));
                    obj += 1;
                });
                resolve(Object.values(trData));
            }).catch(reject);
        });
    }
}
exports.ACS = ACS;
class DHL {
    get(tracking) {
        return new Promise((resolve, reject) => {
            axios_1.default.request({
                method: "GET",
                url: `https://api-eu.dhl.com/track/shipments?trackingNumber=${tracking}&language=el`,
                headers: {
                    "DHL-API-Key": "0kCkU1GnqL0DH434TnFdX4zBznXDQTa4"
                }
            }).then((result) => {
                const shipment = result.data.shipments[0];
                const events = shipment.events;
                let obj = 0, trData = {};
                if (shipment.status.statusCode === "delivered")
                    resolve([
                        {
                            status: "DELIVERED",
                            place: shipment.destination.address.addressLocality,
                            date: shipment.status.timestamp.split("T")[0],
                            time: shipment.status.timestamp.split("T")[1]
                        }
                    ]);
                events.forEach((event) => {
                    if (!trData[obj])
                        trData[obj] = {};
                    trData[obj].status = event.description;
                    trData[obj].place = event.location.address.addressLocality;
                    trData[obj].date = event.timestamp.split("T")[0];
                    trData[obj].time = event.timestamp.split("T")[1];
                    obj += 1;
                });
                resolve(Object.values(trData).reverse());
            }).catch((err) => {
                switch (err?.response?.status) {
                    case 404:
                        reject({ status: "no result" });
                        break;
                    case 429:
                        reject({ status: "rate limited" });
                        break;
                    default:
                        reject({ status: "unspecified error" });
                        break;
                }
            });
        });
    }
}
exports.DHL = DHL;
class SpeedPak {
    get(tracking) {
        return new Promise((resolve, reject) => {
            axios_1.default.request({
                method: "POST",
                url: "https://azure-cn.orangeconnex.com/oc/capricorn-website/website/v1/tracking/traces",
                headers: {
                    "Content-Type": "application/json"
                },
                data: `{"trackingNumbers": ["${tracking}"], "language": "en-US"}`
            }).then((result) => {
                if (!result.data.success)
                    return reject({ status: "Unspecified Error" });
                if (result.data.result.notExistsTrackingNumbers.length !== 0)
                    return reject({ status: "no result" });
                let obj = 0, trData = {};
                result.data.result.waybills[0].traces.forEach((trace) => {
                    if (!trData[obj])
                        trData[obj] = {};
                    const date = new Date(trace.oprTimestamp);
                    let place;
                    if (trace.oprCountry && !trace.oprCity)
                        place = trace.oprCountry;
                    else if (!trace.oprCountry && trace.oprCity)
                        place = trace.oprCity;
                    else if (!trace.oprCountry && !trace.oprCity)
                        place = "";
                    else
                        place = `${trace.oprCity}, ${trace.oprCountry}`;
                    trData[obj].status = trace.eventDesc;
                    trData[obj].place = place;
                    trData[obj].date = date.toLocaleDateString("en-GB");
                    trData[obj].time = date.toLocaleTimeString("it-IT");
                    obj += 1;
                });
                resolve(Object.values(trData).reverse());
            }).catch(reject);
        });
    }
}
exports.SpeedPak = SpeedPak;
class Geniki {
    get(tracking) {
        return new Promise((resolve, reject) => {
            axios_1.default.request({
                method: "GET",
                url: `https://www.taxydromiki.com/track/${tracking}`,
                headers: {
                    "Cookie": "browser_language=en;"
                },
            }).then((result) => {
                const DOM = new jsdom_1.JSDOM(result.data, {
                    url: `https://www.taxydromiki.com/`
                });
                const contentElement = DOM.window.document.getElementById("edit-content");
                if (!contentElement)
                    reject({ status: "no result" });
                const trDOM = new jsdom_1.JSDOM(contentElement?.innerHTML);
                let obj = 0, trData = {};
                Array.prototype.forEach.call(trDOM.window.document.getElementsByClassName("checkpoint-status"), (element) => {
                    const innerHTML = element.innerHTML;
                    if (!trData[obj])
                        trData[obj] = {};
                    trData[obj].status = innerHTML.substring(26) || "N/A";
                    obj += 1;
                });
                obj = 0;
                Array.prototype.forEach.call(trDOM.window.document.getElementsByClassName("checkpoint-location"), (element) => {
                    const innerHTML = element.innerHTML;
                    if (!trData[obj])
                        trData[obj] = {};
                    trData[obj].place = innerHTML.substring(26) || "N/A";
                    obj += 1;
                });
                obj = 0;
                Array.prototype.forEach.call(trDOM.window.document.getElementsByClassName("checkpoint-date"), (element) => {
                    const innerHTML = element.innerHTML;
                    if (!trData[obj])
                        trData[obj] = {};
                    trData[obj].date = innerHTML.substring(27).split(', ')[1] || "N/A";
                    obj += 1;
                });
                obj = 0;
                Array.prototype.forEach.call(trDOM.window.document.getElementsByClassName("checkpoint-time"), (element) => {
                    const innerHTML = element.innerHTML;
                    if (!trData[obj])
                        trData[obj] = {};
                    trData[obj].time = innerHTML.substring(21) || "N/A";
                    obj += 1;
                });
                if (Object.keys(trData).length < 1)
                    reject({ status: "no result" });
                resolve(Object.values(trData));
            }).catch(() => reject({ status: "invalid tracking code" }));
        });
    }
}
exports.Geniki = Geniki;
class Speedex {
    get(tracking) {
        return new Promise((resolve, reject) => {
            axios_1.default.request({
                method: "GET",
                url: `http://www.speedex.gr/speedex/NewTrackAndTrace.aspx?number=${tracking}`
            }).then((result) => {
                const DOM = new jsdom_1.JSDOM(result.data, {
                    url: "http://www.speedex.gr"
                });
                const cards = DOM.window.document;
                let number = 0, obj = 0, trData = {}, stData = [];
                Array.prototype.forEach.call(cards.getElementsByClassName("card-title"), (element) => {
                    const innerHtml = element.innerHTML;
                    if (innerHtml.includes("<p>"))
                        stData.push(`Η ΑΠΟΣΤΟΛΗ ΠΑΡΑΛΗΦΘΗ ΑΠΟ: ${element.innerHTML.split(': ')[1]}`);
                    else
                        stData.push(element.innerHTML);
                });
                Array.prototype.forEach.call(cards.getElementsByClassName("card-subtitle"), (element) => {
                    if (!trData[obj])
                        trData[obj] = {};
                    const innerHTML = element.innerHTML;
                    let desc = innerHTML.trim().split('>')[1];
                    trData[obj].status = stData[obj];
                    trData[obj].place = desc.substring(0, desc.length - 6).split(",")[0];
                    trData[obj].date = desc.substring(0, desc.length - 6).split(" ")[1];
                    trData[obj].time = desc.substring(0, desc.length - 6).split(",")[1].split(" ")[3];
                    number += 1;
                    if (number === 1) {
                        number = 0;
                        obj += 1;
                    }
                });
                resolve(Object.values(trData));
            }).catch(reject);
        });
    }
}
exports.Speedex = Speedex;
class EasyMail {
    get(tracking) {
        return new Promise((resolve, reject) => {
            axios_1.default.request({
                method: "GET",
                url: `https://trackntrace.easymail.gr/${tracking}`
            }).then((result) => {
                const DOM = new jsdom_1.JSDOM(result.data);
                let number = 0, obj = 0, trData = {};
                const table = DOM.window.document.getElementsByClassName("table-hover");
                Array.prototype.forEach.call(table, (element) => {
                    Array.prototype.forEach.call(element.getElementsByTagName("td"), (item) => {
                        if (!trData[obj])
                            trData[obj] = {};
                        if (item.innerHTML.includes("/")) {
                            if (!item.innerHTML.includes("<a")) {
                                trData[obj].date = item.innerHTML.split(" ")[0];
                                trData[obj].time = item.innerHTML.split(" ")[1]
                                    .substring(0, item.innerHTML.split(" ")[1].length - 3);
                            }
                        }
                        else if (item.innerHTML === item.innerHTML.toUpperCase())
                            trData[obj].place = item.innerHTML.toUpperCase();
                        else
                            trData[obj].status = item.innerHTML;
                        number += 1;
                        if (number === 3) {
                            number = 0;
                            obj += 1;
                        }
                    });
                });
                if (Object.keys(trData).length < 1)
                    reject({ status: "no result" });
                resolve(Object.values(trData).reverse().pop());
            }).catch(reject);
        });
    }
}
exports.EasyMail = EasyMail;
class SendX {
    get(tracking, lang) {
        return new Promise((resolve, reject) => {
            axios_1.default.request({
                method: 'GET',
                url: `https://api.sendx.gr/user/hp/${tracking}`
            })
                .then((result) => {
                let obj = 0, data = result.data, trData = {};
                data.trackingDetails.forEach((e) => {
                    if (!trData[obj])
                        trData[obj] = {};
                    let rawdata = new Date(e.updatedAt);
                    trData[obj].time = rawdata.toLocaleTimeString('en-US', { hour12: false });
                    trData[obj].date = rawdata.toLocaleDateString('en-GB');
                    if (lang === 'GR')
                        trData[obj].status = e.description_gr;
                    else
                        trData[obj].status = e.description;
                    obj++;
                });
                console.log(Object.values(trData));
                resolve(Object.values(trData));
            }).catch((err) => {
                if (err.response.data.error_description === 'Wrong tracking id format')
                    reject({ status: "invalid tracking code" });
                if (err.statusCode == 400 || !err.response.data.success)
                    reject({ status: "no result" });
            });
        });
    }
}
exports.SendX = SendX;
class CourierCenter {
    get(tracking) {
        return new Promise((resolve, reject) => {
            let obj = 0, c0 = 0, c1 = 1, c2 = 0, trData = {};
            axios_1.default.request({
                method: 'POST',
                url: 'https://www.courier.gr/track/result/',
                data: `tracknr=${tracking}`
            })
                .then((result) => {
                const DOM = new jsdom_1.JSDOM(result.data);
                const table = DOM.window.document.getElementsByClassName('tr');
                Array.prototype.forEach.call(table, (element) => {
                    // First set the time for all objects
                    let tdiv = element.getElementsByClassName('time');
                    Array.prototype.forEach.call(tdiv, (e) => {
                        if (!trData[obj])
                            trData[obj] = {};
                        if (!e)
                            return;
                        trData[obj].time = e.innerHTML;
                        obj++;
                    });
                    // Now set the date and do not create objects since they have already been created..
                    let ddiv = element.getElementsByClassName('date');
                    Array.prototype.forEach.call(ddiv, (e) => {
                        if (!trData[c0])
                            trData[c0] = {};
                        if (!e)
                            return;
                        trData[c0].date = e.innerHTML;
                        c0++;
                    });
                    // Now set the action for each object..
                    let adiv = element.getElementsByClassName('action');
                    Array.prototype.forEach.call(adiv, (e) => {
                        if (!trData[c1])
                            trData[c1] = {};
                        if (!e)
                            return;
                        trData[c1].status = e.innerHTML;
                        c1++;
                    });
                    // Finally set the place
                    let pdiv = element.getElementsByClassName('area');
                    Array.prototype.forEach.call(pdiv, (e) => {
                        if (!trData[c2])
                            trData[c2] = {};
                        if (!e)
                            return;
                        trData[c2].place = e.innerHTML;
                        c2++;
                    });
                });
                let trArray = Object.values(trData).reverse();
                if (trArray.length < 1)
                    return reject({ status: "no result" });
                trArray.pop();
                resolve(trArray);
            });
        });
    }
}
exports.CourierCenter = CourierCenter;
