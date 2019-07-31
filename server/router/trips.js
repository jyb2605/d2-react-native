const key = require('../model/key')
const db_con = require('../model/db_con')()
const request = require('request')
const multer = require('multer')

async function routes (fastify, options) {

  fastify.post('/register', async (req, res) =>  {
    var authorization = req.headers.authorization;
    var userNo = req.body.userNo

    var result = new Object()

    var check = {
        url: "https://openapi.naver.com/v1/nid/verify",
        headers: {'Authorization': 'Bearer ' + authorization }
     };

    request.get(check, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body)

        if(body.resultcode == "00"){
            var connection = db_con.init()

            stmt = "SELECT EXISTS (SELECT * FROM users WHERE no = " + userNo + ") AS exist"
            connection.query(stmt, function (err, db_result){
                 if (db_result[0].exist == 1) {
                      stmt = "INSERT INTO trips(user_no, begin_timestamp) VALUES(" + userNo + ", NOW());"
                      connection.query(stmt, function (err, db_result){
                             stmt = "SELECT last_insert_id() as userNo FROM trips limit 1;"
                             connection.query(stmt, function (err, db_result){

                                  result.code = 200
                                  result.message = "일지 등록 성공"
                                  result.tripNo = db_result[0].userNo

                                  res.header('content-type', 'application/json').code(200).send(result)

                             })
                      })
                 }// user no 유효
                 else{
                      result.code = 301
                      result.message = "유효하지 않은 사용자 번호"

                      res.header('content-type', 'application/json').code(301).send(result)
                 }// user no 유효 X
            })
        }// 토큰 유효
      } else {
        result.code = 300
        result.message = "토큰 인증 실패"

        res.header('content-type', 'application/json').code(300).send(result)
      }
    })// end request
    })// end /register

  fastify.put('/:trip_no', async (req, res) =>  {
    var authorization = req.headers.authorization;
    var tripNo = req.params.trip_no;

    var title = req.body.title;
    var location = req.body.location;

    var result = new Object()

    var check = {
        url: "https://openapi.naver.com/v1/nid/verify",
        headers: {'Authorization': 'Bearer ' + authorization }
     };

    request.get(check, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body)

        if(body.resultcode == "00"){
            var connection = db_con.init()

            stmt = "SELECT EXISTS (SELECT * FROM trips  WHERE no = " + tripNo + ") AS exist"
            connection.query(stmt, function (err, db_result){
                 if (db_result[0].exist == 1) {
                      stmt = "UPDATE trips SET title = \'" + title + "\', location = \'" + location + "\', end_timestamp = NOW() WHERE no = " + tripNo + ";"
                      console.log(stmt)
                      connection.query(stmt, function (err, db_result){
                          result.code = 200
                          result.message = "일지 수정 성공"

                          res.header('content-type', 'application/json').code(200).send(result)
                      })
                }// trip no 유효
                 else{
                      result.code = 301
                      result.message = "유효하지 않은 일지 번호"

                      res.header('content-type', 'application/json').code(301).send(result)
                 }// trip no 유효 X
            })
        }// 토큰 유효
      } else {
        result.code = 300
        result.message = "토큰 인증 실패"

        res.header('content-type', 'application/json').code(300).send(result)
      }
    })// end request
  })// end /:trip

  fastify.get('/', async (req, res) =>  {
    var authorization = req.headers.authorization;
    var result = new Object()

    var search = req.query.search;
    var type = req.query.type;
    var userNo = req.query.userNo;

    var check = {
        url: "https://openapi.naver.com/v1/nid/verify",
        headers: {'Authorization': 'Bearer ' + authorization }
     };

    request.get(check, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body)

        if(body.resultcode == "00"){
            var connection = db_con.init()

            stmt = "SELECT title, location, begin_timestamp, end_timestamp FROM trips WHERE (title LIKE \'%" + search + "%\' OR location LIKE \'%" + search + "%\')"

            if(type == "ME"){
              stmt += " AND user_no = " + userNo
            }

            console.log(stmt)

            connection.query(stmt, function (err, db_result){
                result.trips = new Array()

                for(var idx = 0; idx < db_result.length; idx++){
                    tmp = new Object()
                    tmp.title = db_result[idx].title
                    tmp.location = db_result[idx].location
                    tmp.begin_timestamp = db_result[idx].begin_timestamp
                    tmp.end_timestamp = db_result[idx].end_timestamp

                    result.trips.push(tmp)
                }

                result.code = 200
                result.message = "일지 조회 성공"

                res.header('content-type', 'application/json').code(200).send(result)
            })
        }// 토큰 유효
        else{
            result.code = 300
            result.message = "토큰 인증 실패"

            res.header('content-type', 'application/json').code(300).send(result)
        }// 토큰 유효 X
      } else {
        result.code = 300
        result.message = "토큰 인증 실패"

        res.header('content-type', 'application/json').code(300).send(result)
      }
    })// end request
  })// end /

}

module.exports = routes
