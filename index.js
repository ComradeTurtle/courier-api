const axios = require("axios");
const jsdom = require("jsdom");

class elta {
    get(tr) {
        return new Promise((resolve, reject) => {
            axios.post("https://www.elta-courier.gr/track.php", `number=${tr}`)
                .then((results) => {
                    const data = results.data;
                    let array = data.result[tr].result;

                    if (!(data.status === 1)) reject(null);
                    if (data.result[tr].status === 2) reject(null);
                    if (array === "wrong number") reject('Invalid tracking number');

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
module.exports = { elta, geniki };