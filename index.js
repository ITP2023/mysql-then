const mysql = require("mysql");
const util = require("util");


module.exports = {
  ...mysql,
  createConnection(config) {
    let c =  mysql.createConnection(config);
    c.connect = util.promisify(c.connect);
    c.query = util.promisify(c.query);
    c.ping = util.promisify(c.ping);
    c.changeUser = util.promisify(c.changeUser);
    c.beginTransaction = util.promisify(c.beginTransaction);
    c.commit = util.promisify(c.commit);
    c.rollback = util.promisify(c.rollback);
    c.statistics = util.promisify(c.statistics);
    c.end = util.promisify(c.end);
    return c;
  },
  createPool(config) {
    let p = mysql.createPool(config);
    p.acquireConnection = util.promisify(p.acquireConnection);
    p.end = util.promisify(p.end);
    p.query = util.promisify(p.query);
    return p;
  },
  createPoolCluster(config) {
    let pc = mysql.createPoolCluster(config);
    pc.getConnection = util.promisify(pc.getConnection);
    pc.end = util.promisify(pc.end);
    return pc;
  }
}