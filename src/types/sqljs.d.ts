declare module "sql.js" {
  export interface Database {
    run(sql: string, params?: any[]): void;
    prepare(sql: string): any;
    export(): Uint8Array;
    close(): void;
  }

  export interface SqlJsStatic {
    Database: new (bytes?: Uint8Array) => Database;
  }

  const initSqlJs: (options?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>;
  export default initSqlJs;
}

declare module "sql.js/dist/sql-wasm.wasm?url" {
  const wasmURL: string;
  export default wasmURL;
}
