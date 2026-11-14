/**
 * Minimal ambient declarations for `node:sqlite` (DatabaseSync).
 * @types/node@20 (the version pinned in this project) does not ship sqlite
 * typings; they exist from @types/node 22.5+. Remove this file after upgrading.
 */
declare module 'node:sqlite' {
  export class StatementSync {
    run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  export interface DatabaseSyncOptions {
    open?: boolean;
    enableForeignKeyConstraints?: boolean;
    enableDoubleQuotedStringLiterals?: boolean;
    allowExtension?: boolean;
  }

  export class DatabaseSync {
    constructor(path: string, options?: DatabaseSyncOptions);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
    open(): void;
    isDeleted(): boolean;
  }
}
