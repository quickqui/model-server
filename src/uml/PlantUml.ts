import { DomainModel, Property } from "../domain/DomainModel";
import * as camelCase from 'camelcase';
import * as _ from 'lodash'
import { FunctionModel } from "../function/FunctionModel";


export function domainToPlanUml(domainModel: DomainModel): string {



    function typeMapping(type: any) {
        const scalars = ["string", "boolean"]
        //TODO 这里有些不对，应该是从prisma生成那边抄过来的。
        if (type.itemType) {
            return `[${type.itemType}!]`
        }
        if (scalars.includes(type)) {
            return camelCase(type, { pascalCase: true })
        }
        return type
    }
    function typeToString(property: Property): string {
        if (property.type) {
            return `${typeMapping(property.type)}`
        } else {
            if (property.relation) {
                if (property.relation.n === "one") {
                    let re = `${typeMapping(property.relation.to)}`
                    return re
                } else if (property.relation.n == "many") {
                    let re = `List[${typeMapping(property.relation.to)}]`
                    return re
                } else {
                    throw new Error(`unknown type property - ${JSON.stringify(property)}`)
                }
            } else {
                throw new Error(`unknown type property - ${JSON.stringify(property)}`)
            }
        }
    }
    function propertyToString(property: Property): string {
        //TODO 实现required、type、relation的各种组合。
        return `${property.name}: ${typeToString(property)}`
    }



    return "@startuml\n\n" +
        domainModel.entities.map((entity) => {
            return `
            class ${entity.name} {
                ${
                entity.properties.map((property) => propertyToString(property)).join("\n")
                }
            }
        `
        }).join("\n\n") +
        //relations
        domainModel.entities.map((entity) => {
            return _(entity.properties).filter(
                (p) => !(_.isUndefined(p.relation))
            ).map(
                (p) => {
                    return p.relation && p.relation.to
                }
            ).map(
                (to) => {
                    return `${entity.name} --> ${to}`
                }
            ).value().join("\n")
        }).join("\n") +

        "\n\n @enduml"
}


export function functionsToPlantUml(functionModel: FunctionModel): string {
    return "@startuml\n\n"+
    functionModel.functions.map((fun) => {
        return `state ${fun.name}`
    }).join("\n")+
    functionModel.functions.map((fun) => {
        return ( fun.links || []).map((link)=>{
             return `${fun.name} -> ${link.function} : ${link.label}`
         }).join("\n")
     }).join("\n\n") 
    +"\n\n@enduml"
}
export function usecaseToPlantUml(functionModel:FunctionModel):string{
    return  "@startuml\n\n"+
    functionModel.functions.map((fun) => {
       return ( fun.roles || []).map((role)=>{
            return `:${role}: -> (${fun.name})`
        }).join("\n")
    }).join("\n\n") 
    +"\n\n@enduml"
    
}