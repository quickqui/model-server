import { Model } from "./Model";
import { FolderRepository } from "../repository/FolderRepository";
import {GithubRepository} from "../repository/GithubRepository";
import { ModelRepository } from "./ModelRepository";
import { domainInherite } from "../domain/DomainBase";
import { DomainValidator } from "../domain/DomainValidator";
import { FunctionValidator } from "../function/FunctionValidator";
import {pushAll} from '../domain/DomainExtends'


export interface Location {
    protocol: string
    resource: any
}
export interface ModelValidator {
    validate(model: Model): ValidatError[]
}
export interface ValidatError {
    message: string

}

export class ModelManager {
    private main: Location
    private model: Promise<Model> | undefined = undefined
    private validators: ModelValidator[] = [
        new DomainValidator(),
        new FunctionValidator()
    ]
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

    async getModel(): Promise<Model> {
        if (!this.model) {
            const builded = await this.build(this.main)

            //validate第一次
            const errs = await this.validators.map((_) => _.validate(builded)).flat()
            if (errs.length != 0) {
                //TODO 应该有个更友好的设计。
                errs.forEach(console.log)
                throw new Error("model validate failed")
            };
            //extends 

            const extended = await pushAll(builded.domainModel!)

            const inherited = await domainInherite(extended)
            const finalModel = { ...builded, domainModel: inherited }
            this.model = Promise.resolve(finalModel)
        }
        return this.model!
    }

    refresh(): Promise<Model> {
        this.model = undefined
        return this.getModel()
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

    private async build(location: Location): Promise<Model> {
        const repository = await this.resolve(location)
        const includes = repository.includes
        const includeModel = await Promise.all(includes.map((include) => this.build(include)))
        const model = await repository.model
        return includeModel.reduce(this.merge, model)
    }


    private resolve(location: Location): Promise<ModelRepository> {
        if (location.protocol === 'folder') {
            return FolderRepository.build(location.resource)
        }
        if(location.protocol === 'github'){
            return GithubRepository.build(location.resource)
        }
        throw new Error("Location not supported (yet)- " + JSON.stringify(location));
    }
}