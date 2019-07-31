import { ModelSource } from "../source/ModelSource";
import * as R from "ramda";
import { Model } from "../model/Model";

function getIndex<T>(source: T, all: T[]): number | undefined {
    return all.indexOf(source)
}


export function sourceToPlantUml(sources: ModelSource[]): string {
    return `@startuml\n\n` +
        R.addIndex(R.map)((source, index) => {
            return `object ${index}{
            description = "${JSON.stringify((source as any).description)}"
        }`
        }, sources).join("\n")
        + "\n\n" +
        sources.map(source =>
            source.includeSources.map(included =>
                `${getIndex(source, sources)} --> ${getIndex(included, sources)} : include`))
            .flat().join("\n")
        +
        `\n\n@enduml\n`
}

export function modelToPlantUml(model: Model): string {
    const models:any[] =((model.domainModel&& model.domainModel.entities ||[]) as any[])
    .concat(model.domainModel && model.domainModel.enums || [])
    .concat(model.functionModel && model.functionModel.functions || [])
    return `@startuml\n\n` +
    (model.domainModel?  model.domainModel.entities.map(entity => `object ${entity.name} {
        type = "entity"
    }`).join("\n") :'') +"\n"+
    (model.functionModel?  model.functionModel.functions.map(fun => `object ${fun.name} {
        type = "function"
    }`).join("\n") :'')
    +"\n"+
        models.map(model => model.extends ?`${model.name} --> ${model.extends} : extends`:'').join("\n")
    +
    `\n\n@enduml\n`
}