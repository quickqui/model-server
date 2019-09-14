
import * as _ from 'lodash'


import * as t from 'io-ts'
import { ThrowReporter } from "io-ts/lib/ThrowReporter";
import { defines } from '../model/ModelDefine';
import { isRight, Right } from 'fp-ts/lib/Either';


const DefineType = t.interface({
    name: t.string,
    filePattern: t.string,
    toPiece: t.Function,
    merge: t.Function
})

export const dynamicDefineFilePattern: string = "**/**.define.js"


export function dynamicDefine(filePath: string): void {
    //TODO 目前只支持js。
    const obj = require(filePath);
    // console.dir(obj)
    const result = DefineType.decode(obj);
    ThrowReporter.report(result);
    //TODO either这里怎么使用是有问题的，为啥不能map/forEach？
    if (isRight(result)) {
        defines.push((result as Right<any>).right)
    }else{
        throw new Error(`can not import js as define - ${filePath}`)
    }
}