import { ModelSource } from "../source/ModelSource";
import * as R from "ramda";
import { Model } from "@quick-qui/model-core";
import { WithDomainModel } from "../domain/DomainModel";
import { WithFunctionModel } from "../function/FunctionModel";

// function getIndex<T>(source: T, all: T[]): number | undefined {
//     return all.indexOf(source)
// }

function hashCode(name: string): string {
    let hash = 0, i, chr;
    if (name.length === 0) return '' + hash;
    for (i = 0; i < name.length; i++) {
        chr = name.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return '' + hash;
}

export function sourceToPlantUml(sources: ModelSource[]): string {
    return `@startuml\n\n` +
        R.addIndex(R.map)((source, index) => {
            const s = source as any
            return `object "${s.name}" as ${hashCode(s.name)}{
            description = "${s.description}"
        }`
        }, sources).join("\n")
        + "\n\n" +
        sources.map(source => {
            const s = source as any
            return source.includeSources.map(included =>
                `${hashCode(s.name)} --> "${hashCode((included as any).name)}" : include`)
                .flat().join("\n")
        })
        +
        `\n\n@enduml\n`
}

export function modelToPlantUml(model: Model & WithDomainModel & WithFunctionModel): string {
    const models: any[] = ((model.domainModel && model.domainModel.entities || []) as any[])
        .concat(model.domainModel && model.domainModel.enums || [])
        .concat(model.functionModel && model.functionModel.functions || [])
    return `@startuml\n\n` +
        (model.domainModel ? model.domainModel.entities.map(entity => `object ${entity.name} {
        type = "entity"
    }`).join("\n") : '') + "\n" +
        (model.functionModel ? model.functionModel.functions.map(fun => `object ${fun.name} {
        type = "function"
    }`).join("\n") : '')
        + "\n" +
        models.map(model => model.extends ? `${model.name} --> ${model.extends} : extends` : '').join("\n")
        +
        `\n\n@enduml\n`
}