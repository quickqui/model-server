import { Model } from "./Model";
import { ModelRepository } from "./ModelRepository";

import { FunctionModel } from './FunctionModel';
import * as yaml from 'js-yaml'

import * as fs from 'fs'
import { DataModel, parseFromSchema } from "./DataSchema";
import * as readdir from 'recursive-readdir';
import * as minimatch from 'minimatch'


export class FolderRepository implements ModelRepository {
    base!: string
    model!: Model
    dataModelSource: string = ''


    static async findFiles(base: string): Promise<{ dataModelFiles: string[], functionModelFiles: string[] }> {
        const functionModelFiles: string[] = []
        const dataModelFiles: string[] = []
        const files = await readdir(base)
        files.forEach(file => {
            //TODO 目录结构、文件名映射到命名空间
            if (minimatch(file, "**/*.functionModel.*") ||
                minimatch(file, "**/functionModel.*"))
                functionModelFiles.push(file)
            if (minimatch(file, "**/*.dataModel.*") ||
                minimatch(file, "**/dataModel.*"))
                dataModelFiles.push(file)
        });
        return { dataModelFiles, functionModelFiles }
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
        const { dataModelFiles, functionModelFiles } = await files

        const dModelsource = dataModelFiles.map((fpath) => {
            return fs.readFileSync(fpath).toString()
        }).join("\n\n")
        const dmodel: DataModel = parseFromSchema(dModelsource)
        const fmodels =
            functionModelFiles.map((fpath) => {
                const fModelSource = fs.readFileSync(fpath).toString()
                return yaml.safeLoad(fModelSource)
            })
        const fmodel = fmodels.reduce((a,b)=>{
            return {
                functions:             a.functions.concat(b.functions)

            }
        })
        return new FolderRepository(base,
            { dataModel: dmodel, functionModel: fmodel }
            , dModelsource)

    }
}





