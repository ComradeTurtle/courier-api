# courier-api

Node.js module that interfaces with Greek courier companies.

## Current supported couriers

- ΕΛΤΑ Courier ([website](elta-courier.gr))
- ACS Courier ([website](acscourier.net))
- Γενική Ταχυδρομική ([website](taxydromiki.com))
- Speedex ([website](speedex.com))
- EasyMail ([website](easymail.gr))
- DHL ([website](dhl.com))
- SpeedPAK Standard / Economy ([website](https://www.orangeconnex.com/))
- ..and more to come!

## Install

> `npm i courier-api`or `yarn add courier-api`

## Usage example

```js
const DHL = new (require("courier-api").speedex);
// or
const {DHL} = require("courier-api");
// It's the same for the other supported couriers

DHL.get("TRACK_ID").then((response) => {
	/* your code here */
}).catch(console.error);
// or
(async () => {
	const data = await DHL.get("TRACK_ID");
	/* your code here */
})();

// same goes for the other couriers!
```
