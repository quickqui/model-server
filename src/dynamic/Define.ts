import * as _ from "lodash";

import * as fs from "fs";
import * as yaml from "js-yaml";
import { resolve } from "../Resolve";
import { ModelDefine, modelDefineRuntimeType } from "@quick-qui/model-core";

import { checkRuntimeType } from "../util/checkRuntimeType";

export const dynamicDefineFilePattern: string = "**/**.define.yml";

export async function dynamicDefine(
  filePath: string,
  repositoryBase: string
): Promise<ModelDefine[]> {
  if (filePath.endsWith(".yml")) {
    const fModelSource = fs.readFileSync(filePath).toString();
    const obj = yaml.safeLoad(fModelSource);
    //TODO any是否可以进行限制？
    return Promise.all(obj.defines.map(o => forOne(o, repositoryBase)));
  } else {
    throw new Error("only .yml file supported");
  }
}
async function forOne(obj: any, baseDir: string): Promise<ModelDefine> {
  const extendObj: any = await resolve(obj.extend, baseDir);
  if (extendObj) {
    const re = {
      name: obj.name,
      filePattern: obj.filePattern,
      ...extendObj
    };
    return checkRuntimeType(re, modelDefineRuntimeType, obj.name);
  }
  throw new Error("can not resolve");
}
