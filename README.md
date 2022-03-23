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

Using npm
- `npm install courier-api`

Using yarn
- `yarn add courier-api`

## Usage example

```js
const DHL = new (require("courier-api").DHL);
// or
const {DHL} = require("courier-api");
// It's the same for the other supported couriers

const courier = new DHL();
courier.get("TRACK_ID").then((response) => {
	/* your code here */
}).catch(console.error);
// or
(async () => {
	const data = await courier.get("TRACK_ID");
	/* your code here */
})();

// same goes for the other couriers!
```
