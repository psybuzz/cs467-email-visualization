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
	imap.openBox('[Gmail]/All Mail', true, cb);
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
	 */
	getMail: function (callback, count){
		// Call the functions that were waiting for the imap to be ready.
		imap.once('ready', function() {
			module.exports.ready = true;

			module.exports.getMail(function (){
				for (var i = 0; i < module.exports.queuedCallbacks.length; i++) {
					module.exports.queuedCallbacks[i](module.exports.messages);
				}
			});
		});

		if (!this.ready){
			if (callback){
				this.queuedCallbacks.push(callback);
			}
		} else {
			var startTime = Date.now();

			openInbox(function(err, box) {
				if (err) throw err;
				var total = box.messages.total;

				// Fetch X messages by default.
				if (typeof count === 'undefined'){
					count = total - 1;
				}
				count = Math.min(count, total-1);

				var f = imap.seq.fetch((total-count)+':'+total, {
					bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
					struct: true,
					size: true
				});

				var messages = [];
				f.on('message', function(msg, seqno) {
					// Print number to indicate progress (when fetching
					// thousands of emails).
					if (seqno % 1000 === 0){
						console.log(seqno);
					}

					var buffer = '';
					var size = 0;
					msg.on('body', function(stream, info) {
						stream.on('data', function(chunk) {
							buffer += chunk.toString('utf8');
						});
						size += info.size;
					});
					msg.once('end', function() {
						var msgObj = Imap.parseHeader(buffer);
						msgObj['size'] = size;
						messages.push(msgObj);
					});
				});

				f.once('error', errlog);
				f.once('end', function() {
					console.log('Done fetching all messages!');
					console.log('Finished in '+((Date.now() - startTime)/1000)+' s');

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
