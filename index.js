const axios = require("axios");
const jsdom = require("jsdom");

class elta {
    get(tr) {
        return new Promise((resolve, reject) => {
            axios.post("https://www.elta-courier.gr/track.php", `number=${tr}`)
                .then((results) => {
                    const data = results.data;
                    let array = data.result[tr].result;
                    if (!(data.status === 1) || data.result[tr].status === 2 || array === "wrong number") reject({ "status": "no result" });
                    resolve(array);
                }).catch((err) => {
                    reject(err);
                });
        });
    }
}

class geniki {
    get(tr) {
        return new Promise(async(resolve, reject) => {
            const { JSDOM } = jsdom;
            const data = await axios.get(`https://www.taxydromiki.com/track/${tr}`);
            const dom = new JSDOM(data.data, { url: 'https://www.taxydromiki.com' });
            const trDOM = new JSDOM(dom.window.document.getElementById('edit-content').innerHTML);
            let number = 0;
            let obj = 0;
            let trData = {};

            Array.prototype.forEach.call(trDOM.window.document.getElementsByTagName('div'), (e) => {

                //! All credits due to @Tougrel (https://github.com/tougrel)
                if (e.innerHTML.startsWith('<div')) return;

                if (!trData[obj]) trData[obj] = {};
                if (e.innerHTML.includes('Κατάσταση')) trData[obj].status = e.innerHTML.substring(26);
                if (e.innerHTML.includes('Τοποθεσία')) trData[obj].place = e.innerHTML.substring(26);
                if (e.innerHTML.includes('Ημερομηνία')) trData[obj].date = (e.innerHTML.substring(27).split(', ')[1]);
                if (e.innerHTML.includes('Ώρα')) trData[obj].time = e.innerHTML.substring(20);

                number += 1;
                if (number == 4) {
                    number = 0;
                    obj += 1;
                }
            })
            if (Object.keys(trData).length <= 1) reject({ "status": "no result" });
            let array = Object.values(trData);
            resolve(array);
        })
    }
}

class speedex {
    get(tr) {
        return new Promise(async(resolve, reject) => {
            const { JSDOM } = jsdom;
            const data = await axios.get(`http://www.speedex.gr/speedex/NewTrackAndTrace.aspx?number=${tr}`);
            if (data.data.includes('Δεν βρέθηκαν')) reject({ "status": "no result" })
            const dom = new JSDOM(data.data, { url: 'http://www.speedex.gr' });
            let number = 0;
            let obj = 0;
            let trData = {};
            let stData = [];

            //! Get status
            Array.prototype.forEach.call(dom.window.document.getElementsByClassName('card-title'), (e) => {
                if (e.innerHTML.includes('<p>')) {
                    stData.push(`Η ΑΠΟΣΤΟΛΗ ΠΑΡΑΛΗΦΘΗ ΑΠΟ: ${e.innerHTML.split(': ')[1]}`);
                } else {
                    stData.push(e.innerHTML);
                }
            })

            //! Get place, time and date
            Array.prototype.forEach.call(dom.window.document.getElementsByClassName('card-subtitle'), (e) => {
                if (!trData[obj]) trData[obj] = {};
                let desc = e.innerHTML.trim().split('>')[1];

                trData[obj].status = stData[obj];
                trData[obj].place = desc.substring(0, desc.length - 6).split(',')[0];
                trData[obj].date = desc.substring(0, desc.length - 6).split(',')[1].split(' ')[1];
                trData[obj].time = desc.substring(0, desc.length - 6).split(',')[1].split(' ')[3];

                number += 1;
                if (number == 1) {
                    number = 0;
                    obj += 1;
                }
            })
            let array = Object.values(trData);
            resolve(array);
        })
    }
}

class acs {
    get(tr) {
        return new Promise(async(resolve, reject) => {
            const res = await axios.get(`https://api.acscourier.net/api/parcels/search/${tr}`, {headers: {'accept-language': 'el', 'X-Country': 'GR'}});
            const data = JSON.parse(JSON.stringify(res.data.items[0].statusHistory));
            let obj = 0;
            let trData = {};

            data.forEach((e) => {
                if (!trData[obj]) trData[obj] = {};

                trData[obj].status = e.description;
                trData[obj].place = e.controlPoint;
                trData[obj].date = e.controlPointDate.split("T")[0];
                trData[obj].time = e.controlPointDate.split("T")[1].split('.')[0];

                obj += 1;

                // 2021-07-19 T 10:16:25.2
            })
            console.log(Object.values(trData));
        })
    }
}

class easymail {
    get(tr) {
        return new Promise(async(resolve, reject) => {
            const data = await axios.get(`https://trackntrace.easymail.gr/${tr}`);
            const { JSDOM } = jsdom;
            const response = data.data;
            const dom = new JSDOM(response);
            let number = 0;
            let obj = 0;
            let trData = {};

            Array.prototype.forEach.call(dom.window.document.getElementsByClassName('table-hover'), (e) => {
                Array.prototype.forEach.call(e.getElementsByTagName('td'), (a) => {
                    if (!trData[obj]) trData[obj] = {};
                    if (a.innerHTML.includes('/')) {
                        if (a.innerHTML.includes('<a')) return;
                        trData[obj].date = a.innerHTML.split('  ')[0];
                        trData[obj].time = a.innerHTML.split('  ')[1].substring(0, a.innerHTML.split('  ')[1].length - 3);
                    } else if (a.innerHTML == a.innerHTML.toUpperCase()) {
                        trData[obj].place = a.innerHTML.toUpperCase();
                    } else trData[obj].status = a.innerHTML;

                    number += 1;
                    if (number == 3) {
                        number = 0;
                        obj += 1;
                    }
                })
                if (Object.keys(trData).length < 1) reject({ "status": "no result" });
                let array = Object.values(trData);
                array.reverse();
                array.pop();
                resolve(array);
            })
        })
    }
}

module.exports = { elta, geniki, speedex, acs, easymail };