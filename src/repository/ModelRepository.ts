import { Model } from "../Model";
import { FolderRepository } from "./FolderRepository";

export interface ModelRepository {
    readonly model: Model
    readonly dataModelSource: string
}

//TODO 目前没有刷新机制？

export const repository = FolderRepository.build(__dirname+"/../../model")

// export function modelRepository():  Promise<FolderRepository> {
//    return FolderRepository.build(__dirname+"/../../model")
// }