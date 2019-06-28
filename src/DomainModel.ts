export interface DomainModel {  
    entities: Entity[]
    enums: Enum[]
}

interface Entity{
    properties : Property[]
}

interface Property{
    name: string
    type: string
    constraints: Constraint[]
    relations: Relation[]
}

interface Enum{
    values: string[]
}

interface Constraint{

}

interface Relation{
    
}