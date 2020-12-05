import { ModelManager } from "./model/ModelManager";
import { env } from "./Env";

const multipleModels: Map<string, ManagerCell> = new Map<string, ManagerCell>();

const modelProjectDir = env.modelProjectDir;
const defaultModelManager = new ModelManager({
  protocol: "folder",
  resource: modelProjectDir + "/model"
},modelProjectDir);

export function getManagers(): ManagerCell[] {
  return Array.from(multipleModels.values());
}

export function getManager(name: string): ModelManager | undefined {
  return multipleModels.get(name)?.manager;
}
export class ManagerCell {
  manager: ModelManager;
  name: string;
  id: string;
  constructor(manager: ModelManager, name: string, id: string | undefined) {
    this.manager = manager;
    this.name = name;
    this.id = id ?? name;
  }
}

setManager(defaultModelManager, "default");

function setManager(manager: ModelManager, name: string) {
  multipleModels.set(name, new ManagerCell(manager, name, undefined));
}
