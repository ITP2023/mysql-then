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

  // /**
  //  * 
  //  * @param {string[]} col_arr 
  //  * @returns 
  //  */
  // static select(col_arr) {
  //   return new SelectStatementTemplate(col_arr);
  // }
}


// class SelectStatementTemplate {
//   execute_str = "SELECT ";
//   col_arr = [];
//   from = "";
//   cond_arr = [];
//   /**
//    * 
//    * @param {string[] | undefined} col_arr 
//    */
//   constructor(col_arr) {
//     this.col_arr = this.col_arr ? this.col_arr : ["*"];
//     this.execute_str = "SELECT ";
//     this.from = "";
//   }

//   /**
//    * table or expression
//    * @param {string} source 
//    */
//   from(source) {
//     this.fromTable = source;
//     return this;
//   }
  
//   /**
//    * @param {[string, string, string]} condition
//    */
//   where(condition) {
//     this.cond_arr.push(condition);
//     return this;
//   }

//   finish() {
//     if (this.cond_arr.length <= 0) {
//       return this.execute_str + ";";
//     }
//     this.execute_str += " WHERE ";
//     for (const cond of this.cond_arr) {
//       this.execute_str += (cond.join(" ") + ",");
//     }
//     this.execute_str = this.execute_str.slice(0, this.execute_str.length - 1);
//     return this.execute_str + ";";
//   }
// }

class StatementFormatError extends Error {
  constructor() {
    this.message = "Incorrect Statement formation (Bad format)";
    this.name = "[StatementFormatError]";
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
    console.log("eval_stmt = ", eval_stmt);
    if (eval_stmt.length > 3) {
      throw new StatementFormatError();
    }
    this.cond_arr = eval_stmt
    return this.parent_caller;
  }

  finish() {
    if (this.cond_arr.length !== 0) {
      console.log("cond_arr = ", this.cond_arr.size);
      this.execute_str += " WHERE ";
      console.log("@finish() -> cond_arr = ", this.cond_arr);
      for (let i = 0; i < this.cond_arr.length; i++) {
        this.execute_str += (this.cond_arr[i].join(" ") + ",");
        console.log("cond_array[i].join(\" \") = ", this.cond_arr[i].join(" "));
      }
      console.log("@finish(): execute_str = ", this.execute_str);
      this.execute_str = this.execute_str.slice(0, this.execute_str.length - 1);
    }
    return this.execute_str + ";";
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
    super(null, "", []);
    this.parent_caller = this;
    this.tableName = tableName;
  }

  /**
   * 
   * @param {string[]} col_arr 
   * @returns {ColumnActor}
   */
  onColumns(col_arr) {
    return new ColumnActor("", col_arr, this.cond_arr, this);
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
    super(null, execute_str, cond_array);
    this.parent_caller = this;
    this.execute_str = execute_str;
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