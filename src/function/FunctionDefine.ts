import { ModelDefine, ModelWeaveLog } from "../model/ModelDefine";
import { Model } from "../model/Model";
import * as _ from "lodash";
import { Function } from "./FunctionModel"
import { ValidatError } from "../model/ModelManager";

type Functions = { functions: Function[] }

export class FunctionDefine implements ModelDefine<Functions> {
    name = "function"
    filePattern: string = "**/*.functionModel.*"
    toPiece(source: object): Functions {
        return source as Functions
    }
    weave(model: Model): [Model, ModelWeaveLog[]] {
        //TODO push extends here
        //目前暂时没有extends的function？
        return [model, []]
    }
    merge(model: Model, piece: Functions): Model {
        return {
            ...model,
            functionModel: {
                ...model.functionModel,
                functions: _(model.functionModel ? model.functionModel.functions : []).concat(piece.functions).value(),
            }
        }
    }
    validateAfterMerge(model: Model): ValidatError[] {
        return []
    }
    validateAfterWeave(model: Model): ValidatError[] {
        return []
    }
}