import { Model } from "./Model";
import { FolderRepository } from "../repository/FolderRepository";
import { GithubRepository } from "../repository/GithubRepository";
import { ModelRepository } from "./ModelRepository";
import { domainInherite } from "../domain/DomainBase";
import { DomainValidator } from "../domain/DomainValidator";
import { FunctionValidator } from "../function/FunctionValidator";
import { pushAll } from '../domain/DomainExtends'
import { ModelSource } from "../source/ModelSource";
import { Location } from '../source/ModelSource'
import { fileToModel } from "../source/ModelFile";



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
    private validators: ModelValidator[] = [
        new DomainValidator(),
        new FunctionValidator()
    ]
    private sourceValidators: ModelSourceValidator[] = []
    constructor(main: Location) {
        this.main = main
    }


    //TODO model 处理的几个阶段 - 
    /*
        1. 处理include
        2. 从所有文件中获取（所有的entity、enum、function）
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

    async getOriginalModel(): Promise<Model> {
        if (!this.originalModel) {
            const source = await this.getSource()
            const models: Model[] = source.map(modelSource => modelSource.files.map(file => fileToModel(file))).flat()
            const merged = models.reduce(this.merge)
            //validate
            const errs = await this.validators.map((_) => _.validate(merged)).flat()
            if (errs.length != 0) {
                //TODO 应该有个更友好的设计。
                errs.forEach(console.log)
                throw new Error("model validate failed")
            };
            this.originalModel = Promise.resolve(merged)
        }
        return this.originalModel!
    }

    async getModel(): Promise<Model> {
        if (!this.model) {

            //extends 
            const merged = await this.getOriginalModel()
            const extended = await pushAll(merged.domainModel!)

            const inherited = await domainInherite(extended)
            const finalModel = { ...merged, domainModel: inherited }
            this.model = Promise.resolve(finalModel)
        }
        return this.model!
    }

    refresh() {
        this.modelSources = undefined
        this.originalModel = undefined
        this.model = undefined
    }


    private merge(a: Model, b: Model): Model {
        return {
            domainModel: {
                entities: (a.domainModel && a.domainModel.entities || []).concat(b.domainModel && b.domainModel.entities || []),
                enums: (a.domainModel && a.domainModel.enums || []).concat(b.domainModel && b.domainModel.enums || [])
            },
            functionModel: {
                functions: (a.functionModel && a.functionModel.functions || []).concat(b.functionModel && b.functionModel.functions || [])
            }
        }
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
        throw new Error("Location not supported (yet)- " + JSON.stringify(location));
    }
}