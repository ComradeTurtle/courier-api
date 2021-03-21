const axios = require("axios");
const jsdom = require("jsdom");

class elta {
    get(tr) {
        return new Promise((resolve, reject) => {
            axios.post("https://www.elta-courier.gr/track.php", `number=${tr}`)
                .then((results) => {
                    const data = results.data;
                    let array = data.result[tr].result;

                    if (!(data.status === 1)) reject({"status": "no result"});
                    if (data.result[tr].status === 2) reject({"status": "no result"});
                    if (array === "wrong number") reject({"status": "no result"});

                    resolve(array);
                }).catch((err) => {
                    reject(err);
                });
        });
    }
}

class geniki {
    get(tr) { 
        return new Promise(async (resolve, reject) => {
            const { JSDOM } = jsdom;
            const data = await axios.get(`https://www.taxydromiki.com/track/${tr}`);
            const dom = new JSDOM(data.data, {  url: 'https://www.taxydromiki.com' });    
            const trDOM = new JSDOM(dom.window.document.getElementById('edit-content').innerHTML);
            let number = 0;
            let obj = 0;
            let trData = {};

            Array.prototype.forEach.call(trDOM.window.document.getElementsByTagName('div'), (e) => {
        
                //! All credits due to @Tougrel (https://github.com/tougrel)
                if(e.innerHTML.startsWith('<div')) return;
                
                if(!trData[obj]) trData[obj] = {};
                if(e.innerHTML.includes('Κατάσταση')) trData[obj].status = e.innerHTML.substring(26);
                if(e.innerHTML.includes('Τοποθεσία')) trData[obj].place = e.innerHTML.substring(26);
                if(e.innerHTML.includes('Ημερομηνία')) trData[obj].date = e.innerHTML.substring(27);
                if(e.innerHTML.includes('Ώρα')) trData[obj].time = e.innerHTML.substring(20);
        
                number += 1;
                if(number == 4) {
                    number = 0;
                    obj += 1;
                }
            })
            if(Object.keys(trData).length <= 1) reject({"status": "no result"});
            resolve(trData);
        })
    }
}

class speedex {
    get(tr) {
        return new Promise(async (resolve, reject) => {
            const { JSDOM } = jsdom;
            const data = await axios.get(`http://www.speedex.gr/speedex/NewTrackAndTrace.aspx?number=${tr}`);
            if(data.data.includes('Δεν βρέθηκαν')) reject({"status": "no result"})
            const dom = new JSDOM(data.data, {url: 'http://www.speedex.gr'});
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
                if(!trData[obj]) trData[obj] = {};
                let desc = e.innerHTML.trim().split('>')[1];

                trData[obj].status = stData[obj];
                trData[obj].place = desc.substring(0, desc.length - 6).split(',')[0];
                trData[obj].date = desc.substring(0, desc.length - 6).split(',')[1].split(' ')[1];
                trData[obj].time = desc.substring(0, desc.length - 6).split(',')[1].split(' ')[3];

                number += 1;
                if(number == 1) {
                    number = 0;
                    obj += 1;
                }
            })
            resolve(trData);
        })
    }
}

module.exports = { elta, geniki, speedex };