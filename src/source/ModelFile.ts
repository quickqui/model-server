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
            presentationModel: {
                presentatins: []
            }
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
            presentationModel: {
                presentatins: []
            }
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
            presentationModel: {
                presentatins: file.modelObject.presentatins || []
            }
        }
    }
    throw new Error('Unknown file type - ' + file.type)
}