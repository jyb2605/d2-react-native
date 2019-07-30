const key = require('../model/key')
const db_con = require('../model/db_con')()
const request = require('request');

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
                      stmt = "UPDATE trips SET  WEHRE no = " + tripNo
                      connection.query(stmt, function (err, db_result){
                             stmt = "SELECT last_insert_id() as userNo FROM trips limit 1;"
                             connection.query(stmt, function (err, db_result){

                                  result.code = 200
                                  result.message = "일지 등록 성공"
                                  result.tripNo = db_result[0].userNo

                                  res.header('content-type', 'application/json').code(200).send(result)

                             })
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
  })// end /register

  fastify.get('/paths', async (req, res) =>  {
    var authorization = req.headers.authorization;
    var result = new Object()

    var tripNo = req.query.tripNo;

    var check = {
        url: "https://openapi.naver.com/v1/nid/verify",
        headers: {'Authorization': authorization }
     };

    request.get(check, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body)

        if(body.resultcode == "00"){
            var connection = db_con.init()

            stmt = "SELECT EXISTS (SELECT * FROM trips WHERE no = " + tripNo + ") AS exist"
            connection.query(stmt, function (err, db_result){
                 if (db_result[0].exist == 1) {
                      stmt = "SELECT latitude, longitude FROM locations WHERE trip_no = " + tripNo + " ORDER BY register_timestamp;"
                      result.locations = new Array()

                      connection.query(stmt, function (err, db_result){
                          for(var idx = 0; idx < db_result.length; idx++){
                              tmp = new Object()
                              tmp.latitude = db_result[idx].latitude
                              tmp.longitude = db_result[idx].longitude
                              result.locations.push(tmp)
                          }

                          result.code = 200
                          result.message = "경로 조회 성공"

                          res.header('content-type', 'application/json').code(200).send(result)
                      })
                 }// trip no 유효
                 else{
                      result.code = 301
                      result.message = "유효하지 않은 여행 번호"

                      res.header('content-type', 'application/json').code(301).send(result)
                 }// trip no 유효 X
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
  })// end /location

}

module.exports = routes
