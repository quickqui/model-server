import { Model } from "../Model";
import { FolderRepository } from "./FolderRepository";
import {Location } from '../ModelManager'

export interface ModelRepository {
    model: Model
    includes: Location[]
}

// //TODO 目前没有刷新机制？

// export let repository = FolderRepository.build(__dirname+"/../../model")

// export const refresh = ()=> {
//     repository = FolderRepository.build(__dirname+"/../../model")
// }

// // export function modelRepository():  Promise<FolderRepository> {
// //    return FolderRepository.build(__dirname+"/../../model")
// // }