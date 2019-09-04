import { DomainModel, Entity } from "./DomainModel";
import * as R from "ramda";
import { ModelWeaveLog } from "../model/ModelDefine";
import * as _ from "lodash";
import { Model } from "../model/Model";



export function forEachEntity(model: Model,fun:(entity: Entity)=>[Entity, ModelWeaveLog?]) :[Model, ModelWeaveLog[]]{
    const entities = model.domainModel!.entities;
    let logs: ModelWeaveLog[] = [];
    let newEntities: Entity[] = [];
    entities.forEach(entity => {
        let [en, log] = fun(entity);
        newEntities.push(en);
        if (log)
            logs.push(log);
    });
    return [{
        ...model, domainModel: {
            ...model.domainModel!,
            entities: newEntities,
        }
    }, logs];
}

export function pushAll(model: DomainModel, logs: ModelWeaveLog[]): [DomainModel, ModelWeaveLog[]] {
    const find = model.entities.find(R.propSatisfies(R.complement(R.isNil), 'inject'))
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
    if (entity.inject) {
        const target = getEntity(model, entity.inject)
        if (target) {
            //TODO 处理冲突，同名的property 需要一个合并策略。
            entity.properties.forEach(_ => target.properties.push(_))
            return [{
                entities: model.entities.filter(R.complement(R.propEq('name', entity.name))),
                enums: model.enums
            }, new ModelWeaveLog(  `Injected - form entity/${entity.name} to entity/${target.name}` )]
        } else {
            throw new Error(`no such entity - ${target}`)
        }
    } else {
        throw new Error('no inject find')
    }
}
