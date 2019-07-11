
import * as express from "express";
import * as bodyParser from 'body-parser'

import { modelRepository } from './repository/ModelRepository';
import deploy from './data/Deploy'



const app = express();
const port = 1111; // default port to listen
app.use(bodyParser.text());

app.get("/model", async function (req, res, next) {
    try {
        const repository = await modelRepository()
        console.log(repository.dataModelSource)
        res.status(200).json(repository.model)
    } catch (e) {
        next(e);
    }
});

//TODO 从容器外获取model文件。
//比如从 git repository 拉取。
//TODO 使用prisma 管理api来deploy。
app.post("/deploy", async function (req, res,next)  {
    try {
        const repository = await modelRepository()
        const result = await deploy(repository.dataModelSource)
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
})


app.post("/deploy/force", async function (req, res,next)  {
    try {
        const repository = await modelRepository()
        const result = await deploy(repository.dataModelSource,false,true)
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
})

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});




