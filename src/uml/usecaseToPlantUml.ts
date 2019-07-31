import { FunctionModel } from "../function/FunctionModel";
export function usecaseToPlantUml(functionModel: FunctionModel): string {
    return "@startuml\n\n" +
        functionModel.functions.map((fun) => {
            return (fun.roles || []).map((role) => {
                return `:${role}: -> (${fun.name})`;
            }).join("\n");
        }).join("\n\n")
        + "\n\n@enduml";
}
