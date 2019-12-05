import { FolderRepository } from "../repository/FolderRepository";
import { ModelRepository } from "./ModelRepository";
import { ModelSource, ModelSourceValidator } from "../source/ModelSource";
import { Location } from "../source/ModelSource";
import { LibraryRepository } from "../repository/LibraryRepository";
import * as _ from "lodash";
import { dynamicDefineFilePattern, dynamicDefine } from "../dynamic/Define";
import * as minimatch from "minimatch";
import { ModelFile } from "../source/ModelFile";

import {
  ModelDefine,
  Model,
  ModelWeaver,
  Log
} from "@quick-qui/model-core";
import { VLogError } from "../util/VLogError";

export class ModelManager {
  private defines: ModelDefine[] = [];
  private main: Location;
  private model: Promise<Model> | undefined = undefined;
  private modelSources: Promise<ModelSource[]> | undefined = undefined;
  private originalModel: Promise<Model> | undefined = undefined;
  private woveModel: Promise<Model> | undefined = undefined;
  private buildLogs: Log[] = [];
  //TODO source validation暂时没有用，是否有必要？
  private sourceValidators: ModelSourceValidator[] = [];
  constructor(main: Location) {
    this.main = main;
  }

  //! model 处理的几个阶段 -
  /*
        1. 处理include，所有文件展开，包括可能不认识的。
        1. 处理defines //因为defines可能以include定义
        2. 从所有文件中获取, 
            2.1 validate piece
            2.2 merge
        3. validation第一次
        4. wave
        5. validate第二次
    */

  async getSource(): Promise<ModelSource[]> {
    if (!this.modelSources) {
      const builded: ModelSource[] = await this.build(this.main);
      const errs = this.sourceValidators.map(_ => _.validate(builded)).flat();
      if (errs.length != 0) {
        throw new VLogError("validate source failed", errs);
      }
      this.modelSources = Promise.resolve(builded);
    }
    return this.modelSources!;
  }

  emptyModel: Model = {
    type: "model"
  };

  async getOriginalModel(): Promise<Model> {
    if (!this.originalModel) {
      const sources: ModelSource[] = await this.getSource();
      let model = this.emptyModel;
      //find defines
      const defineFiles: ModelFile[] = sources
        .map(modelSource => {
          return modelSource.files.filter(file => {
            return minimatch(file.path, dynamicDefineFilePattern);
          });
        })
        .flat();

      const dynamicDefines: ModelDefine[] = (
        await Promise.all(
          defineFiles.map(async file =>
            Promise.all(await dynamicDefine(file.fileName, file.repositoryBase))
          )
        )
      ).flat();

      dynamicDefines.forEach((d: ModelDefine) => this.defines.push(d));

      //merge
      sources.forEach(modelSource =>
        modelSource.files.forEach(file => {
          const define = this.defines.find((def: ModelDefine) => {
            return minimatch(file.fileName, def.filePattern);
          });
          if (define) {
            const piece = file.modelObject;
            const errors = define.validatePiece(model, piece);
            if (errors.length != 0) {
              throw new VLogError("validate piece failed", errors);
            } else {
              model = define.merge(model, piece);
            }
          } else if (minimatch(file.fileName, dynamicDefineFilePattern)) {
            //do nothing
          } else {
            throw new Error(`no define find - ${file.fileName}`);
          }
        })
      );
      //validate after merge
      const validateAfterMerge = this.defines
        .map(def => {
          return def.validateAfterMerge(model);
        })
        .flat();
      if (validateAfterMerge.length !== 0) {
        throw new VLogError("validate after merge failed", validateAfterMerge);
      }

      this.originalModel = Promise.resolve(model);
    }
    return this.originalModel!;
  }

  async getWovenModel(): Promise<Model> {
    if (!this.woveModel) {
      const originalModel = await this.getOriginalModel();

      //weave
      let model = originalModel;
      const weavers = this.defines.map(d => d.weavers).flat();
      const sortedWeavers: ModelWeaver[] = _.sortBy(weavers, weaver => {
        return weaver.order ?? 0;
      });
      sortedWeavers.forEach(weaver => {
        const [mo, log] = weaver.weave(model);
        this.buildLogs = this.buildLogs.concat(log);
        model = mo;
      });
      //validate after weave

      const validateAfterWeave = this.defines
        .map(def => {
          return def.validateAfterWeave(model);
        })
        .flat();
      if (validateAfterWeave.length != 0) {
        throw new VLogError("validate after weave failed", validateAfterWeave);
      }
      this.woveModel = Promise.resolve(model);
    }
    return this.woveModel!;
  }

  async getModel(): Promise<Model> {
    if (!this.model) {
      try {
        const woven = await this.getWovenModel();
        this.model = Promise.resolve(woven);
      } catch (err) {
        if (err instanceof VLogError) {
          this.buildLogs = this.buildLogs.concat(err.logs);
        } else {
          throw err;
        }
      }
    }
    return this.model!;
  }

  getBuildLogs(): Log[] {
    return this.buildLogs;
  }

  refresh() {
    this.modelSources = undefined;
    this.originalModel = undefined;
    this.woveModel = undefined;
    this.buildLogs = [];
    this.model = undefined;
  }

  private async build(location: Location): Promise<ModelSource[]> {
    const repository = await this.resolve(location);
    const includes: Location[] = repository.source.includes;
    const includeModel: ModelSource[][] = await Promise.all(
      includes.map(include => this.build(include))
    );
    const modelSource = repository.source;
    modelSource.includeSources = includeModel.map(_ => _[0]);
    return includeModel.reduce((a, b) => a.concat(b), [modelSource]); //第一个source是自己，后面的source是include的
  }

  private resolve(location: Location): Promise<ModelRepository> {
    if (location.protocol === "folder") {
      return FolderRepository.build(location.resource);
    }

    if (location.protocol === "library") {
      return LibraryRepository.build(location.resource);
    }
    throw new Error(
      "Location not supported (yet)- " + JSON.stringify(location)
    );
  }
}
