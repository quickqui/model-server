
import * as express from "express";
import * as bodyParser from 'body-parser'

import deploy, { insuringProject } from './data/Deploy'
import { domainToPlanUml } from "./uml/domainToPlanUml";
import { functionsToPlantUml } from "./uml/functionsToPlantUml";
import { useCaseToPlantUml } from "./uml/useCaseToPlantUml";
import axios from "axios"
import { toPrismaSchemaString } from "./data/PrimsaDataSchema";
import { ModelManager } from "./model/ModelManager";
import { sourceToPlantUml, modelToPlantUml } from "./uml/PlantUml";
import { env } from "./Env";
import { Model } from "@quick-qui/model-core";



const app = express();
const port = 1111; // default port to listen

const modelProjectDir = env.modelProjectDir
const modelManager = new ModelManager({ protocol: "folder", resource: modelProjectDir + "/model" })

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


app.get("/logs", async function (req, res, next) {
    try {
        const logs = modelManager.getBuildLogs()
        res.status(200).json(logs)
    } catch (e) {
        next(e);
    }
});

app.post("/model/refresh", async function (req, res, next) {
    try {
        modelManager.refresh()
        res.status(201).send("refresh success")
    } catch (e) {
        next(e);
    }
})


app.get("/uml/sources/:id", async function (req, res, next) {

    try {
        const model = await modelManager.getSource()
        if (model) {
            const startUML = sourceToPlantUml(model)
            const rep = await axios.post(platumlServiceUrl, startUML)
            res.status(200).json({ id: 1, source: rep.data })
        } else
            res.status(404).send("no model source")
    } catch (e) {
        next(e);
    }
})

app.get("/uml/models/:id", async function (req, res, next) {

    try {
        const model = await modelManager.getOriginalModel() as  any
        if (model) {
            const startUML = modelToPlantUml(model)
            const rep = await axios.post(platumlServiceUrl, startUML)
            res.status(200).json({ id: 1, source: rep.data })
        } else
            res.status(404).send("no model")
    } catch (e) {
        next(e);
    }
})

app.get("/uml", async function (req, res, next) {
    try {
        const model = (await modelManager.getModel()) as  any

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
        const model = await modelManager.getModel() as  any
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
        const model = await modelManager.getModel() as any
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
        const model = await modelManager.getModel() as  any
        if (model.functionModel) {
            const startUML = useCaseToPlantUml(model.functionModel)
            const rep = await axios.post(platumlServiceUrl, startUML)
            res.status(200).json({ id: 1, source: rep.data })
        } else
            res.status(404).send("no function model")
    } catch (e) {
        next(e);
    }
})

app.post("/deploy", async function (req, res, next) {
    try {
        const model = await modelManager.getModel() as  any
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
        const model = await modelManager.getModel() as  any
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
        const model = await modelManager.getModel() as  any
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




