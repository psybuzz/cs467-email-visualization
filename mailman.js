/**
 * Credits:
 * https://github.com/mscdex/node-imap
 */

var Secret = require('./secret');
var Imap = require('imap'),
inspect = require('util').inspect;
var imap;

function initializeMailman (user, pass, limit) {
	// Reset the mailman.
	module.exports.ready = false;
	module.exports.queuedCallbacks = [];
	
	imap = new Imap({
		user: user,
		password: pass,
		host: 'imap.gmail.com',
		port: 993,
		tls: true
	});

	imap.on('error', function (err){
		errlog('Initialization error', err);
	});
	imap.once('end', function (err){
		errlog('Ending error', err);
	});

	imap.connect();

	// Set the message limit.
	module.exports.limit = limit;

	// Call the functions that were waiting for the imap to be ready.
	imap.once('ready', function() {
		console.log('Mailman: okay, now I am ready.')
		module.exports.ready = true;

		if (module.exports.queuedCallbacks.length > 0){
			module.exports.getMail(function (){
				for (var i = 0; i < module.exports.queuedCallbacks.length; i++) {
					module.exports.queuedCallbacks[i](module.exports.messages);
				}
			});
		}
	});
}

function openInbox(cb) {
	imap.openBox('[Gmail]/All Mail', true, cb);
}

function errlog(err){
	console.log(err ? err : 'Done.');
}


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
	 * The number of messages to retrieve.
	 * @type {Number}
	 */
	limit: undefined,

	/**
	 * A function to initialize the mailman again.
	 */
	initialize: initializeMailman,

	/**
	 * Tries to connect to the mailbox.
	 */
	connect: function (callback){
		// Try to connect now if mailman is ready.
		if (module.exports.ready){
			callback();
		} else {
			// Otherwise wait until it is ready.
			module.exports.queuedCallbacks.push(function (messages){
				callback(messages);
			});
		}
	},

	/**
	 * Gets the mail for the user and returns a promise.
	 */
	getMail: function (callback, count, failback){
		if (!module.exports.ready){
			console.log('Mailman not ready...')
			if (callback){
				module.exports.queuedCallbacks.push(callback);
			}
		} else {
			console.log('Mailman ready...go!');
			var startTime = Date.now();

			openInbox(function(err, box) {
				if (err) {
					console.log(err);
					if (typeof failback !== 'undefined'){
						failback();
					}
					return;
				}
				var total = box.messages.total;

				// Reset the count, as it may have changed.
				count = module.exports.limit;

				// Fetch X messages by default.
				if (typeof count === 'undefined'){
					count = total - 1;
				}

				var f = imap.seq.fetch(Math.max(1, total-count)+':'+total, {
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

				f.once('error', function () {
					errlog('Fetch error.');
					if (typeof failback !== 'undefined'){
						failback();
					}
				});
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
