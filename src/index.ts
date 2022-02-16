import Axios, {AxiosResponse} from "axios";
import {JSDOM} from "jsdom"
import {CourierClass, CourierData, Responses, TrackingData} from "courier";

export class Elta implements CourierClass<CourierData> {
    get(tracking: string): Promise<CourierData[]> {
        return new Promise((resolve, reject) => {
            Axios.request({
                method: "POST",
                url: "https://www.elta-courier.gr/track.php",
                data: `number=${tracking}`
            }).then((result: AxiosResponse<Responses.Elta>) => {
                const data = result.data.result[tracking].result;
                if (typeof data === "string")
                    reject({status: "No results were provided by the selected courier service!"});
                else resolve(data);
            }).catch(reject);
        });
    }
}

export class ACS implements CourierClass<CourierData> {
    get(tracking: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            Axios.request({
                method: "GET",
                url: `https://api.acscourier.net/api/parcels/search/${tracking}`,
                headers: {
                    "Accept-Language": "el",
                    "X-Country": "GR",
                }
            }).then((result: AxiosResponse<Responses.ACS>) => {
                let obj = 0, trData: TrackingData = {};

                result.data.items[0].statusHistory.forEach((item) => {
                    if (!trData[obj]) trData[obj] = {};

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

export class DHL implements CourierClass<CourierData> {
    get(tracking: string): Promise<CourierData[]> {
        return new Promise((resolve, reject) => {
            Axios.request({
                method: "GET",
                url: `https://api-eu.dhl.com/track/shipments?trackingNumber=${tracking}&language=el`,
                headers: {
                    "DHL-API-Key": "0kCkU1GnqL0DH434TnFdX4zBznXDQTa4"
                }
            }).then((result: AxiosResponse<Responses.DHL>) => {
                const shipment = result.data.shipments[0];
                const events = shipment.events;
                let obj = 0, trData: TrackingData = {};

                if (shipment.status.statusCode === "delivered") resolve([
                    {
                        status: "DELIVERED",
                        place: shipment.destination.address.addressLocality,
                        date: shipment.status.timestamp.split("T")[0],
                        time: shipment.status.timestamp.split("T")[1]
                    }
                ]);

                events.forEach((event) => {
                    if (!trData[obj]) trData[obj] = {};

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
                        reject({status: "no result"});
                        break;
                    case 429:
                        reject({status: "rate limited"});
                        break;
                    default:
                        reject({status: "unspecified error"});
                        break;
                }
            });
        })
    }
}

export class SpeedPak implements CourierClass<CourierData> {
    get(tracking: string): Promise<CourierData[]> {
        return new Promise((resolve, reject) => {
            Axios.request({
                method: "POST",
                url: "https://azure-cn.orangeconnex.com/oc/capricorn-website/website/v1/tracking/traces",
                headers: {
                    "Content-Type": "application/json"
                },
                data: `{"trackingNumbers": ["${tracking}"], "language": "en-US"}`
            }).then((result: AxiosResponse<Responses.SpeedPack>) => {
                if (!result.data.success)
                    return reject({status: "Unspecified Error"});

                if (result.data.result.notExistsTrackingNumbers.length !== 0)
                    return reject({status: "No result"});

                let obj = 0, trData: TrackingData = {};
                result.data.result.waybills[0].traces.forEach((trace) => {
                    if (!trData[obj]) trData[obj] = {};

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
        })
    }
}

export class Geniki implements CourierClass<CourierData> {
    get(tracking: string): Promise<CourierData[]> {
        return new Promise((resolve, reject) => {
            Axios.request({
                method: "GET",
                url: `https://www.taxydromiki.com/track/${tracking}`,
                headers: {
                    "Cookie": "browser_language=en;"
                },
            }).then((result) => {
                const DOM = new JSDOM(result.data, {
                    url: `https://www.taxydromiki.com/`
                });

                const contentElement = DOM.window.document.getElementById("edit-content");
                if (!contentElement)
                    reject({status: "No results were provided by the selected courier service!"});

                const trDOM = new JSDOM(contentElement?.innerHTML);
                let obj = 0, trData: TrackingData = {};

                Array.prototype.forEach.call(trDOM.window.document.getElementsByClassName("checkpoint-status"), (element: Element) => {
                    const innerHTML = element.innerHTML;

                    if (!trData[obj]) trData[obj] = {};
                    trData[obj].status = innerHTML.substring(26) || "N/A";
                    obj += 1;
                });

                obj = 0;
                Array.prototype.forEach.call(trDOM.window.document.getElementsByClassName("checkpoint-location"), (element: Element) => {
                    const innerHTML = element.innerHTML;

                    if (!trData[obj]) trData[obj] = {};
                    trData[obj].place = innerHTML.substring(26) || "N/A";
                    obj += 1;
                });

                obj = 0;
                Array.prototype.forEach.call(trDOM.window.document.getElementsByClassName("checkpoint-date"), (element: Element) => {
                    const innerHTML = element.innerHTML;

                    if (!trData[obj]) trData[obj] = {};
                    trData[obj].date = innerHTML.substring(27).split(', ')[1] || "N/A";
                    obj += 1;
                });

                obj = 0;
                Array.prototype.forEach.call(trDOM.window.document.getElementsByClassName("checkpoint-time"), (element: Element) => {
                    const innerHTML = element.innerHTML;

                    if (!trData[obj]) trData[obj] = {};
                    trData[obj].time = innerHTML.substring(21) || "N/A";
                    obj += 1;
                });

                if (Object.keys(trData).length < 1)
                    reject({status: "No results were provided by the selected courier service!"});

                resolve(Object.values(trData));
            }).catch(() => reject({status: "Invalid tracking code!"}));
        });
    }
}

export class Speedex implements CourierClass<CourierData> {
    get(tracking: string): Promise<CourierData[]> {
        return new Promise((resolve, reject) => {
            Axios.request({
                method: "GET",
                url: `http://www.speedex.gr/speedex/NewTrackAndTrace.aspx?number=${tracking}`
            }).then((result) => {
                const DOM = new JSDOM(result.data, {
                    url: "http://www.speedex.gr"
                });

                const cards = DOM.window.document;
                let number = 0, obj = 0, trData: TrackingData = {}, stData: string[] = [];

                Array.prototype.forEach.call(cards.getElementsByClassName("card-title"), (element: Element) => {
                    const innerHtml = element.innerHTML;

                    if (innerHtml.includes("<p>"))
                        stData.push(`Η ΑΠΟΣΤΟΛΗ ΠΑΡΑΛΗΦΘΗ ΑΠΟ: ${element.innerHTML.split(': ')[1]}`);
                    else stData.push(element.innerHTML);
                });

                Array.prototype.forEach.call(cards.getElementsByClassName("card-subtitle"), (element: Element) => {
                    if (!trData[obj]) trData[obj] = {};

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

export class EasyMail implements CourierClass<CourierData> {
    get(tracking: string): Promise<any> {
        return new Promise((resolve, reject) => {
            Axios.request({
                method: "GET",
                url: `https://trackntrace.easymail.gr/${tracking}`
            }).then((result) => {
                const DOM = new JSDOM(result.data);
                let number = 0, obj = 0, trData: TrackingData = {};

                const table = DOM.window.document.getElementsByClassName("table-hover");
                Array.prototype.forEach.call(table, (element: Element) => {
                    Array.prototype.forEach.call(element.getElementsByTagName("td"), (item: HTMLTableElement) => {
                        if (!trData[obj]) trData[obj] = {};
                        if (item.innerHTML.includes("/")) {
                            if (!item.innerHTML.includes("<a")) {
                                trData[obj].date = item.innerHTML.split(" ")[0];
                                trData[obj].time = item.innerHTML.split(" ")[1]
                                  .substring(0, item.innerHTML.split(" ")[1].length - 3);
                            }
                        }
                        else if (item.innerHTML === item.innerHTML.toUpperCase())
                            trData[obj].place = item.innerHTML.toUpperCase();
                        else trData[obj].status = item.innerHTML;

                        number += 1;
                        if (number === 3) {
                            number = 0;
                            obj += 1;
                        }
                    });
                });

                if (Object.keys(trData).length < 1)
                    reject({status: "No result"});

                resolve(Object.values(trData).reverse().pop());
            }).catch(reject);
        });
    }
}
