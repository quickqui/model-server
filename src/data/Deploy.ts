

import request from 'graphql-request'


import * as ulog from 'ulog'
const log =ulog.log('Deploy')

/*
input DeployInput {
  name: String!
  stage: String!
  types: String!
  dryRun: Boolean
  secrets: [String!]
  subscriptions: [FunctionInput!]
  force: Boolean
  clientMutationId: String
}

type DeployPayload {
  errors: [SchemaError!]!
  migration: Migration
  warnings: [SchemaWarning!]!
  clientMutationId: String
}

*/

interface Project {
    name: string
    stage: string
}

const url = 'http://prisma:4466/management'

//TODO migration返回里面有挺多需要关注的，后续看新的prisma有没有变化
export default function deploy(typeDefines: string, project: Project = { name: "default", stage: "default" },
    dryRun: Boolean = true, force: Boolean = false): Promise<object> {
    const query = `
        mutation Deploy($input: DeployInput!){
            deploy(input: $input){
                migration{
                    status
                }
                errors{
                    type,
                    field,
                    description
                }
                warnings{
                    type,
                    field,
                    description
                }
            }
        }
    `
    const queryInput = {
        types: typeDefines,
        force,
        dryRun,
        ...project
    }
    log.debug(typeDefines)
    return request(url, query, { input: queryInput }).then((rep) => {
        log.debug(rep)
            (rep as any).deploy.errors.forEach((e) => {
                log.error(e)
            })
        return rep
    })
}



export function insuringProject(project: Project = { name: "default", stage: "default" }): Promise<object> {

    /*
    name: String!
    stage: String!
    secrets: [String!]
    */
    const queryInput = {
        secrets: [],
        ...project
    }
    const query = `
        mutation AddProject($input: AddProjectInput!){
            addProject(input: $input){
                project{
                    name
                }
            }
        }
    `
    return request(url, query, { input: queryInput })

}