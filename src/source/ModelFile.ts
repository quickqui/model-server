import { DomainModel } from "../domain/DomainModel";
import { Model } from "../model/Model";


export interface ModelFile {
    type: string
    fileName: string
    path: string
    modelObject: any
}

export function fileToModel(file: ModelFile): Model {
    if (file.type === 'function') {
        return {
            domainModel: {
                entities: [], enums: []
            },
            functionModel: {
                functions: file.modelObject.functions || []
            },

        }
    }
    if (file.type === 'domain') {
        return {
            domainModel: {
                entities: file.modelObject.entities || []
                , enums: file.modelObject.enums || [],
            },
            functionModel: {
                functions: []
            },

        }
    }
    if (file.type === 'presentation') {
        return {
            domainModel: {
                entities: []
                , enums: [],
            },
            functionModel: {
                functions: []
            },

        }
    }
    throw new Error('Unknown file type - ' + file.type)
}