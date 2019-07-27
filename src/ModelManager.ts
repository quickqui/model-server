import { Model } from "./Model";
import { FolderRepository } from "./repository/FolderRepository";
import { ModelRepository } from "./repository/ModelRepository";
import * as _ from "lodash";
import { domainInherite } from "./domain/DomainBase";
export interface Location {
    protocol: string
    resource: any
}

export class ModelManager {
    private main: Location
    private model: Promise<Model> | undefined = undefined
    constructor(main: Location) {
        this.main = main
    }

    async getModel(): Promise<Model> {
        if (!this.model) {
            const builded = await this.build(this.main)
            const inherited = await domainInherite(builded.domainModel!)
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
            return FolderRepository.build(__dirname + '/' + location.resource)
        }
        throw new Error("Location not supported (yet)- " + JSON.stringify(location));
    }
}