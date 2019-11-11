import { ModelRepository } from "../model/ModelRepository";

import * as path from "path";

import { FolderRepository } from "./FolderRepository";
import { env } from "../Env";

interface Library {
  type: string;
  dir: string;
  module: string;
}
// 利用惯有package管理方法引入model文件，比如npm引入model文件，然后从./node_modules之类的相关文件夹获得model文件。

export class LibraryRepository {
  static async build(library: Library): Promise<ModelRepository> {
    let folder: string | undefined = undefined;
    if (library.type === "npm") {
      folder = path.join(
        env.modelProjectDir,
        "node_modules",
        library.module,
        library.dir
      );
    }
    if (folder)
      return FolderRepository.build(
        folder,
        `library source - ${JSON.stringify(library)}`,
        library.module
      );
    throw new Error(`no such ${JSON.stringify(library)}`);
  }
}
