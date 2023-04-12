export default ({ env }) => ({
  scheme: env('WEAVIATE_SCHEME', 'http'),
  host: env('WEAVIATE_HOST', 'localhost'),
  port: env.int('WEAVIATE_PORT', 8080),
})
