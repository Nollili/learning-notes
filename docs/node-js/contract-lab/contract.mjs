import {z} from 'zod';
export const Id = z.string().min(1).max(40).regex(/^[a-z0-9-]+$(?![\s\S])/);
export const Page = z.object({items:z.array(z.object({id:Id,title:z.string().min(1).max(100)}).strict()).max(20),nextCursor:Id.nullable()}).strict();
export const ApiError = z.object({error:z.object({code:z.enum(['BAD_QUERY','NOT_AUTHENTICATED','FORBIDDEN','INTERNAL_ERROR','NOT_FOUND']),message:z.string().max(120)}).strict()}).strict();
const jsonSchema = schema => {const {$schema,...value}=z.toJSONSchema(schema,{target:'draft-2020-12'});return value};
export const document = {
 openapi:'3.1.2',info:{title:'Owned catalogue fixture',version:'1.0.0'},
 jsonSchemaDialect:'https://json-schema.org/draft/2020-12/schema',
 servers:[{url:'http://127.0.0.1:3000'}],
 paths:{'/courses':{get:{operationId:'listCourses',summary:'Read the current principal’s courses',
  security:[{bearerAuth:[]}], 'x-required-scopes':['catalogue:read'],
  parameters:[{in:'query',name:'limit',schema:{type:'integer',minimum:1,maximum:20,default:10}},
   {in:'query',name:'after',schema:jsonSchema(Id)}],
  responses:Object.fromEntries([['200','Course page','Page'],['400','Invalid query','ApiError'],['401','Missing or invalid identity','ApiError'],['403','Permission denied','ApiError'],['500','Unexpected failure','ApiError']].map(([status,description,schema])=>[status,{description,content:{'application/json':{schema:{$ref:`#/components/schemas/${schema}`}}}}]))
 }}},
 components:{securitySchemes:{bearerAuth:{type:'http',scheme:'bearer'}},schemas:{Page:jsonSchema(Page),ApiError:jsonSchema(ApiError)}}
};
