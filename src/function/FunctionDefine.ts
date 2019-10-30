import * as _ from "lodash";
import { Function, WithFunctionModel } from "./FunctionModel"
import { ModelDefine, Model, ModelWeaveLog, ValidateError } from "@quick-qui/model-core";

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
    merge(model: Model & WithFunctionModel , piece: Functions): Model {
        return {
            ...model,
            functionModel: {
                ...model.functionModel,
                functions: _(model.functionModel ? model.functionModel.functions : []).concat(piece.functions).value(),
            }
        }
    }
    validateAfterMerge(model: Model): ValidateError[] {
        return []
    }
    validateAfterWeave(model: Model): ValidateError[] {
        return []
    }
}