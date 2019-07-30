const key = require('../model/key')
const redirectURI = "http://101.101.160.246:3000/users/callback"


async function routes (fastify, options) {

  fastify.get('/naver-login', async (req, res) =>  {
    const state = "djfnefdndndnddndl"
    var result = new Object()

  	naverKey = key.getNaverKey()

  	client_id = naverKey.client_id

    api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&state=' + state

    result.code = 200
    result.api_url = api_url

    res.header('content-type', 'application/json').code(200).send(result)

   })


   fastify.get('/callback', async (req, res) =>  {
       naverKey = key.getNaverKey()
       var result = new Object()

       code = req.query.code;
       state = req.query.state;

       api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
        + naverKey.client_id + '&client_secret=' + naverKey.client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;

       var request = require('request');
       var options = {
           url: api_url,
           headers: {'X-Naver-Client-Id':naverKey.client_id, 'X-Naver-Client-Secret': naverKey.client_secret}
        };
       request.get(options, function (error, response, body) {
         if (!error && response.statusCode == 200) {
           body = JSON.parse(body)

           result.code = response.statusCode
           result.token_type = body.token_type
           result.access_token = body.access_token
           result.refresh_token  = body.refresh_token

           res.header('content-type', 'application/json').code(200).send(result)

         } else {
           result.code = response.statusCode

           res.status(response.statusCode).end(result);
           console.log('error = ' + response.statusCode);
         }
       });
   });

   fastify.get('/refresh', async (req, res) =>  {
       naverKey = key.getNaverKey()
       var result = new Object()

       refreshToken = req.query.refresh_token;

       api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=refresh_token&client_id='
        + naverKey.client_id + '&client_secret=' + naverKey.client_secret + '&refresh_token=' + refreshToken;

       var request = require('request');
       var options = {
           url: api_url,
           headers: {'X-Naver-Client-Id':naverKey.client_id, 'X-Naver-Client-Secret': naverKey.client_secret}
        };
       request.get(options, function (error, response, body) {
         if (!error && response.statusCode == 200) {
           console.log(body)
           body = JSON.parse(body)

           result.code = response.statusCode
           result.token_type = body.token_type
           result.access_token = body.access_token
           result.refresh_token  = body.refresh_token

           res.header('content-type', 'application/json').code(200).send(result)
         } else {
           res.status(response.statusCode).end();
           console.log('error = ' + response.statusCode);
         }
       });
   });

}

module.exports = routes
