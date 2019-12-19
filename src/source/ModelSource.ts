import { ModelFile } from "./ModelFile";
import { ValidateError } from "@quick-qui/model-core";
import * as t from "io-ts";

/**
 *TODO 可以简化配置 目前唯一模式： includes: - '@quick-qui/model-defines/model', 
  或者不要显试的‘model‘，model作为一个魔数，或者作为一个配置写到package.json里面。
  - protocol: library
    resource:
      type: npm # package.json里面要定义
      module: "@quick-qui/model-defines"
      dir: "model"
 */

export interface Location {
  protocol: string;
  resource: any;
}
export const includeRuntimeType = t.type({
  includes: t.array(
    t.type({
      protocol: t.string,
      resource: t.any
    })
  )
});
export interface ModelSource {
  name: string;
  description: string;
  files: ModelFile[];
  includes: Location[];
  includeSources: ModelSource[];
}

export interface ModelSourceValidator {
  validate(modelSources: ModelSource[]): ValidateError[];
}
