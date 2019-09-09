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


        files.forEach(file => {
            if (minimatch(file, dynamicDefineFilePattern)) {
                dynamicDefine(file)
            }
        })

        files.forEach(file => {
            const define = defines.find(_ => minimatch(file, _.filePattern))
            if (define) {
                const f = lo(modelFiles).get(define.name, [])
                modelFiles.set(define.name, lo(f).concat(file).value())
            }
            if (minimatch(file, "**/*.include.*") ||
                minimatch(file, "**/include.*"))
                includeFiles.push(file)

        });
        return { modelFiles, includeFiles }
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
            return value.map(fpath => {
                if (fpath.endsWith(".yml") || fpath.endsWith(".yaml")) {
                    //TODO 支持别的序列化格式。但对机制来说都是object。
                    const fModelSource = fs.readFileSync(fpath).toString()
                    return {
                        type: key,
                        //TODO 如果必要，区分path和filename
                        fileName: fpath,
                        path: fpath,
                        modelObject: yaml.safeLoad(fModelSource)
                    } as ModelFile
                } else {
                    throw new Error("not support file type - ${fpath}")
                }
            }) as ModelFile[]
        }).flatten().value()



        const includes = includeFiles.map((fpath) => {
            return yaml.safeLoad(fs.readFileSync(fpath).toString())["includes"]
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





