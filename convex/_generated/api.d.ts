/* eslint-disable */
// Backend migrated to lib/data. Call sites access `api` as a Proxy whose
// property access produces FN_NAME-tagged references dispatched by the data
// layer; the detailed type shape is no longer relevant at compile time.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare const api: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare const internal: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare const components: any;
