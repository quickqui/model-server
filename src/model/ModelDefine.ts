import { Model } from "./Model";
import { DomainDefine } from "../domain/DomainDefine";
import { FunctionDefine } from "../function/FunctionDefine";
import { ValidatError } from "./ModelManager";


export interface ModelDefine<PT> {
    name:string
    filePattern: string;
    toPiece(source:object):PT
    whenMerge(model: Model, piece: PT): Model
    whenCut(model: Model, piece: PT): Model
    validate(model:Model):ValidatError[]
}

export const defines: ModelDefine<unknown>[] = [
    new DomainDefine(),
    new FunctionDefine()
]