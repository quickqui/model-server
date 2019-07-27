import { Model } from "./Model";
import { FolderRepository } from "../repository/FolderRepository";
import {Location } from './ModelManager'

export interface ModelRepository {
    model: Model
    includes: Location[]
}

