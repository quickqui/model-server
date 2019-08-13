import { ModelRepository } from "../model/ModelRepository";

import * as yaml from 'js-yaml'

import * as fs from 'fs'
import * as path from 'path'
import * as readdir from 'recursive-readdir';
import * as minimatch from 'minimatch'

import { ModelSource } from "../source/ModelSource";
import * as R from "ramda";
import { ModelFile } from "../source/ModelFile";


export class FolderRepository implements ModelRepository {
    base!: string //TODO 貌似现在用不上？
    source!: ModelSource


    static async findFiles(base: string): Promise<{ domainModelFiles: string[], functionModelFiles: string[], presentationModelFiles: string[], includeFiles: string[] }> {
        const functionModelFiles: string[] = []
        const domainModelFiles: string[] = []
        const presentationModelFiles: string[] = []
        const includeFiles: string[] = []
        const abstractBase = base.startsWith("/") ? base : process.cwd() + '/' + base
        const files = await readdir(abstractBase)
        files.forEach(file => {
            //TODO 目录结构、文件名映射到命名空间
            if (minimatch(file, "**/*.functionModel.*") ||
                minimatch(file, "**/functionModel.*"))
                functionModelFiles.push(file)
            if (minimatch(file, "**/*.domainModel.*") ||
                minimatch(file, "**/domainModel.*"))
                domainModelFiles.push(file)
            if (minimatch(file, "**/*.presentationModel.*") ||
                minimatch(file, "**/presentationModel.*"))
                presentationModelFiles.push(file)
            if (minimatch(file, "**/*.include.*") ||
                minimatch(file, "**/include.*"))
                includeFiles.push(file)
        });
        return { domainModelFiles, functionModelFiles, presentationModelFiles, includeFiles }
    }



    constructor(base: string, source: ModelSource) {
        if (R.isNil(source)) {
            throw new Error('Cannot be called directly');
        }
        this.base = base
        this.source = source

    }

    static async build(base: string, description?: string, name?: string): Promise<ModelRepository> {
        const { domainModelFiles, functionModelFiles, presentationModelFiles, includeFiles } = await FolderRepository.findFiles(base)


        // const dmodel: DataModel = parseFromSchema(dModelsource)
        const fmodels: ModelFile[] =
            functionModelFiles.map((fpath) => {
                const fModelSource = fs.readFileSync(fpath).toString()
                return {
                    type: 'function',
                    //TODO 如果必要，区分path和filename
                    fileName: fpath,
                    path: fpath,
                    modelObject: yaml.safeLoad(fModelSource)
                }
            })

        const dmodels = domainModelFiles.map((fpath) => {
            const dModelSource = fs.readFileSync(fpath).toString()
            return {
                type: 'domain',
                //TODO 如果必要，区分path和filename
                fileName: fpath,
                path: fpath,
                modelObject: yaml.safeLoad(dModelSource)
            }
        })

        const pmodels = presentationModelFiles.map((ppath) => {
            const pModelSource = fs.readFileSync(ppath).toString()
            return {
                type: 'presentation',
                //TODO 如果必要，区分path和filename
                fileName: ppath,
                path: ppath,
                modelObject: yaml.safeLoad(pModelSource)
            }
        })


        const includes = includeFiles.map((fpath) => {
            return yaml.safeLoad(fs.readFileSync(fpath).toString())["includes"]
        }).flat()





        return new FolderRepository(base,
            {
                name: name || path.basename(base),
                description: description || `folder source - ${base}`,
                files: dmodels.concat(fmodels).concat(pmodels),
                includes,
                includeSources: []
            }
        )

    }



}





