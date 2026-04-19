// Drop-in replacement for convex/_generated/api at runtime.
// Every property access returns a function reference tagged with the same
// `Symbol.for("functionName")` that Convex uses, so the shim can dispatch on
// call-site values without any site-level changes.

const FN_NAME = Symbol.for("functionName");

export interface FnRef {
  [FN_NAME]: string;
}

function makeModule(moduleName: string): Record<string, FnRef> {
  return new Proxy({} as Record<string, FnRef>, {
    get(_target, fnName: string) {
      return { [FN_NAME]: `${moduleName}:${fnName}` };
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const api: any = new Proxy({} as Record<string, unknown>, {
  get(_target, moduleName: string) {
    return makeModule(moduleName);
  },
});

export { FN_NAME };
