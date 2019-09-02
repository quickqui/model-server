import { ModelDefine } from "../model/ModelDefine";
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
    whenCut(model: Model, piece: Functions): Model {
        //TODO push extends here
        //目前暂时没有extends的function？
        return model
    }
    whenMerge(model: Model, piece: Functions): Model {
        return {
            ...model,
            functionModel: {
                ...model.functionModel,
                functions: _(model.functionModel ? model.functionModel.functions : []).concat(piece.functions).value(),
            }
        }
    }
    validate(model:Model):ValidatError[]{
        return []
    }
}