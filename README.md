# courier-api
Node.js module that interfaces with Greek courier companies.

## Current supported couriers
- ΕΛΤΑ Courier (elta-courier.gr)
- ACS Courier (acscourier.net)
- Γενική Ταχυδρομική (taxydromiki.com)
- Speedex (speedex.com)
- ..and more to come!

## Usage example
`npm i courier-api`
```js
const geniki = new(require("courier-api").geniki);
const speedex = new(require("courier-api").speedex);
const elta = new(require("courier-api").elta);
const acs = new(require("courier-api").acs);

let init = async() => {
    await elta.get("PD280101275GR")
        .then((r) => console.log(r))
        .catch((e) => console.error(e));

    await geniki.get('4307428974')
        .then((r) => console.log(r))
        .catch((e) => console.log(e));

    await speedex.get('700005173407')
        .then((r) => console.log(r))
        .catch((e) => console.error(e));

    await acs.get('304382607')
        .then((r) => console.log(r))
        .catch((e) => console.error(e));
}

init();
```
