# courier-api
Node.js module that interfaces with Greek courier companies.

## Current supported couriers
- ΕΛΤΑ Courier (elta-courier.gr)
- ACS Courier (acscourier.net)
- Γενική Ταχυδρομική (taxydromiki.com)
- Speedex (speedex.com)
- EasyMail (easymail.gr)
- DHL (dhl.com)
- ..and more to come!

## Usage example
`npm i courier-api`
```js
const speedex = new(require("courier-api").speedex);
const geniki = new(require("courier-api").geniki);
const easymail = new(require("courier-api").easymail);
const elta = new(require("courier-api").elta);
const acs = new(require("courier-api").acs);
const dhl = new(require("courier-api").dhl);
const speedpak = new(require("courier-api").speedpak);


(async () => {
    await elta.get("TRACK_ID")
        .then((r) => console.log(r))
        .catch((e) => console.error(e));

    await geniki.get('TRACK_ID')
        .then((r) => console.log(r))
        .catch((e) => console.log(e));

    await speedex.get('TRACK_ID')
        .then((r) => console.log(r))
        .catch((e) => console.error(e));

    await acs.get('TRACK_ID')
        .then((r) => console.log(r))
        .catch((e) => console.error(e));

    await easymail.get('TRACK_ID')
        .then((r) => console.log(r))
        .catch((e) => console.error(e));

    await dhl.get('TRACK_ID')
        .then((r) => console.log(r))
        .catch((e) => console.error(e));

    await speedpak.get('TRACK_ID')
        .then((r) => console.log(r))
        .catch((e) => console.error(e));
});
```
or
```js
const { geniki, speedex, elta, acs, easymail, dhl, speedpak } = require('courier-api');
(async () => {
    await new elta().get('TRACK_ID')
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
        
    await new geniki().get('TRACK_ID')
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
        
    await new speedex().get('TRACK_ID')
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
        
    await new acs().get('TRACK_ID')
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
        
    await new easymail().get('TRACK_ID')
        .then((result) => console.log(result))
        .catch((error) => console.error(error));

    await new dhl().get('TRACK_ID')
        .then((result) => console.log(result))
        .catch((error) => console.error(error));

    await new speedpak().get('TRACK_ID')
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
})();
```
