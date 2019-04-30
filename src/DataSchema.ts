
import * as fs from 'fs'
import { parse, DocumentNode, ObjectTypeDefinitionNode, FieldDefinitionNode, TypeNode, DirectiveNode, ListTypeNode, NonNullTypeNode, NamedTypeNode } from 'graphql'

export function parseFromSchema(): DataModel {
    const source = fs.readFileSync(__dirname + '/../datamodel.prisma').toString()
    const document = parse(source)
    return new DataModel(document)
}


export class DataModel {
    types!: TypeDef[]
    constructor(document: DocumentNode) {
        this.types = document.definitions.filter((def) => 
             def.kind == "ObjectTypeDefinition"
        ).map((it) =>
            new TypeDef(it as ObjectTypeDefinitionNode)
        )
    }
    public type(name:string): TypeDef | undefined {
        return this.types.find((it)=>   it.name == name)
    }
}
class TypeDef {
    name!: string;
    fields!: Field[];
    directives!: Directive[];
    constructor(node: ObjectTypeDefinitionNode) {
        this.name = node.name.value
        this.fields = node.fields ? node.fields.map((it) => new Field(it)) : []
    }
}
class Directive {
    //TODO 可能需要跟relation结合起来。
    name!: string;
    constructor(node: DirectiveNode) {
        this.name = node.name.value
    }
}
class Field {
    name!: string;
    typeName!: TypeName;
    directives!: Directive[];
    constructor(node: FieldDefinitionNode) {
        this.name = node.name.value
        this.typeName = new TypeName(node.type)
        this.directives = node.directives ? node.directives.map((it) => new Directive(it)) : []
    }
}


class TypeName {
    name!: string;
    isList!: boolean;
    isNotNull!: boolean;

    constructor(node: TypeNode) {
        //TODO 需要加入一些其他情况，比如list的list
        //FIXME notnull的type没有发现
        //TODO 可能需要跟relation结合起来。
        this.name = this.getName(node)
        this.isList = this.getIsList(node)
        this.isNotNull = node.kind == "NonNullType"
    }
    getIsList(node:TypeNode):boolean {
        if (node.kind == "ListType") return true
        if (node.kind == "NonNullType") return this.getIsList((node as NonNullTypeNode).type)
        return false 
    }
    

    getName(node: TypeNode): string {
        if (node.kind == "ListType") return this.getName((node as ListTypeNode).type)
        if (node.kind == "NonNullType") return this.getName((node as NonNullTypeNode).type)
        return (node as NamedTypeNode).name.value
    }
}

