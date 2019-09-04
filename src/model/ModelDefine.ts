import { Model } from "./Model";
import { DomainDefine, InjectedWeaver } from "../domain/DomainDefine";
import { FunctionDefine } from "../function/FunctionDefine";
import { ValidatError } from "./ModelManager";
import { weavers as domainWeavers } from "../domain/DomainDefine";


export interface ModelDefine<PT> {
    name: string
    filePattern: string;
    toPiece(source: object): PT
    merge(model: Model, piece: PT): Model

    validateAfterMerge(model: Model): ValidatError[]
    validateAfterWeave(model: Model): ValidatError[]
}


export interface ModelWeaver {
    name: string
    weave(model: Model): [Model, ModelWeaveLog[]]
}


export const defines: ModelDefine<unknown>[] = [
    new DomainDefine(),
    new FunctionDefine()
]

export const weavers: ModelWeaver[] = [
    ...domainWeavers
]

export interface Log {
    level: string
    message: string
    category: string
}
export class ModelWeaveLog implements Log {
    level: string = 'info'
    category: string = 'model-weave'
    message: string = ''
    constructor(message: string) {
        this.message = message
    }
}