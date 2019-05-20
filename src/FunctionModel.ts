

export interface FunctionModel {
    functions: Function[]
}

interface Function {
    menuPath: string[]
    base: {
        resource: string
        crud: string
    }
    filters: Filter[]
    orders: Order[]
    actions: Action[]
    fields: {
        prefills: {
            name: string
            prefill: Prefill
        }[]
        hiddens: string[]
    }
}

interface Filter {
    express: string

}
interface Order{
    express:string
}

interface Action {
    name: string
}
interface Prefill {
    value: string
}