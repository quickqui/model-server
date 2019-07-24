
import * as express from "express";
import * as bodyParser from 'body-parser'

import { repository } from './repository/ModelRepository';
import deploy, { insuringProject } from './data/Deploy'
import { domainToPlanUml, functionsToPlantUml, usecaseToPlantUml } from "./uml/PlantUml";
import axios from "axios"



const app = express();
const port = 1111; // default port to listen

const platumlServiceUrl = 'http://plantuml-service:1608/svg';


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
            res.status(200).send(domainToPlanUml(re.model.domainModel))
        else
            res.status(404).send("no domain model")
    } catch (e) {
        next(e);
    }
});
app.get("/uml/entities/:id", async function (req, res, next) {
    //:id （暂时）是假的
    try {
        const re = await repository
        if (re.model.domainModel) {
            const startUML = domainToPlanUml(re.model.domainModel)
            const rep = await axios.post(platumlServiceUrl, startUML)
            res.status(200).json({ id: 1, source: rep.data })
        } else
            res.status(404).send("no domain model")
    } catch (e) {
        next(e);
    }
})
app.get("/uml/functions/:id", async function (req, res, next) {
    //:id （暂时）是假的

    try {
        const re = await repository
        if (re.model.functionModel) {
            const startUML = functionsToPlantUml(re.model.functionModel)
            const rep = await axios.post(platumlServiceUrl, startUML)
            res.status(200).json({ id: 1, source: rep.data })
        } else
            res.status(404).send("no function model")
    } catch (e) {
        next(e);
    }
})

app.get("/uml/usecases/:id", async function (req, res, next) {
    //:id （暂时）是假的

    try {
        const re = await repository
        if (re.model.functionModel) {
            const startUML = usecaseToPlantUml(re.model.functionModel)
            const rep = await axios.post(platumlServiceUrl, startUML)
            res.status(200).json({ id: 1, source: rep.data })
        } else
            res.status(404).send("no function model")
    } catch (e) {
        next(e);
    }
})
//TODO 从容器外获取model文件。
//比如从 git repository 拉取。
//TODO 使用prisma 管理api来deploy。
app.post("/deploy", async function (req, res, next) {
    try {
        const re = await repository
        try {
            await insuringProject()
        } catch (e) { }
        const result = await deploy(re.dataModelSource,undefined,false, false)
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
})

app.post("/deploy/dry", async function (req, res, next) {
    try {
        const re = await repository
        try {
            await insuringProject()
        } catch (e) { }
        const result = await deploy(re.dataModelSource,undefined,true, false)
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
})

app.post("/deploy/force", async function (req, res, next) {
    try {
        const re = await repository
        const result = await deploy(re.dataModelSource, undefined, false, true)
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
})

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});




