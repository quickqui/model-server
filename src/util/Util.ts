
import { logging } from "@quick-qui/util";


export function no(name: string) {
  throw new Error(`env not found - ${name}`);
}


export const log = logging("quick-qui:model-server");



