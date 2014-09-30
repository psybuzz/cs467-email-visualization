/**
 * Credits:
 * https://github.com/mscdex/node-imap
 */

var Secret = require('./secret');
var Imap = require('imap'),
inspect = require('util').inspect;

var imap = new Imap({
	user: Secret.user,
	password: Secret.password,
	host: 'imap.gmail.com',
	port: 993,
	tls: true
});

function openInbox(cb) {
	imap.openBox('INBOX', true, cb);
}

function errlog(err){
	console.log(err ? err : 'Done.');
}

imap.on('error', errlog);
imap.once('end', errlog);

imap.connect();



// Export a module with a getMail function.
module.exports = {
	/**
	 * Whether or not the imap object has connected and authenticated.
	 * @type {Boolean}
	 */
	ready: false,

	/**
	 * A queue for callbacks that are waiting for the imap to connect.
	 */
	queuedCallbacks: [],

	/**
	 * Gets the mail for the user and returns a promise.
	 * @return {Q.promise} The promise for the mail data.
	 */
	getMail: function (callback){
		if (!this.ready){
			if (callback){
				this.queuedCallbacks.push(callback);
			}
		} else {
			openInbox(function(err, box) {
				if (err) throw err;
				var f = imap.seq.fetch('1:10', {
					bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
					struct: true
				});

				var messages = [];
				f.on('message', function(msg, seqno) {
					var buffer = '';
					msg.on('body', function(stream, info) {
						stream.on('data', function(chunk) {
							buffer += chunk.toString('utf8');
						});
					});
					msg.once('end', function() {
						messages.push(buffer);
					});
				});

				f.once('error', errlog);
				f.once('end', function() {
					console.log('Done fetching all messages!');

					// Save the messages and call the callback.
					module.exports.messages = messages;
					callback(messages);

					// Close the connection.
					imap.end();
				});
			});
		}
	}
};

// Call the functions that were waiting for the imap to be ready.
imap.once('ready', function() {
	module.exports.ready = true;

	module.exports.getMail(function (){
		for (var i = 0; i < module.exports.queuedCallbacks.length; i++) {
			module.exports.queuedCallbacks[i](module.exports.messages);
		}
	});
});
