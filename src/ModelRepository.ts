import { Model } from "./Model";
import { FolderRepository } from "./FolderRepository";

export interface ModelRepository {
    readonly model: Model
    readonly dataModelSource: string
}


export function modelRepository():  Promise<FolderRepository> {
   return FolderRepository.build(__dirname+"/../model")
}