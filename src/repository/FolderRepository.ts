import { Model } from "../Model";
import { ModelRepository } from "./ModelRepository";

import * as yaml from 'js-yaml'

import * as fs from 'fs'
import * as readdir from 'recursive-readdir';
import * as minimatch from 'minimatch'
import { toPrismaSchemaString } from "../data/PrimsaDataSchema";
import domainModelBase from "../domain/DomainBase"


export class FolderRepository implements ModelRepository {
    base!: string
    model!: Model
    dataModelSource: string = ''


    static async findFiles(base: string): Promise<{ domainModelFiles: string[], functionModelFiles: string[] }> {
        const functionModelFiles: string[] = []
        const domainModelFiles: string[] = []
        const files = await readdir(base)
        files.forEach(file => {
            //TODO 目录结构、文件名映射到命名空间
            if (minimatch(file, "**/*.functionModel.*") ||
                minimatch(file, "**/functionModel.*"))
                functionModelFiles.push(file)
            if (minimatch(file, "**/*.domainModel.*") ||
                minimatch(file, "**/domainModel.*"))
                domainModelFiles.push(file)
        });
        return { domainModelFiles, functionModelFiles }
    }



    constructor(base: string, model: Model, dataModelSource: string) {
        if (typeof model === 'undefined') {
            throw new Error('Cannot be called directly');
        }
        this.base = base
        this.model = model
        this.dataModelSource = dataModelSource

    }

    static async build(base: string) {
        const files = FolderRepository.findFiles(base)
        const { domainModelFiles, functionModelFiles } = await files


        // const dmodel: DataModel = parseFromSchema(dModelsource)
        const fmodels =
            functionModelFiles.map((fpath) => {
                const fModelSource = fs.readFileSync(fpath).toString()
                return yaml.safeLoad(fModelSource)
            })
        const fmodel = fmodels.reduce((a, b) => {
            return {
                functions: a.functions.concat(b.functions)

            }
        })
        const dmodels = domainModelFiles.map((fpath) => {
            const dModelSource = fs.readFileSync(fpath).toString()
            return yaml.safeLoad(dModelSource)
        })
        const dmodel = dmodels.reduce((a, b) => {
            return {
                entities: a.entities.concat(b.entities),
                enums: (a.enums || []).concat(b.enums)
            }
        })


        //TODO 应该有个更高的位置。
        const domainModel = {
            entities: dmodel.entities.map((entity) => domainModelBase(entity)),
            enums: dmodel.enums
        }


        const dModelSource = toPrismaSchemaString(domainModel)
        return new FolderRepository(base,
            { domainModel: domainModel, functionModel: fmodel }
            , dModelSource)

    }
}





