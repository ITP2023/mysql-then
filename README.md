# mysql-then

A tiny lib just to expose the `mysql` drivers for node.js in a promise-friendly way.

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

## Anything more?
- A proposed type system is still to be worked out.
- make helper functions to do more with the results than just expose them.