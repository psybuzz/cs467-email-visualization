var Mailman = require('./mailman');

Mailman.getMail(function (messages) {
	console.log('***', messages)
});