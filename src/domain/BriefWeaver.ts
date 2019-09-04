import { ModelDefine, ModelWeaver, ModelWeaveLog } from "../model/ModelDefine";
import { Entity } from "./DomainModel";
import { Model } from "../model/Model";
import * as _ from "lodash";
import { forEachEntity } from "./DomainExtends";

export class BriefWeaver implements ModelWeaver {
    name = 'brief'
    weave(model: Model): [Model, ModelWeaveLog[]] {
        return forEachEntity(model, defaultBrief);
    }
}





function hasBrief(entity: Entity): boolean {
    if (!entity.directives) return false
    if (!entity.directives['brief']) return false
    return true
}


//TODO 是否应该在这里？brief不应该是enities的基本属性，应该是跟function相关的？好像也不是。算是一种表现模型？
function defaultBrief(entity: Entity): [Entity, ModelWeaveLog?] {
    const guesName = ["name", "title", "subject", "description", "code", "text", "content"]
    if (!hasBrief(entity)) {
        const guessedName = guesName.find((gn) => {
            return !!(entity.properties.find((p) => p.name == gn))
        })
        if (guessedName) {
            //TODO 需要验证，这个merge是否会冲掉所有的derictive
            //多半会冲掉.
            return [{
                ...entity,
                directives: {
                    ...entity.directives,
                    brief: guessedName
                }
            }
                , new ModelWeaveLog(`brief guessed for entity/${entity.name}- ${guessedName}`)]
        } else
            return [entity, undefined]
    }
    return [entity, undefined]
}