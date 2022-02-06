export function defaultKey(...args: any[]) {
  return args.map((item) => JSON.stringify(item)).join(",");
}
