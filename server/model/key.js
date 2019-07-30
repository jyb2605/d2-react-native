
exports.getNaverKey = function () {
	clientId = 'TrZoTzoGpm2QeFvmy6Rf'
	clientSecret = '0v4WCvSd2c'

	result = new Object()
	result.client_id = clientId
	result.client_secret = clientSecret
	

	return result;
}

exports.getDBInfo = function() {
	host = 'localhost'
	user = 'root'
	password = '1q2w3e4r'
	port = 3306

	result = new Object()
	result.host = host
	result.user = user
	result.password = password
	result.port = port

	return result;
}
