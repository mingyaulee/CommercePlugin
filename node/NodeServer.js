const http = require('http');
const url = require('url');
const childProcess = require('child_process');
const process = require('process');
const path = require('path');
const nodeWindows = require('node-windows');

function runScript(scriptName, argsObj, callback, elevate) {
	const args = [];
	if (argsObj) {
		for (let i in argsObj) {
			args.push('-' + i + ' ' + argsObj[i]);
		}
	}
	let cmd;
	if (elevate) {
		cmd = path.join(__dirname, 'functions', 'Elevate.ps1') + ' -scriptPath "' + 
			  path.join(__dirname, 'functions', scriptName + '.ps1') + '" ' + (args.length ? ' ' + args.join(' ') : '');
	} else {
		cmd = path.join(__dirname, 'functions', scriptName + '.ps1') + (args.length ? ' ' + args.join(' ') : '');
	}
	const child = childProcess.spawn('powershell.exe', [ cmd ]);
	let success = true;
	const outputData = [];
	child.stdout.on("data", function (data) {
		const dataStr = data.toString().trim();
		if (dataStr !== "") {
			outputData.push(data.toString().trim());
		}
	});
	child.stderr.on("data", function (data) {
		const dataStr = data.toString().trim();
		if (dataStr !== "") {
			outputData.push(data.toString().trim());
		}
		success = false;
	});
	child.on("exit", function () {
		callback(success, outputData);
	});
	child.stdin.end();
}

function stringifyOutput(response, success, data) {
	response.end(JSON.stringify({
		success: success,
		data: data
	}));
}

http.createServer(function (request, response) {
	response.writeHead(200, {'Content-Type': 'text/plain'});
	const queryData = url.parse(request.url, true).query;
	const action = (queryData.action || "").toLowerCase();
	switch (action) {
		case "resolvehostname":
			runScript("AddHost", { hostName: queryData.hostName, mapIpFromHostName: queryData.mapIpFromHostName }, stringifyOutput.bind(this, response), true);
			break;
		case "sendkeystochrome":
			runScript("SendKeysToChrome", { hostName: queryData.hostName }, stringifyOutput.bind(this, response));
			break;
		case "restart":
			stringifyOutput(response, true, []);
			process.exit();
			break;
		default:
			response.end("-");
			break;
	}
}).listen(8088);