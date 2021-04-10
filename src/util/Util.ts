


export function no(name: string) {
  throw new Error(`env not found - ${name}`);
}


export const log = require("debug-logger")("quick-qui:model-server");


