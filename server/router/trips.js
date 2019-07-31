const key = require('../model/key')
const db_con = require('../model/db_con')()
const request = require('request')
const ExifImage = require('exif').ExifImage;
const multer = require('fastify-multer')

var global_variable;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    global_variable = "tr-" + Date.now()
    cb(null, global_variable)
  }
})
const upload = multer({ storage: storage })

async function routes (fastify, options) {

  fastify.register(multer.contentParser)
  fastify.route({
    method: 'POST',
    url: '/image',
    preHandler: upload.single('file'),

    handler: function(req, reply) {
      var authorization = req.headers.authorization;
      var tripNo = req.body.tripNo
      var result = new Object()
      if(tripNo == undefined){
          result.code = 301
          result.message = "유효하지 않은 여행 번호"

          reply.header('content-type', 'application/json').code(301).send(result)
      }
      var check = {
          url: "https://openapi.naver.com/v1/nid/verify",
          headers: {'Authorization': 'Bearer ' + authorization }
       };

      request.get(check, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          body = JSON.parse(body)

          if(body.resultcode == "00"){
              try {
                  new ExifImage({ image : 'uploads/' + global_variable }, function (error, exifData) {
                      if (error)
                          console.log('Error: '+error.message);
                      else{
                          latitude = exifData.gps.GPSLatitude
                          longitude = exifData.gps.GPSLongitude
                          latitudeDD = latitude[0] + latitude[1] / 60 + latitude[2]/3600
                          longitudeDD = longitude[0] + longitude[1] / 60 + longitude[2]/3600

                          var connection = db_con.init()

                          stmt = "SELECT EXISTS (SELECT * FROM trips WHERE no = " + tripNo + ") AS exist"
                          connection.query(stmt, function (err, db_result){
                               if (db_result[0].exist == 1) {
                                    stmt = "INSERT INTO storages(image_url, trip_no, latitude, longitude, register_timestamp) VALUES( 'http://101.101.160.246/uploads/" + global_variable + "', " + tripNo + ", " + latitudeDD + ", " + longitudeDD + ", NOW() );"
                                    connection.query(stmt, function (err, db_result){
                                        result.code = 200
                                        result.message = "사진 등록 성공"

                                        reply.header('content-type', 'application/json').code(200).send(result)

                                        stmt = "SELECT LAST_INSERT_ID() as imageNo FROM storages;"
                                        connection.query(stmt, function (err, db_result){
                                              stmt = "UPDATE trips SET image_no = " + db_result[0].imageNo + " WHERE no = " + tripNo + ";"
                                              connection.query(stmt, function (err, db_result){

                                              })
                                        })


                                    })
                               }// trip no 유효
                               else{
                                    result.code = 301
                                    result.message = "유효하지 않은 여행 번호"

                                    reply.header('content-type', 'application/json').code(301).send(result)
                               }// trip no 유효 X
                          })
                      }
                  });
              } catch (error) {
                console.log('Error: ' + error.message);
              }
          }
        } else {
            result.code = 300
            result.message = "토큰 인증 실패"

            res.header('content-type', 'application/json').code(300).send(result)
          }
        })// end request
    }
  })

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
    if(search == undefined)
        search = ""
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

            stmt = "SELECT title, location, begin_timestamp, end_timestamp, trips.no, SUB.image_url FROM trips" +
                  " LEFT JOIN (SELECT image_url, no, trip_no FROM storages) SUB " +
                  "ON trips.image_no = SUB.no AND trips.no = SUB.trip_no " +
                  "WHERE (title LIKE \'%" + search + "%\' OR location LIKE \'%" + search + "%\')"
            if(type == "ME"){
              stmt += " AND user_no = " + userNo
            }

            connection.query(stmt, function (err, db_result){
                result.trips = new Array()

                for(var idx = 0; idx < db_result.length; idx++){
                    tmp = new Object()
                    tmp.title = db_result[idx].title
                    tmp.location = db_result[idx].location
                    tmp.begin_timestamp = db_result[idx].begin_timestamp
                    tmp.end_timestamp = db_result[idx].end_timestamp
                    tmp.tripNo = db_result[idx].no
                    tmp.image_url = db_result[idx].image_url
                    if(tmp.image_url == null){
                        tmp.image_url = 'http://101.101.160.246/uploads/default.jpg'
                    }

                    result.trips.push(tmp)
                }

                result.code = 200
                result.message = "일지 리스트 조회 성공"

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
