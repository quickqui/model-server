import { Model } from "./Model";
import { FolderRepository } from "../repository/FolderRepository";
import { ModelRepository } from "./ModelRepository";
import { ModelSource } from "../source/ModelSource";
import { Location } from '../source/ModelSource'
import { LibraryRepository } from "../repository/LibraryRepository";
import { defines, Log, ModelDefine } from "./ModelDefine";
import * as _ from "lodash";
import { weavers, ModelWeaveLog } from "./ModelWeaver";
import { dynamicDefineFilePattern, dynamicDefine } from "../dynamic/Define";
import * as minimatch from 'minimatch';
import { ModelFile } from "../source/ModelFile";



export interface ModelValidator {
    validate(model: Model): ValidateError[]
}
export interface ModelSourceValidator {
    validate(modelSources: ModelSource[]): ValidateError[]
}
export class ValidateError implements Log {
    category: string = 'validate'
    level: string = 'error'
    message: string = ''
    constructor(message: string) {
        this.message = message
    }
}

export class ModelManager {
    private main: Location
    private model: Promise<Model> | undefined = undefined
    private modelSources: Promise<ModelSource[]> | undefined = undefined
    private originalModel: Promise<Model> | undefined = undefined
    private woveModel: Promise<Model> | undefined = undefined
    private woveLogs: ModelWeaveLog[] = []
    private sourceValidators: ModelSourceValidator[] = []
    constructor(main: Location) {
        this.main = main
    }


    //TODO model 处理的几个阶段 - 
    /*
        1. 处理include，所有文件展开，包括可能不认识的。
        1. 处理defines //因为defines可能以include定义
        2. 从所有文件中获取, merge
            2.5 得到model本身的结构图。（repository、文件、nameSpace、include、extends）
        3. validation第一次
        4. wave
        5. validate第二次
    */
    async getSource(): Promise<ModelSource[]> {
        if (!this.modelSources) {
            const builded = await this.build(this.main)
            const errs = await this.sourceValidators.map(_ => _.validate(builded)).flat()
            if (errs.length != 0) {
                //TODO 应该有个更友好的设计。
                errs.forEach(console.log)
                throw new Error("model source validate failed")
            };
            this.modelSources = Promise.resolve(builded)
        }
        return this.modelSources!

    }

    emptyModel: Model = {
        domainModel: undefined,
        functionModel: undefined
    }

    async getOriginalModel(): Promise<Model> {
        if (!this.originalModel) {
            const sources: ModelSource[] = await this.getSource()
            let model = this.emptyModel

            //find defines


            const defineFiles: ModelFile[] = sources.map((modelSource) => {
                return modelSource.files.filter((file) => {
                    return minimatch(file.path, dynamicDefineFilePattern)
                })
            }).flat()

            const dynamicDefines: ModelDefine<unknown>[] = (await Promise.all(defineFiles.map(
                async (file) => Promise.all(await dynamicDefine(file.fileName))))).flat()

            dynamicDefines.forEach((d: ModelDefine<unknown>) => defines.push(d))
            sources.forEach(
                modelSource => modelSource.files.forEach(
                    file => {
                        const define = defines.find(
                            (def: ModelDefine<unknown>) => {
                                return minimatch(file.fileName, def.filePattern)
                            })
                        if (define) {
                            model = define.merge(model, define.toPiece(file.modelObject))
                        } else if (minimatch(file.fileName, dynamicDefineFilePattern)) {
                            //do nothing
                        } else {
                            throw new Error(`no define find - ${[file.fileName]}`)
                        }
                    }

                )
            )
            // //validate
            // const errs = await this.validators.map((_) => _.validate(model)).flat()
            // if (errs.length != 0) {
            //     //TODO 应该有个更友好的设计。
            //     errs.forEach(console.log)
            //     throw new Error("model validate failed")
            // };
            this.originalModel = Promise.resolve(model)
        }
        return this.originalModel!
    }

    async getWovenModel(): Promise<Model> {
        if (!this.woveModel) {
            const originalModel = await this.getOriginalModel()
            let model = originalModel

            weavers.forEach(weaver => {
                const [mo, log] = weaver.weave(model)
                this.woveLogs = _(this.woveLogs).concat(log).value()
                model = mo
            })
            this.woveModel = Promise.resolve(model)
        }
        return this.woveModel!
    }


    async getModel(): Promise<Model> {
        if (!this.model) {


            const woven = await this.getWovenModel()


            this.model = Promise.resolve(woven)
        }
        return this.model!
    }

    getWeaveLogs(): ModelWeaveLog[] {
        return this.woveLogs
    }

    refresh() {
        this.modelSources = undefined
        this.originalModel = undefined
        this.woveModel = undefined
        this.woveLogs = []
        this.model = undefined
    }

    private async build(location: Location): Promise<ModelSource[]> {
        const repository = await this.resolve(location)
        const includes: Location[] = repository.source.includes
        const includeModel: ModelSource[][] = await Promise.all(includes.map((include) => this.build(include)))
        const modelSource = repository.source
        modelSource.includeSources = includeModel.map(_ => _[0])
        return includeModel.reduce((a, b) => a.concat(b), [modelSource]) //第一个source是自己，后面的source是include的
    }


    private resolve(location: Location): Promise<ModelRepository> {
        if (location.protocol === 'folder') {
            return FolderRepository.build(location.resource)
        }

        if (location.protocol === 'library') {
            return LibraryRepository.build(location.resource)
        }
        throw new Error("Location not supported (yet)- " + JSON.stringify(location));
    }
}