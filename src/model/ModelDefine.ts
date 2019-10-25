import { Model } from "./Model";
import { DomainDefine } from "../domain/DomainDefine";
import { FunctionDefine } from "../function/FunctionDefine";
import { ValidateError } from "./ModelManager";


export interface ModelDefineConfig {
    name:string;
    filePattern:string;
    extend:Promise<any>;
}




export interface ModelDefine<PT> {
    name:string;
    filePattern:string;
    toPiece(source: object): PT
    merge(model: Model, piece: PT): Model

    validateAfterMerge(model: Model): ValidateError[]
    validateAfterWeave(model: Model): ValidateError[]
}


export const defines: ModelDefine<unknown>[] = [
    new DomainDefine(),
    new FunctionDefine()
]


export interface Log {
    level: string
    message: string
    category: string
}
