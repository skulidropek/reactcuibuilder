declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

declare namespace __WebpackModuleApi {
  interface RequireContext {
    (id: string): any;
    keys(): string[];
    resolve(id: string): string;
    id: string;
  }
}

declare const require: {
  context: (path: string, deep?: boolean, filter?: RegExp) => __WebpackModuleApi.RequireContext;
};
