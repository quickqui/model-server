
import {parseFromSchema} from './DataSchema'

import * as http from 'http'

// const prisma = new Prisma()


// const server = new GraphQLServer({
//   typeDefs: './src/schema.graphql',
//   resolvers,
//   context: { prisma },
// } as any)

const jsonContent:string = JSON.stringify(parseFromSchema())
http.createServer(function(request, response) {
  response.writeHead(200, {
  'Content-Type': 'text/json',
  'Access-Control-Allow-Origin': '*',
  'X-Powered-By':'nodejs'
      });
  response.write(jsonContent);
  response.end();
      }
).listen(1111);

// server.start(() => console.log('Server is running on http://localhost:4000'))

