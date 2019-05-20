
import { parseFromSchema, DataModel } from './DataSchema'




import * as express from "express";
import * as fs from 'fs'
import * as shell from 'shelljs'
import * as bodyParser from 'body-parser'
import { FunctionModel } from './FunctionModel';
import * as yaml from 'js-yaml'



const app = express();
const port = 1111; // default port to listen
app.use(bodyParser.text());

app.get("/model", (req, res) => {
    //TODO 从 git repository 拉取。
    const dModelsource = fs.readFileSync(__dirname + '/../datamodel.prisma').toString()
    const dmodel: DataModel = parseFromSchema(dModelsource)
    const fModelSource = fs.readFileSync(__dirname + '/../functionModel.yml').toString()
    const fmodel: FunctionModel = yaml.safeLoad(fModelSource)
    const model = {
        dataModel: dmodel,
        functionModel: fmodel
    }
    res.status(200).json(model)
})

// define a route handler for the default home page
// app.get("/dataModel", (req, res) => {
//     // render the index template
//     const source = fs.readFileSync(__dirname + '/../datamodel.prisma').toString()
//     const model: DataModel = parseFromSchema(source)
//     res.status(200).json(model)
// });
// app.get("/dataModelFile", (req, res) => {
//     const source = fs.readFileSync(__dirname + '/../datamodel.prisma').toString()
//     res.status(200).send(source)
// })

// app.put("/dataModelFile", (req, res) => {
//     const body = req.body
//     //TODO 校验
//     fs.writeFileSync(__dirname + '/../datamodel.prisma', body)
//     res.status(202).send(body)
// })

app.post("/deploy/force", (req, res) => {
    const result = shell.exec("npx prisma deploy --force")
    if (result.stdout.includes("export DEBUG")) {
        res.status(512).send(result.stdout)
    } else {
        res.status(202).send(result.stdout)
    }
})

app.post("/deploy", (req, res) => {
    const result = shell.exec("npx prisma deploy")
    if (result.stdout.includes("export DEBUG")) {
        res.status(512).send(result.stdout)
    } else {
        res.status(202).send(result.stdout)
    }
})


// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});



// server.start(() => console.log('Server is running on http://localhost:4000'))

