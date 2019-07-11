import { FunctionModel } from "./function/FunctionModel";
import { DomainModel } from "./domain/DomainModel";

export interface Model {
    domainModel: DomainModel | undefined
    functionModel: FunctionModel | undefined
}


/*
模型的继承通过
    1. 深度merge其base
    2. “通过“一个函数
来完成
*/
export interface Inheritable{
    readonly __base?: [String]  //可供寻址的标签
}