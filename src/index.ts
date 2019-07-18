
import * as express from "express";
import * as bodyParser from 'body-parser'

import { repository } from './repository/ModelRepository';
import deploy from './data/Deploy'
import { toPlantUml } from "./uml/PlantUml";



const app = express();
const port = 1111; // default port to listen
app.use(bodyParser.text());

app.get("/model", async function (req, res, next) {
    try {
        const re = await repository
        res.status(200).json(re.model)
    } catch (e) {
        next(e);
    }
});


app.get("/uml", async function (req, res, next) {
    try {
        const re = await repository
        if (re.model.domainModel)
            res.status(200).send(toPlantUml(re.model.domainModel))
        else 
            res.status(404).send("no domain model")
    } catch (e) {
        next(e);
    }
});

//TODO 从容器外获取model文件。
//比如从 git repository 拉取。
//TODO 使用prisma 管理api来deploy。
app.post("/deploy", async function (req, res, next) {
    try {
        const re = await repository
        const result = await deploy(re.dataModelSource)
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
})


app.post("/deploy/force", async function (req, res, next) {
    try {
        const re = await repository
        const result = await deploy(re.dataModelSource, false, true)
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
})

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});




