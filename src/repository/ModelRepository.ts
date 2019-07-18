import { Model } from "../Model";
import { FolderRepository } from "./FolderRepository";

export interface ModelRepository {
    readonly model: Model
    readonly dataModelSource: string
}


export const repository = FolderRepository.build(__dirname+"/../../model")

// export function modelRepository():  Promise<FolderRepository> {
//    return FolderRepository.build(__dirname+"/../../model")
// }