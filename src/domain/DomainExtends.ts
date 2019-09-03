import { DomainModel, Entity } from "./DomainModel";
import * as R from "ramda";
import { ModelWeaveLog } from "../model/ModelDefine";
import * as _ from "lodash";


export function pushAll(model: DomainModel, logs: ModelWeaveLog[]): [DomainModel, ModelWeaveLog[]] {
    const find = model.entities.find(R.propSatisfies(R.complement(R.isNil), 'extends'))
    if (find) {
        const [newModel, log] = push(model, find)
        return pushAll(newModel, _(logs).concat(log).value())
    } else {
        return [model, logs]
    }
}

function getEntity(model: DomainModel, name: string): Entity | undefined {
    return model.entities.find(R.propEq('name', name))
}

function push(model: DomainModel, entity: Entity): [DomainModel, ModelWeaveLog] {
    if (entity.extends) {
        const target = getEntity(model, entity.extends)
        if (target) {
            //TODO 处理冲突，同名的property 需要一个合并策略。
            entity.properties.forEach(_ => target.properties.push(_))
            return [{
                entities: model.entities.filter(R.complement(R.propEq('name', entity.name))),
                enums: model.enums
            }, { logItem: `Injected - form entity/${entity.name} to entity/${target.name}` }]
        } else {
            throw new Error(`no such entity - ${target}`)
        }
    } else {
        throw new Error('no extends find')
    }
}
