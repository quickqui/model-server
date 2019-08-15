import { ModelRepository } from "../model/ModelRepository";

import * as path from 'path'

import { FolderRepository } from "./FolderRepository";
import { env } from "../Env";

// 利用惯有package管理方法引入model文件，比如npm引入model文件，然后从./node_modules之类的相关文件夹获得model文件。

interface Libaray {
    type: string, dir: string, module: string
}
// 利用惯有package管理方法引入model文件，比如npm引入model文件，然后从./node_modules之类的相关文件夹获得model文件。

export class LibarayRepository {
    static async build(libaray: Libaray): Promise<ModelRepository> {
        let folder: string | undefined = undefined;
        if (libaray.type === 'npm') {
            //TODO use path.join 来兼容windows。
            //TODO 有没有可能不在modelProjectDir/node_modules里面？
            // folder = path.dirname(require.resolve(libaray.module+"/package.json")); + '/' + libaray.dir
            
            folder = env.modelProjectDir + "/node_modules/" + libaray.module + "/" + libaray.dir
        }
        if (folder)
            return FolderRepository.build(folder,
                `libaray source - ${JSON.stringify(libaray)}`,
                libaray.module)
        throw new Error(`no such ${JSON.stringify(libaray)}`)
    }
}

