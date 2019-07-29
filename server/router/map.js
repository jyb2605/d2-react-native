const key = require('../model/key')
const redirectURI = "http://101.101.160.246:3000/users/callback"


async function routes (fastify, options) {

  fastify.post('/', async (req, res) =>  {
    authorization = req.headers.authorization;


    const state = "djfnefdndndnddndl"
    var result = new Object()

  	naverKey = key.getNaverKey()

  	client_id = naverKey.client_id

    api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&state=' + state

    result.code = 200
    result.api_url = api_url

    res.header('content-type', 'application/json').code(200).send(authorization)

   })

}

module.exports = routes
