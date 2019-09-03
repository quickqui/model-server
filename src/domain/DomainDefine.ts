import { ModelDefine, ModelWeaveLog } from "../model/ModelDefine";
import { Model } from "../model/Model";
import { Entity, Enum } from "./DomainModel";
import * as _ from "lodash";
import { ValidatError } from "../model/ModelManager";
import { pushAll as pushAllExtends } from "./DomainExtends";

interface DomainPiece {
    entities: Entity[];
    enums: Enum[];
}


export class DomainDefine implements ModelDefine<DomainPiece> {
    name = "domain"
    filePattern: string = "**/*.domainModel.*"
    toPiece(source: object): DomainPiece {
        return source as DomainPiece
    }
    weave(model: Model): [Model, ModelWeaveLog[]] {
        const [domainModel, logs] = pushAllExtends(
            model.domainModel!, [])
        return [{ ...model, domainModel }, logs]
    }
    merge(model: Model, piece: DomainPiece): Model {
        return {
            ...model,
            domainModel: {
                ...model.domainModel,
                entities: _(model.domainModel ? model.domainModel.entities : []).concat(piece.entities).compact().value(),
                enums: _(model.domainModel ? model.domainModel.enums : []).concat(piece.enums).compact().value()
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