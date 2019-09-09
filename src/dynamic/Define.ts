
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
    const obj = require(filePath);
    console.dir(obj)
    const result = DefineType.decode(obj);
    ThrowReporter.report(result);
    if (isRight(result)) {
        console.log("right")
        defines.push((result as Right<any>).right)
        console.log(defines)
    }
}