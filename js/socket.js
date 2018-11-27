var ws;

function startSocket() {

	try {

		ws = new WebSocket('ws://127.0.0.1:1880');

		//连接成功回调
		ws.onopen = function() {

			//设置socket名称
			ws.send(JSON.stringify({
				type: 1,
				name: 'client_' + new Date().getTime()
			}));
		}

		//收到服务端发送的消息时，触发
		ws.onmessage = function(e) {
			console.log(e.data);
			//var data = JSON.parse(e.data);
			//switch(data.type) {

			//}

		}

		ws.onclose = function(e) {
			console.log('连接关闭');
		}

		ws.onerror = function(e) {
			console.log('发生异常');
		}
	} catch(e) {
		console.log(e.message);
	}

}

/*
 * ws.CONNECTING：0---尚未建立简介；

ws.OPEN：1---表示连接建立和通信是可能的；

ws.CLOSING：2--表示连接正在通过关闭握手；

ws.CLOSED：3--表示连接已关闭或无法打开；
		
*/

//判断当前连接状态
//ws.readyState;