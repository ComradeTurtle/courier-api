# courier-api
Node.js module that interfaces with Greek courier companies.

## Current supported couriers
- ΕΛΤΑ Courier (elta-courier.gr)
- ACS Courier (acscourier.net)
- Γενική Ταχυδρομική (taxydromiki.com)
- Speedex (speedex.com)
- EasyMail (easymail.gr)
- ..and more to come!

## Usage example
`npm i courier-api`
```js
const speedex = new(require("courier-api").speedex);
const geniki = new(require("courier-api").geniki);
const easymail = new(require("courier-api").acs);
const elta = new(require("courier-api").elta);
const acs = new(require("courier-api").acs);


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
});
```
or
```js
const { geniki, speedex, elta, acs, easymail } = require('courier-api');
(async () => {
    await new elta().get('TRACK_ID')
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
        
    await new geneki().get('TRACK_ID')
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
        
    await new speedex().get('TRACK_ID')
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
        
    await new acs().get('TRACK_ID')
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
})();
```
