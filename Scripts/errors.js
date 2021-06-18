const notifyUserOfError = (error) => {
	let request = new NotificationRequest("rescript format failed");
	
	request.title = nova.localize("rescript format was unsuccessful");
	request.body = nova.localize(`It failed with the following error (see Extension Console for more details):\n\n${error}`);
	
	console.log('request', request)
	
	let promise = nova.notifications.add(request);
	promise.then(reply => {}, error => {
		console.error(error);
	});
}

exports.notifyUserOfError = notifyUserOfError;