import { Model } from "./Model";
import { Log } from "./ModelDefine";
import {weavers as domainWeavers} from '../domain/DomainWeavers'
export interface ModelWeaver {
    name: string;
    weave(model: Model): [Model, ModelWeaveLog[]];
}


export const weavers: ModelWeaver[] = [
    ...domainWeavers
]

export class ModelWeaveLog implements Log {
    level: string = 'info'
    category: string = 'model-weave'
    message: string = ''
    constructor(message: string) {
        this.message = message
    }
}

export interface ModelWeaverConfig {
    name:string;
    extend:Promise<ModelWeaver>;
}