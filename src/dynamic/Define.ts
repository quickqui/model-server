
import * as _ from 'lodash'


import * as t from 'io-ts'
import { ThrowReporter } from "io-ts/lib/ThrowReporter";
import { defines, ModelDefineConfig, ModelDefine } from '../model/ModelDefine';
import { isRight, Right } from 'fp-ts/lib/Either';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { resolve } from '../Resolve';
import * as path from 'path';




export const dynamicDefineFilePattern: string = "**/**.define.yml"

export async function dynamicDefine(filePath: string) : Promise<ModelDefine<unknown>[]> {
    if (filePath.endsWith(".yml")) {
        const fModelSource = fs.readFileSync(filePath).toString()
        const obj = yaml.safeLoad(fModelSource)
        const baseDir =path.dirname(path.resolve(filePath))
        //TODO any是否可以进行限制？
        return Promise.all(obj.defines.map(o=>forOne(o,baseDir)))
    } else {
        throw new Error(
            'only .yml file supported'
        )
    }
}
async function forOne(obj: any,baseDir:string) : Promise<ModelDefine<unknown>> {
    const extendObj: any = await resolve(obj.extend,baseDir)
    if (extendObj) {
        return {
            name: obj.name, 
            filePattern: obj.filePattern,
            ...extendObj
            // merge: extendObj.merge, toPiece: extendObj.toPiece,
            // validateAfterMerge: extendObj.validateAfterMerge,
            // validateAfterWeave: extendObj.validateAfterWeave
        }
    }
    throw new Error('can not resolve')
}