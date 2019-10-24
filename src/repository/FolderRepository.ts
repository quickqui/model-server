import { ModelRepository } from "../model/ModelRepository";

import * as yaml from 'js-yaml'

import * as fs from 'fs'
import * as path from 'path'
import * as readdir from 'recursive-readdir';
import * as minimatch from 'minimatch'

import { ModelSource } from "../source/ModelSource";
import * as R from "ramda";
import { ModelFile } from "../source/ModelFile";
import { defines } from "../model/ModelDefine";
import * as lo from 'lodash'
import { dynamicDefineFilePattern, dynamicDefine } from "../dynamic/Define";


export class FolderRepository implements ModelRepository {
    base!: string //TODO 貌似现在用不上？
    source!: ModelSource


    static async findFiles(base: string): Promise<{ modelFiles: Map<string, string[]>, includeFiles: string[] }> {
        const modelFiles: Map<string, string[]> = new Map<string, string[]>();
        const includeFiles: string[] = []
        const abstractBase = base.startsWith("/") ? base : process.cwd() + '/' + base
        const files = await readdir(abstractBase)


        const defs = await Promise.all( files.filter(file => {
            return (minimatch(file, dynamicDefineFilePattern))
        }).map(df => {
            return dynamicDefine(df)
        }))
        
       
        if(defs){

        files.forEach(file => {
            const define = defines.find(_ => minimatch(file, _.filePattern))
            if (define) {
                //TODO 没有get(key,default)方法？
                const f = modelFiles.get(define.name) ? modelFiles.get(define.name) : []
                modelFiles.set(define.name, lo(f).concat(file).value())
            }
            if (minimatch(file, "**/*.include.*") ||
                minimatch(file, "**/include.*"))
                includeFiles.push(file)

        });
        return { modelFiles, includeFiles }
    }else {
        throw new Error("what happened")
    }
    }



    constructor(base: string, source: ModelSource) {
        if (R.isNil(source)) {
            throw new Error('Cannot be called directly');
        }
        this.base = base
        this.source = source

    }



    static async build(base: string, description?: string, name?: string): Promise<ModelRepository> {

        const { modelFiles, includeFiles } = await FolderRepository.findFiles(base)
        function mapToObj(inputMap) {
            let obj = {};

            inputMap.forEach(function (value, key) {
                obj[key] = value
            });

            return obj;
        }
        const models: ModelFile[] = lo(mapToObj(modelFiles)).map((value: string[], key: string) => {
            return value.map(fPath => {
                if (fPath.endsWith(".yml") || fPath.endsWith(".yaml")) {
                    //TODO 支持别的序列化格式。但对机制来说都是object。
                    const fModelSource = fs.readFileSync(fPath).toString()
                    return {
                        type: key,
                        //TODO 如果必要，区分path和filename
                        fileName: fPath,
                        path: fPath,
                        modelObject: yaml.safeLoad(fModelSource)
                    } as ModelFile
                } else {
                    throw new Error(`not support file type - ${fPath}`)
                }
            }) as ModelFile[]
        }).flatten().value()



        const includes = includeFiles.map((fPath) => {
            return yaml.safeLoad(fs.readFileSync(fPath).toString())["includes"]
        }).flat()





        return new FolderRepository(base,
            {
                name: name || path.basename(base),
                description: description || `folder source - ${base}`,
                files: models,
                includes,
                includeSources: []
            }
        )

    }



}





