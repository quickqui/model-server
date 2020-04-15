import { ModelRepository } from "../model/ModelRepository";

import * as yaml from "js-yaml";

import * as fs from "fs";
import * as path from "path";
import  readdir from "recursive-readdir";
import minimatch from "minimatch";

import { ModelSource, includeRuntimeType } from "../source/ModelSource";
import * as R from "ramda";
import { ModelFile } from "../source/ModelFile";
import { checkRuntimeType } from "../util/checkRuntimeType";
import { env } from "../Env";

export class FolderRepository implements ModelRepository {
  source!: ModelSource;

  static async findFiles(
    base: string
  ): Promise<{
    modelFiles: string[];
    includeFiles: string[];
    absoluteBase: string;
  }> {
    const modelFiles: string[] = [];
    const includeFiles: string[] = [];
    const absoluteBase = path.normalize(
      base.startsWith("/") ? base : process.cwd() + "/" + base
    );
    const files = await readdir(absoluteBase);
    files.forEach(file => {
      if (
        minimatch(file, "**/*.include.*") ||
        minimatch(file, "**/include.*")
      ) {
        includeFiles.push(file);
      } else {
        //NOTE define file包括在files里面。
        modelFiles.push(file);
      }
    });
    return { modelFiles, includeFiles, absoluteBase };
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
    const {
      modelFiles,
      includeFiles,
      absoluteBase
    } = await FolderRepository.findFiles(base);

    const models: ModelFile[] = modelFiles.map(fPath => {
      if (fPath.endsWith(".yml") || fPath.endsWith(".yaml")) {
        const fModelSource = fs.readFileSync(fPath).toString();

        return {
          fileName: path.basename(fPath),
          path: path.relative(absoluteBase, fPath),
          relativeToModelDir:path.relative(env.modelProjectDir,absoluteBase),
          repositoryBase: absoluteBase,
          modelObject: yaml.safeLoad(fModelSource)
        } as ModelFile;
      } else {
        throw new Error(`not support file type - ${fPath}`);
      }
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
