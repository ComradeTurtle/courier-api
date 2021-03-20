const axios = require("axios");

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

module.exports = { elta };