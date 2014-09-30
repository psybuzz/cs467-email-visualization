var Mailman = require('./mailman');
var fs = require('fs');

// Configuration options.
var options = {
	fetchFromFile: true,
	outputFile: 'my_email.txt',
	limit: undefined,
	myEmailAddress: 'ekluo1@gmail.com'
};

// Either fetch email data from online and save to a file, or read from a
// previously saved file.  Both paths will end with a call to analysis.
if (options.fetchFromFile){
	fetchEmailFromFile(options.outputFile);
} else {
	fetchEmailFromServer(options.outputFile, options.limit);
}



/**
 * Directly analyze the email data from a previously saved file.
 * 
 * @param  {String} outputFile The output file.
 */
function fetchEmailFromFile (outputFile) {
	fs.readFile(outputFile, 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}
		
		analyzeEmails(JSON.parse(data));
	});
}

/**
 * Uses the imap module via Mailman to fetch emails from the server.  After
 * writing the results to a file, it attempts to analyze the emails.
 *
 * @param {String} outputFile 	The output file.
 * @param {Number} limit 		The number of emails to get.  Leave undefined to
 *                         		get all emails.
 */
function fetchEmailFromServer (outputFile, limit) {
	// We can fetch emails to be analyzed and write the results to a file.
	Mailman.getMail(function (messages){
		// console.log(messages);

		fs.writeFile(outputFile, JSON.stringify(messages), function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("The file was saved!");
			}
		});

		analyzeEmails(messages);
	}, limit);
}

/**
 * Analyzes email message data.
 * 
 * @param  {Array.Object} messages 	A list of email metadata objects.
 * @return {Object}          		A results object.
 */
function analyzeEmails (messages){
	var messageCount = messages.length;
	console.log('Analyzing', messages.length, 'messages...');

	// Get a list of unique contacts.
	var contactHash = {};
	var contacts = [];
	for (var i=0; i<messageCount; i++){
		var message = messages[i];
		var contact;

		// Skip if I am not a sender.
		if (containsMyAddress(message.from) === false){
			continue;
		}

		// Skip if the to field is blank.
		if (!message.to) continue;
		
		// Clean the list.
		message.to = (message.to.length === 1) ? message.to[0].split(', ') :
				message.to;
		message.to = message.to.map(function (el) {
			return el.toLowerCase();
		}).filter(function (el){
			return el.indexOf('@') !== -1 && el.indexOf('.') !== -1;
		});
		
		// Check the to fields.
		for (j=0; j<message.to.length; j++) {
			contact = message.to[j];

			// Hash it if we haven't seen it, excluding your own address.
			if (contactHash[contact] !== true &&
					contact.indexOf(options.myEmailAddress) === -1){
				contactHash[contact] = true;
				contacts.push(contact);
			}
		}
	}

	console.log(contacts, "\nFound", contacts.length, "people you sent emails to.");

	// Now, what was your response time?
}

/**
 * Returns whether or not the list of contacts contains my email address.
 * 
 * @param  {Array.String} contactList 	The contacts to verify.
 * @return {boolean}             		True if the list contains my email.
 */
function containsMyAddress (contactList) {
	for (var i = 0; i < contactList.length; i++) {
		if (contactList[i].indexOf(options.myEmailAddress) !== -1){
			return true;
		}
	}
	return false;
}
