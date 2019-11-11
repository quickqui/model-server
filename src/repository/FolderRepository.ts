import { ModelRepository } from "../model/ModelRepository";

import * as yaml from "js-yaml";

import * as fs from "fs";
import * as path from "path";
import * as readdir from "recursive-readdir";
import * as minimatch from "minimatch";

import { ModelSource } from "../source/ModelSource";
import * as R from "ramda";
import { ModelFile } from "../source/ModelFile";
import { checkRuntimeType } from "../util/checkRuntimeType";
import * as t from "io-ts";

export class FolderRepository implements ModelRepository {
  source!: ModelSource;

  static async findFiles(
    base: string
  ): Promise<{ modelFiles: string[]; includeFiles: string[] }> {
    const modelFiles: string[] = [];
    const includeFiles: string[] = [];
    const abstractBase = base.startsWith("/")
      ? base
      : process.cwd() + "/" + base;
    const files = await readdir(abstractBase);
    files.forEach(file => {
      if (
        minimatch(file, "**/*.include.*") ||
        minimatch(file, "**/include.*")
      ) {
        includeFiles.push(file);
      } else {
        modelFiles.push(file);
        //! define file包括在files里面。
      }
    });
    return { modelFiles, includeFiles };
  }

  constructor(base: string, source: ModelSource) {
    if (R.isNil(source)) {
      throw new Error("Cannot be called directly");
    }
    this.source = source;
  }

  static async build(
    base: string,
    description?: string,
    name?: string
  ): Promise<ModelRepository> {
    const { modelFiles, includeFiles } = await FolderRepository.findFiles(base);

    const models: ModelFile[] = modelFiles.map(fPath => {
      if (fPath.endsWith(".yml") || fPath.endsWith(".yaml")) {
        const fModelSource = fs.readFileSync(fPath).toString();
        return {
          //TODO 如果必要，区分path和filename，比如要搞命名空间的时候，需要相对路径
          fileName: fPath,
          path: fPath,
          repositoryBase: base,
          modelObject: yaml.safeLoad(fModelSource)
        } as ModelFile;
      } else {
        throw new Error(`not support file type - ${fPath}`);
      }
    });

    const includeRuntimeType = t.type({
      //TODO 这里
    });

    const includes = includeFiles
      .map(fPath => {
        const obj = yaml.safeLoad(fs.readFileSync(fPath).toString());
        return checkRuntimeType(obj, includeRuntimeType, fPath)["includes"];
      })
      .flat();

    return new FolderRepository(base, {
      name: name || path.basename(base),
      description: description || `folder source - ${base}`,
      files: models,
      includes,
      includeSources: []
    });
  }
}
