import { DataModel } from "./DataSchema";
import { FunctionModel } from "./FunctionModel";

export interface Model {
    dataModel:DataModel | undefined
    functionModel: FunctionModel | undefined
}