import { InjectedWeaver } from "./DomainDefine";
import { BriefWeaver } from "./BriefWeaver";

export interface DomainModel {
    entities: Entity[]
    enums: Enum[]
}

export interface Entity  {
    name: string
    properties: Property[]
    //inject 是推模式，当前定义注入到之前模式，当前定义最终不生效。
    //TODO 考虑是否要拉模式
    inject? : string
    //TODO 随时考虑这个东西在这里的合理性。目前的用途是biref字段，严格来讲这个东西不应该是entity的属性。
    directives?: object
}

export interface Property {
    name: string
    type: string | List
    constraints?: Constraint[]
    default?: any
    relation?: Relation
}


export interface List {
    itemType: string
}

export interface Enum {
    values: string[]
}

type Constraint = string

interface Relation {
    n: 'one'|'many'
    to: string
}

