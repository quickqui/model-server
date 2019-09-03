import { Model } from "./Model";
import { FolderRepository } from "../repository/FolderRepository";
import { GithubRepository } from "../repository/GithubRepository";
import { ModelRepository } from "./ModelRepository";
import { domainInherite } from "../domain/DomainBase";
import { pushAll } from '../domain/DomainExtends'
import { ModelSource } from "../source/ModelSource";
import { Location } from '../source/ModelSource'
import { LibarayRepository } from "../repository/LibarayRepository";
import { defines, ModelWeaveLog } from "./ModelDefine";
import * as _ from "lodash";



export interface ModelValidator {
    validate(model: Model): ValidatError[]
}
export interface ModelSourceValidator {
    validate(modelSources: ModelSource[]): ValidatError[]
}
export interface ValidatError {
    message: string

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
        1. 处理include
        2. 从所有文件中获取,merge
        2.5 得到model本身的结构图。（reposiotry、文件、namesapce、include、extends）
        3. validation第一次
        4. 处理extends
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
            const source = await this.getSource()
            let model = this.emptyModel
            source.forEach(modelSource => modelSource.files.forEach(file => {
                const define = defines.find(def => def.name === file.type)
                if (define) {
                    model = define.merge(model, define.toPiece(file.modelObject))
                } else {
                    throw new Error("no define find")
                }
            }))
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

            defines.forEach(define => {
                const [mo, log] = define.weave(model)
                this.woveLogs = _(this.woveLogs).concat(log).value()
                model = mo
            })
            this.woveModel = Promise.resolve(model)
        }
        return this.woveModel!
    }


    async getModel(): Promise<Model> {
        if (!this.model) {

            const merged = await this.getOriginalModel()

            //extends 
            const woved = await this.getWovenModel()
            //TODO inherited 和 extended 分别做什么事情？
            const inherited = await domainInherite(woved!.domainModel!)
            const finalModel = { ...merged, domainModel: inherited }
            this.model = Promise.resolve(finalModel)
        }
        return this.model!
    }

    getWeaveLogs(): ModelWeaveLog[]{
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
        const includes = repository.source.includes
        const includeModel: ModelSource[][] = await Promise.all(includes.map((include) => this.build(include)))
        const modelSource = await repository.source
        modelSource.includeSources = includeModel.map(_ => _[0])
        return includeModel.reduce((a, b) => a.concat(b), [modelSource])
    }


    private resolve(location: Location): Promise<ModelRepository> {
        if (location.protocol === 'folder') {
            return FolderRepository.build(location.resource)
        }
        if (location.protocol === 'github') {
            return GithubRepository.build(location.resource)
        }
        if (location.protocol === 'libaray') {
            return LibarayRepository.build(location.resource)
        }
        throw new Error("Location not supported (yet)- " + JSON.stringify(location));
    }
}