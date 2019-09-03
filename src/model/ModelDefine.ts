import { Model } from "./Model";
import { DomainDefine } from "../domain/DomainDefine";
import { FunctionDefine } from "../function/FunctionDefine";
import { ValidatError } from "./ModelManager";


export interface ModelDefine<PT> {
    name: string
    filePattern: string;
    toPiece(source: object): PT
    merge(model: Model, piece: PT): Model
    weave(model: Model): [Model, ModelWeaveLog[]]
    validateAfterMerge(model: Model): ValidatError[]
    validateAfterWeave(model: Model): ValidatError[]
}

export const defines: ModelDefine<unknown>[] = [
    new DomainDefine(),
    new FunctionDefine()
]

export interface ModelWeaveLog {
    logItem: string
}