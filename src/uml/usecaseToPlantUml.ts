import { FunctionModel } from "../function/FunctionModel";
export function useCaseToPlantUml(functionModel: FunctionModel): string| undefined {
    const uml = functionModel.functions.map((fun) => {
        return (fun.roles || []).map((role) => {
            return `:${role}: -> (${fun.name})`;
        }).join("\n");
    }).join("\n\n")
    if (uml.trim() !== '')
        return "@startuml\n\n" + uml
            + "\n\n@enduml";
    else return undefined
}
