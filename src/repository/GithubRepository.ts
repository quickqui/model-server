import { ModelRepository } from "../model/ModelRepository";
import { FolderRepository } from "./FolderRepository";
import * as temp from 'temp'
import * as githubdown from 'github-download'
import nanoid = require("nanoid")
import { mkdirSync, existsSync } from "fs";

export class GithubRepository {
    static async build(github: object): Promise<ModelRepository> {
        //downlao from github to temp_dir
        const tempdir = ('/usr/app/tmp')

        if (!existsSync(tempdir)){
            mkdirSync(tempdir);
        }
        //TODO 需要在更广泛的docker环境测试。
        //TODO tempfile 可能需要remove
        const tempfile = tempdir+'/' + nanoid()
        const downloade = await new Promise((resolve, reject) => {
            githubdown((github as any).url, tempfile)
                .on('error', function (err) {
                    console.error(err)
                    reject(err)
                })
                .on('end', function () {
                    resolve('success')
                })
        })
        console.log(downloade)
        return FolderRepository.build(tempfile + '/' + (github as any).dir)
    }
}