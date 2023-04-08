export default ({ env }) => ({
  host: env('REDIS_HOST', 'localhost'),
  port: env.int('REDIS_PORT', 8379),
})
