import { ModelRepository } from "../model/ModelRepository";



import { FolderRepository } from "./FolderRepository";

//TODO 利用惯有package管理方法引入model文件，比如npm引入model文件，然后从./node_modules之类的相关文件夹获得model文件。

interface Libaray {
    type: string, name: string
}

export class LibarayRepository {
    static async build(libaray: Libaray): Promise<ModelRepository> {
        let folder: string | undefined = undefined;
        if (libaray.type === 'npm') folder = 'node_modules'
        if (folder)
            return FolderRepository.build(folder + '/' + libaray.name,
                `libaray source - ${JSON.stringify(libaray)}`,
                (libaray as any).name)
        throw new Error(`no such ${JSON.stringify(libaray)}`)
    }
}

