import { ModelDefine, ModelWeaveLog, ModelWeaver } from "../model/ModelDefine";
import { Model } from "../model/Model";
import { Entity, Enum } from "./DomainModel";
import * as _ from "lodash";
import { ValidatError } from "../model/ModelManager";
import { pushAll as pushAllExtends } from "./DomainExtends";
import { BriefWeaver } from "./BriefWeaver";
import { DefaultPropertiesWeaver } from "./DefaultPropertiesWeaver";

interface DomainPiece {
    entities: Entity[];
    enums: Enum[];
}


export class InjectedWeaver implements ModelWeaver{
    name = "inject"

    weave(model: Model): [Model, ModelWeaveLog[]] {
        const [domainModel, logs] = pushAllExtends(
            model.domainModel!, [])
        return [{ ...model, domainModel }, logs]
    }
}


export class DomainDefine implements ModelDefine<DomainPiece> {
    name = "domain"
    filePattern: string = "**/*.domainModel.*"
    toPiece(source: object): DomainPiece {
        return source as DomainPiece
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

export const weavers = [
    new InjectedWeaver(),
    new BriefWeaver(),
    new DefaultPropertiesWeaver()
]