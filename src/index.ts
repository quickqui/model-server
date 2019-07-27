
import * as express from "express";
import * as bodyParser from 'body-parser'

import deploy, { insuringProject } from './data/Deploy'
import { domainToPlanUml, functionsToPlantUml, usecaseToPlantUml } from "./uml/PlantUml";
import axios from "axios"
import { toPrismaSchemaString } from "./data/PrimsaDataSchema";
import { ModelManager } from "./model/ModelManager";



const app = express();
const port = 1111; // default port to listen

const modelManager = new ModelManager({ protocol: "folder", resource: "/../model" })

const platumlServiceUrl = 'http://plantuml-service:1608/svg';


app.use(bodyParser.text());

app.get("/model", async function (req, res, next) {
    try {
        const model = await modelManager.getModel()
        res.status(200).json(model)
    } catch (e) {
        next(e);
    }
});

app.post("/model/refresh", async function (req, res, next) {
    try {
        const model = await modelManager.refresh()
        res.status(201).send("refresh success")
    } catch (e) {
        next(e);
    }
})

app.get("/uml", async function (req, res, next) {
    try {
        const model = await modelManager.getModel()
        if (model.domainModel)
            res.status(200).send(domainToPlanUml(model.domainModel))
        else
            res.status(404).send("no domain model")
    } catch (e) {
        next(e);
    }
});
app.get("/uml/entities/:id", async function (req, res, next) {
    //:id （暂时）是假的
    try {
        const model = await modelManager.getModel()
        if (model.domainModel) {
            const startUML = domainToPlanUml(model.domainModel)
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
        const model = await modelManager.getModel()
        if (model.functionModel) {
            const startUML = functionsToPlantUml(model.functionModel)
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
        const model = await modelManager.getModel()
        if (model.functionModel) {
            const startUML = usecaseToPlantUml(model.functionModel)
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
app.post("/deploy", async function (req, res, next) {
    try {
        const model = await modelManager.getModel()
        try {
            await insuringProject()
        } catch (e) { }

        const prismaSchemaSource = toPrismaSchemaString(model.domainModel!)
        const result = await deploy(prismaSchemaSource, undefined, false, false)
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
})

app.post("/deploy/dry", async function (req, res, next) {
    try {
        const model = await modelManager.getModel()
        try {
            await insuringProject()
        } catch (e) { }
        const prismaSchemaSource = toPrismaSchemaString(model.domainModel!)
        const result = await deploy(prismaSchemaSource, undefined, true, false)
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
})

app.post("/deploy/force", async function (req, res, next) {
    try {
        const model = await modelManager.getModel()
        try {
            await insuringProject()
        } catch (e) { }
        const prismaSchemaSource = toPrismaSchemaString(model.domainModel!)
        const result = await deploy(prismaSchemaSource, undefined, false, true)
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
})

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});




