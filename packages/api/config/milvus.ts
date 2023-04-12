export default ({ env }) => ({
  host: env('MILVUS_HOST', 'localhost'),
  port: env.int('MILVUS_PORT', 19530),
})
