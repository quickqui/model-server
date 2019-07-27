import { Model } from "../Model";
import { ModelRepository } from "./ModelRepository";

import * as yaml from 'js-yaml'

import * as fs from 'fs'
import * as readdir from 'recursive-readdir';
import * as minimatch from 'minimatch'
import { toPrismaSchemaString } from "../data/PrimsaDataSchema";
import { domainInherite } from "../domain/DomainBase"

import {Location} from '../ModelManager'


export class FolderRepository implements ModelRepository {
    base!: string //TODO 貌似现在用不上？
    model!: Model
    includes: Location[]


    static async findFiles(base: string): Promise<{ domainModelFiles: string[], functionModelFiles: string[], includeFiles: string[] }> {
        const functionModelFiles: string[] = []
        const domainModelFiles: string[] = []
        const includeFiles: string[] = []
        const files = await readdir(base)
        files.forEach(file => {
            //TODO 目录结构、文件名映射到命名空间
            if (minimatch(file, "**/*.functionModel.*") ||
                minimatch(file, "**/functionModel.*"))
                functionModelFiles.push(file)
            if (minimatch(file, "**/*.domainModel.*") ||
                minimatch(file, "**/domainModel.*"))
                domainModelFiles.push(file)
            if (minimatch(file, "**/*.include.*") ||
                minimatch(file, "**/include.*"))
                includeFiles.push(file)
        });
        return { domainModelFiles, functionModelFiles, includeFiles }
    }



    constructor(base: string, model: Model, includes: Location[]) {
        if (typeof model === 'undefined') {
            throw new Error('Cannot be called directly');
        }
        this.base = base
        this.model = model
        this.includes = includes

    }

    static async build(base: string) :Promise<ModelRepository> {
        const { domainModelFiles, functionModelFiles, includeFiles } = await FolderRepository.findFiles(base)


        // const dmodel: DataModel = parseFromSchema(dModelsource)
        const fmodels =
            functionModelFiles.map((fpath) => {
                const fModelSource = fs.readFileSync(fpath).toString()
                return yaml.safeLoad(fModelSource)
            })
        const fmodel = fmodels.reduce((a, b) => {
            return {
                functions: a.functions.concat(b.functions || [])

            }
        },{functions:[]})
        const dmodels = domainModelFiles.map((fpath) => {
            const dModelSource = fs.readFileSync(fpath).toString()
            return yaml.safeLoad(dModelSource)
        })
        const dmodel = dmodels.reduce((a, b) => {
            return {
                entities: a.entities.concat(b.entities || []),
                enums: (a.enums || []).concat(b.enums || [])
            }
        },{entities:[],enums:[]})

        const includes = includeFiles.map((fpath) => {
            return yaml.safeLoad(fs.readFileSync(fpath).toString())["includes"]
        }).flat()
       

        

        //TODO 应该有个更高的位置。

        return new FolderRepository(base,
            { domainModel: dmodel, functionModel: fmodel }, includes
            )

    }


    
}





