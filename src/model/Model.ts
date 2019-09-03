import { FunctionModel } from "../function/FunctionModel";
import { DomainModel } from "../domain/DomainModel";
import { PresentationModel } from "../presentation/PresentationModel";

export interface Model {
    domainModel: DomainModel | undefined
    functionModel: FunctionModel | undefined
    
}


