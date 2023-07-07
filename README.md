# mysql-then

_After `mysql` came `mysql-then`_

## How does it help you?

- Modern JS server stacks are asynchronous. So, it only makes sense for `mysql` to be asynchronous.

- SQL libs rely on string queries which may be tiresome to work with if you have long queries that perform complex operations. Readbility is also reduced in this case.

Enter `mysql-then`, which at it's core is designed to asynchronize MySQL communication.

In order to make queries more closer to  JavaScript, you can use the provided `QueryBuilder` or stick to stringified queries. **The choice is completely yours to make.**

## Usage

```javascript
const mysqli = require("mysql-then");

const connection = mysqli.createConnection({
  host: "...",
  port: "...",
  password: "...",
  user: "..."
});

(async () => {
  await connection.connect();
  const rows = await connection.query("SELECT 'fun';");
  console.log(rows[0].fun); // 'fun'
  await connection.end();
})();
```
using `QueryBuilder`

```javascript
const q = QueryBuilder.onDB("test")
.onTable("Customers")
.onColumns([ "Customer_id" ])
.select()
.where(
  Conditions.eq("Customer_id", 3005)
)
.finish();

...

await connection.query(q);


```
## Anything more?
- A proposed type system is still to be worked out.
- make helper functions to do more with the results than just expose them.