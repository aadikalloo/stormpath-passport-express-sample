var http = require('http'),
	fs = require('fs'),
    path = require('path'),
    url = require('url');
    imageDir = '/Users/aadi/Downloads/la/';

var files1 = getImages2(imageDir); //want to send this to client
var counter = 0;

var app = http.createServer(function (request, response) {
	fs.readFile("client.html", 'utf-8', function (error, data) {
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(data);
		response.end();
	});
}).listen(8080);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) { 
	socket.on('message_to_server', function(data) { 
		var escaped_message = data["message"];
		io.sockets.emit("message_to_client", files1); 
		console.log(JSON.stringify(files1));
		console.log(counter); counter = counter + 1;
	});
});

function getImages2(imageDir) {
    var fileType = '.jpg',
        files = [], i;
    fs.readdir(imageDir, function (err, list) {
        for(i=0; i<list.length; i++) {
            if(path.extname(list[i]) === fileType) {
                files.push(list[i]); //store the file name into the array files
            }
        }
    });
    return files;
}
