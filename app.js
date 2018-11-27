// 加载所需模块
var http = require('http');
var url = require('url');
var fs = require('fs');

var log4js = require('log4js');
var express = require('express');
var app = express();

var ws = require('nodejs-websocket');

/************************************************************************Log4js: log日志输出示例 **********************************************************/

try {

	//通过configure()配置log4js
	log4js.configure({   
		appenders: {       
			ruleConsole: {
				type: 'console'
			},
			       ruleFile: {           
				type: 'dateFile',
				           filename: 'logs/server-',
				           pattern: 'yyyy-MM-dd.log',
				           maxLogSize: 10 * 1000 * 1000,
				           numBackups: 3,
				           alwaysIncludePattern: true       
			}   
		},
		   categories: {       
			default: {
				appenders: ['ruleConsole', 'ruleFile'],
				level: 'debug'
			}   
		}
	});

	var logger = log4js.getLogger('normal');
	logger.level = 'debug'; //设置输出级别

	app.use(log4js.connectLogger(logger, {
		level: log4js.levels.DEBUG
	}));

} catch(err) {
	logger.debug(err.message);
}





/********************************************************nodejs-websocket模块:websocket服务示例*************************************************************/

var server = ws.createServer(function(conn) {
	
	//console.log('New connection');

	//成功建立新连接时（握手完成后）发出。conn是Connection的一个实例
	conn.on('connection', function(conn) {

		//向终端发送链接成功确认消息
		conn.sendText("connected");
	});

	//服务端绑定 text 事件， 收到客户端发送的消息时会触发
	conn.on('text', function(str) {

		logger.debug(str);

		var data = JSON.parse(str);
		switch(data.type) {
			case 1:
				conn.nikname = data.name; //给客户端设置连接名称,可以用来标记是哪个客户端发送的消息
				break;
		}
		
		logger.debug(conn.nikname + "已连接");
		
		//收到消息后做消息广播
		boardcast('来自服务端的消息');
	});

	//客户端断开连接时触发
	conn.on('close', function(code, reason) {

		//向其他终端进行消息广播
		boardcast("连接断开");

		logger.debug(conn.nikname +"断开连接");

	});

	//连接关闭之后监听错误
	//发生错误时发出。此事件后将直接调用'close'事件
	conn.on('error', function(err) {
		//console.log(err);
		logger.debug(err);
	});

}).listen(1880);

//消息广播
function boardcast(str) {

	try {
		//connections 中包含所有的客户端连接
		//循环所有的客户端，并发送消息
		server.connections.forEach(function(conn) {
			if(conn) {
				conn.sendText(str);
			}
		});
	} catch(e) {
		console.log(e.message);
	}

}

/********************************************************************http模块: http服务示例 ************************************************************/
var host = '';
var port = 1838;

try {

	http.createServer(function(req, res) {

		var pathname = url.parse(req.url).pathname;
		//console.log('Request for ' + pathname + ' received.');

		function showPaper(path, status, type) {
			var content;

			fs.exists(path, function(exists) {

				if(exists) {
					fs.readFile(path, function(err, data) {
						if(err) {
							res.writeHeader(404, {
								'Content-Type': 'text/html;charset=utf-8'
							});
							res.write('<center><h3>Error 404: Resource not found</h3></center>');
							res.end();
						} else {
							content = data;
							res.writeHeader(status, {
								'Content-Type': type
							});
							res.write(content);
							res.end();
						}
					});
				} else {
					res.writeHeader(404, {
						'Content-Type': 'text/html;charset=utf-8'
					});
					res.write('<center><h3>Error 404: Resource not found</h3></center>');

					res.end();
				}
			});
		}

		var filename = pathname.substring(1);

		var type;
		switch(filename.substring(filename.lastIndexOf('.') + 1)) {
			case 'html':
			case 'htm':
				type = 'text/html; charset=UTF-8';
				break;
			case 'js':
				type = 'application/javascript; charset=UTF-8';
				break;
			case 'css':
				type = 'text/css; charset=UTF-8';
				break;
			case 'txt':
				type = 'text/plain; charset=UTF-8';
				break;
			case 'manifest':
				type = 'text/cache-manifest; charset=UTF-8';
				break;
			default:
				type = 'application/octet-stream';
				break;
		}

		switch(pathname) {

			//'testPage1'
			case '/view/testPage1.html':
				showPaper('./public/testPage1.html', 200, type);
				break;

				//testPage2
			case '/view/testPage2.html':
				showPaper('./view/testPage2.html', 200, type);
				break;
				
				//socketPage
			case '/view/socketPage.html':
				showPaper('./view/socketPage.html', 200, type);
				break;

				//页面中加载的资源文件（js、css、img）
			default:
				showPaper('.' + pathname, 200, type);

				break;
		}
	}).listen(1801);
} catch(e) {
	console.log(e.message);
}