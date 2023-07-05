const mysql = require("mysql");
const util = require("util");





class QueryBuilder {
  /**
   * 
   * @param {string} dbName 
   * @returns {DatabaseActor}
   */
  static onDB(dbName) {
    return new DatabaseActor();
  }
}

class StatementFormatError extends Error {
  constructor() {
    this.message = "Incorrect Statement formation (Bad format)";
    this.name = "[StatementFormatError]";
  }
}

class DatabaseActor {

  databaseRef = "";
  constructor() {
    this.databaseRef = "";
  }
  
  /**
    * perform actions on a table
    * @param {string} table_name
    * @returns {TableActions}
  */
  onTable(tableName) {
    return new TableActor(tableName);
  }

}

class TableActor extends WhereStatement {

  execute_str = "";
  /**
   * @type {string}
   */
  tableName = "";

  /**
   * 
   * @param {string} tableName 
   */
  constructor(tableName) {
    super(this);
    this.tableName = tableName;
  }

  /**
   * 
   * @param {string[]} col_arr 
   * @returns {ColumnActor}
   */
  onColumns(col_arr) {
    return new ColumnActor("", col_arr, [[]], this);
  }

  /**
   * 
   * @param {Record<string, string | number>} kv_map 
   */
  update(kv_map) {
// TODO
  }

  delete() {
    this.execute_str = `DELETE FROM ${this.tableName}`;
    return this;
  }

  finish() {
    if (this.cond_arr.length !== 0) {
      let where_arr = [];
      for (let i = 0; i < this.cond_arr.length; i++) {
        where_arr.push()
      }
      this.execute_str += `WHERE `
    }
    return this.execute_str + ";";
  }
}


class Conditions {
  static eq(col1, col2) {
    return [col1, "=", col2];
  }

  static le(col1, col2) {
    return [col1, "<=", col2];
  }
  static lt(col1, col2) {
    return [col1, "<", col2];
  }
  static ge(col1, col2) {
    return [col1, ">=", col2];
  }

  static gt(col1, col2) {
    return [col1, ">", col2];
  }

  static ne(col1, col2) {
    return [col1, "!=", col2];
  }
}

class Operators {
  static between(val1, val2) { return [ val1, "BETWEEN", val2 ]; }

  /**
   * 
   * @param {any[]} range 
   */
  static in(range) {
    return ["IN", "(", ...range, ")"];
  }
}



class ColumnActor extends WhereStatement {

  /**
   * @type {string}
   */
  execute_str = "";

  /**
   * @type {[string, string, string][]}
   */
  cond_array = [];
  /**
   * @type {TableActor?}
   */
  table_ref = null;

  /**
   * @type {string[]}
   */
  col_arr = [];

  /**
   * @param {string} execute_str
   * @param {[string, string, string][]} cond_array 
   * @param {TableActor} tableRef
   * @param {string[]} col_arr
   */
  constructor(execute_str, col_arr, cond_array, tableRef) {
    super(this);
    this.execute_str = execute_str;
    this.cond_array = cond_array;
    this.table_ref = tableRef;
    this.col_arr = col_arr;
  }

  select() {
    if (this.col_arr.length === 1) {
      if (this.col_arr[0] !== "*") {
        throw new StatementFormatError();
      }
      this.execute_str = `SELECT * FROM ${this.table_ref.tableName}`;
    }
    this.execute_str = `SELECT ${this.col_arr.toString()} FROM ${this.table_ref.tableName}`;
    return this;
  }

  /**
   * 
   * @param {Record<string, unknown>[]} row_data 
   */
  insert(row_data) {
    this.execute_str = `INSERT INTO ${this.table_ref.tableName}(${this.col_arr.toString()}) VALUES `;
    for (let i = 0; i < row_data.length; i++) {
      let value_arr = [];
      for (const k of Object.keys(row_data[i])) {
        if (this.col_arr.includes(k)) {
          if (row_data[i][k].constructor === Object) {
            throw new Error("Objects not allowed in INSERT(s) for now...");
          }
          if (row_data[i][k].constructor === String) {
            value_arr.push(`"${row_data[i][k]}"`);
          }
          else value_arr.push(row_data[i][k]);
        }
      }
      this.execute_str += `(${value_arr.toString()})`;
    }
    return this;
  }

  /**
   * 
   * @param {string} keyword 
   */
  as(keyword) {
    this.execute_str = `(${this.execute_str}) AS ${keyword}`;
  }

  
  finish() {
    if (this.cond_array.length !== 0) {
      
    }
    return this.execute_str;
  }
  
  
}
class WhereStatement {

  parent_caller = null;
  execute_str = "";
  cond_arr = [];
  constructor(parent_caller, execute_str, cond_array) {
    this.parent_caller = parent_caller;
    this.execute_str = execute_str;
    this.cond_arr = cond_array;
  }
  /**
   * 
   * @param {[string, string, string][]} eval_stmt
   * @returns 
   */
  where(...eval_stmt) {
    if (eval_stmt.length > 3) {
      throw new StatementFormatError();
    }
    this.cond_array.push(...eval_stmt);
    return this.parent_caller;
  }

}


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
  },
  QueryBuilder,
  StatementFormatError,
  Conditions,
  Operators
}