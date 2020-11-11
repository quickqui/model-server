import { ValidateError } from "@quick-qui/model-core";
import * as t from "io-ts";
import { ModelFile, fileToDTO } from "./ModelFile";

/**
 *TODO 可以简化配置 目前唯一模式： includes: - '@quick-qui/model-defines/model', 
  或者不要显试的‘model‘，model作为一个魔数，或者作为一个配置写到package.json里面。
  - protocol: library
    resource:
      type: npm # package.json里面要定义
      module: "@quick-qui/model-defines"
      dir: "model"
 */
/**
 * TODO 还可以来个自动扫描，把node-modules的第一层扫一遍，找到所有的？
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
export function toDTO(source: ModelSource) {
  return {
    name: source.name,
    description: source.description,
    files: source.files.map(fileToDTO),
    includeSources: source.includeSources.map(toDTO)
  };
}

export interface ModelSourceValidator {
  validate(modelSources: ModelSource[]): ValidateError[];
}
