import _ from "lodash";

import * as fs from "fs";
import * as yaml from "js-yaml";
import { resolve } from "../Resolve";
import { ModelDefine, modelDefineRuntimeType } from "@quick-qui/model-core";

import { checkRuntimeType } from "../util/checkRuntimeType";
import * as path from "path";
import { bySchema } from "./DefineValidator";

export const REF_INTERNAL = "internal";
export const REF_RESOLVE = "resolve";
export const REF_REST = "rest";
export const REF_PROVIDED = "provided";
export type Ref = string;
export interface RefObject {
  protocol: string | undefined;
  path: string;
}
export function parseRef(ref: Ref): RefObject {
  const parts = ref.split(":");
  if (parts.length === 1) {
    return { protocol: undefined, path: parts[0] };
  }
  if (parts.length === 2) {
    return { protocol: parts[0], path: parts[1] };
  } else {
    throw new Error(`not supported ref format: ${ref}`);
  }
}

export interface Define {
  define: Ref;
  name: string;
  filePattern: string;
}

export const dynamicDefineFilePattern: string = "**/**.define.yml";

export async function dynamicDefine(
  filePath: string,
  repositoryBase: string
): Promise<ModelDefine[]> {
  if (filePath.endsWith(".yml")) {
    const fModelSource = fs
      .readFileSync(path.join(repositoryBase, filePath))
      .toString();
    const obj: any = yaml.load(fModelSource);
    if (!obj.defines || (obj.defines && !_(obj.defines).isArray())) {
      throw new Error(`define file is not correct - ${filePath}`);
    } else {
      const re = bySchema(obj.defines);
      if (re.length !== 0) {
        throw new Error(`define file is not correct -  ${JSON.stringify(re)}`);
      }
    }
    return Promise.all(
      obj.defines?.map((o: Define) => forOne(o, repositoryBase)) ?? []
    );
  } else {
    throw new Error("only .yml file supported");
  }
}
async function forOne(obj: Define, baseDir: string): Promise<ModelDefine> {
  const ref = obj.define;
  const refObj = parseRef(ref);
  let extendObj: any;
  if (refObj?.protocol === REF_RESOLVE) {
    extendObj = await resolve(refObj.path!, baseDir);
  }
  if (extendObj) {
    const re = {
      name: obj.name,
      filePattern: obj.filePattern,
      ...extendObj,
    };
    return checkRuntimeType(re, modelDefineRuntimeType, obj.name);
  }
  throw new Error(`can not find ref - ${ref}`);
}
