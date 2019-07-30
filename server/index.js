// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })

// Declare an API route
fastify.register(require('./router/users'), { prefix: '/users'})
fastify.register(require('./router/map'), { prefix: '/map'})
fastify.register(require('./router/trips'), { prefix: '/trips'})


fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000, '0.0.0.0')
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
