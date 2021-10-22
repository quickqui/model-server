import { Log, Model, ModelDefine, ModelWeaver } from "@quick-qui/model-core";
import _ from "lodash";
import minimatch from "minimatch";
import { dynamicDefine, dynamicDefineFilePattern } from "../dynamic/Define";
import { FolderRepository } from "../repository/FolderRepository";
import { LibraryRepository } from "../repository/LibraryRepository";
import { ModelFile } from "../source/ModelFile";
import {
  Location,
  ModelSource,
  ModelSourceValidator,
} from "../source/ModelSource";
import { VLogError } from "../util/VLogError";
import { ModelRepository } from "./ModelRepository";
import { evaluate } from "./evaluate";
import { ValidateError } from "@quick-qui/model-core";
export class ModelManager {
  private defines: ModelDefine[] = [];
  private main: Location;
  private model: Promise<Model> | undefined = undefined;
  private modelSources: Promise<ModelSource[]> | undefined = undefined;
  private originalModel: Promise<Model> | undefined = undefined;
  private woveModel: Promise<Model> | undefined = undefined;
  private buildLogs: Log[] = [];
  private root: string;
  //NOTE source validation暂时没有用,先留着吧。
  private sourceValidators: ModelSourceValidator[] = [];
  constructor(main: Location, root: string) {
    this.main = main;
    this.root = root;
  }

  //RULE model 处理的几个阶段 -
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
      const builded: ModelSource[] = await this.build(this.main, this.root);
      const errs = this.sourceValidators.map((_) => _.validate(builded)).flat();
      if (errs.length != 0) {
        throw new VLogError("validate source failed", errs);
      }
      this.modelSources = Promise.resolve(builded);
    }
    return this.modelSources!;
  }

  emptyModel: Model = {
    type: "model",
  };

  async getOriginalModel(): Promise<Model> {
    if (!this.originalModel) {
      const sources: ModelSource[] = await this.getSource();
      let model = this.emptyModel;
      //find defines
      const defineFiles: ModelFile[] = sources
        .map((modelSource) => {
          return modelSource.files.filter((file) => {
            return minimatch(file.path, dynamicDefineFilePattern);
          });
        })
        .flat();

      const dynamicDefines: ModelDefine[] = (
        await Promise.all(
          defineFiles.map(async (file) =>
            Promise.all(await dynamicDefine(file.path, file.repositoryBase))
          )
        )
      ).flat();

      dynamicDefines.forEach((d: ModelDefine) => this.defines.push(d));

      //merge
      sources.forEach((modelSource) =>
        modelSource.files.forEach((file) => {
          if (minimatch(file.fileName, dynamicDefineFilePattern)) {
            //define 定义文件，啥都不干。
          } else {
            //所有match这个文件的define参与merge。
            const allDefines = this.defines.filter((def: ModelDefine) => {
              return (
                def.filePattern === undefined ||
                minimatch(file.fileName, def.filePattern)
              );
            });
            if (allDefines.length === 0) {
              throw new VLogError(`no define find - ${file.fileName}`, [
                new ValidateError(`files/${file.fileName}`, "no define find"),
              ]);
            } else {
              allDefines.forEach((define) => {
                const piece = file.modelObject;
                let matched = {};
                //IDEA if piece.type is function , piece=piece(model)
                if (define.objectPattern) {
                  matched = _.get(piece, define.objectPattern);
                }
                const buildingContext = {
                  modelSource,
                  modelFile: file,
                };
                if (matched !== undefined) {
                  const errors = define.validatePiece(
                    model,
                    piece,
                    buildingContext
                  );
                  if (errors.length != 0) {
                    throw new VLogError("validate piece failed", errors);
                  } else {
                    if (define.normalize) {
                      const [normalizedPiece, logs] = define.normalize(
                        model,
                        piece
                      );
                      model = define.merge(
                        model,
                        normalizedPiece,
                        buildingContext
                      );
                      this.buildLogs = this.buildLogs.concat(logs);
                    } else {
                      model = define.merge(model, piece, buildingContext);
                    }
                  }
                }
              });
            }
          }
        })
      );
      //validate after merge
      //所有define参加。
      const validateAfterMerge = this.defines
        .map((def) => {
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
      //所有define参加。
      let model = originalModel;
      const weavers = this.defines.map((d) => d.weavers).flat();
      const sortedWeavers: ModelWeaver[] = _.sortBy(weavers, (weaver) => {
        return weaver.order ?? 0;
      });
      sortedWeavers.forEach((weaver) => {
        const [mo, log] = weaver.weave(model);
        this.buildLogs = this.buildLogs.concat(log);
        model = mo;
      });
      //validate after weave
      //所有define参加。
      const validateAfterWeave = this.defines
        .map((def) => {
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
        //对model级别的表达式求值
        const evaluated = (await evaluate(woven))[0];
        this.model = Promise.resolve(evaluated);
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
    this.buildLogs = [];
    this.modelSources = undefined;
    this.originalModel = undefined;
    this.woveModel = undefined;
    this.model = undefined;
  }

  private async build(
    location: Location,
    root: string
  ): Promise<ModelSource[]> {
    const repository = await this.resolve(location, root);
    const includes: Location[] = repository.source.includes;
    const includeModel: ModelSource[][] = await Promise.all(
      includes.map((include) => this.build(include, root))
    );
    const modelSource = repository.source;
    modelSource.includeSources = includeModel.map((_) => _[0]);
    return includeModel.reduce((a, b) => a.concat(b), [modelSource]); //第一个source是自己，后面的source是include的
  }

  private resolve(location: Location, root: string): Promise<ModelRepository> {
    if (location.protocol === "folder") {
      return FolderRepository.build(location.resource, root);
    }

    if (location.protocol === "library") {
      return LibraryRepository.build(location.resource, root);
    }
    throw new Error(
      "Location not supported (yet)- " + JSON.stringify(location)
    );
  }
}
