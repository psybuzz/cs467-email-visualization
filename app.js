var Mailman = require('./mailman');
var fs = require('fs');

// Configuration options.
var options = {
	fetchFromFile: true,
	outputFile: 'my_email.txt',
	limit: undefined,
	myAddresses: ['ekluo1@gmail.com', 'psybuzz@gmail.com', 'erikluo2@illinois.edu']
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

	var contactHash = {};
	var toDateHash = {};
	var fromDateHash = {};
	var contacts = [];

	// Get a list of unique contacts whom I send emails to.
	// Also, save the dates in the TO field for each person.
	for (var i=0; i<messageCount; i++){
		var message = messages[i];
		var contact;

		// Skip if I am not a sender, or the TO field is blank.
		if (containsMyAddress(message.from) === false || !message.to) continue;
		
		// Clean the list.
		message.to = cleanAddressList(message.to);
		
		// Check the to fields.
		for (var j=0; j<message.to.length; j++) {
			contact = message.to[j];

			// Hash it if we haven't seen it, excluding your own address.
			if (contactHash[contact] === undefined &&
					!containsMyAddress([contact])){
				contactHash[contact] = 0;
				contactHash[contact] += 1;

				// Create array for TO dates.
				toDateHash[contact] = [message.date];

				contacts.push(contact);
			} else if (!containsMyAddress([contact])){
				// Otherwise, keep track of frequencies.
				contactHash[contact] += 1;

				// Update TO date hash.
				toDateHash[contact].push(message.date);
			}
		}
	}


	// Update the FROM date hash for people who send me emails.
	for (i=0; i<messageCount; i++){
		message = messages[i];

		// Skip if I am a sender.
		if (containsMyAddress(message.from)) continue;
		
		// Clean the list.
		message.from = cleanAddressList(message.from);
		
		// Check the from fields.
		for (j=0; j<message.from.length; j++) {
			contact = message.from[j];

			// Hash the date if we have contacted this person.
			if (contacts.indexOf(contact) !== -1){
				if (fromDateHash[contact] === undefined){
					// Create array for FROM dates.
					fromDateHash[contact] = [message.date];
				} else {
					// Update FROM date hash.
					fromDateHash[contact].push(message.date);
				}
			}

			// Hash the event if we have contacted this person.
			if (contactHash[contact] !== undefined){
				contactHash[contact] += 1;
			}
		}
	}

	// Filter out people with TO and FROM communications.
	contacts = contacts.filter(function (el){
		return toDateHash[el] && fromDateHash[el];
	}).sort(function (a, b) {
		return contactHash[a] >= contactHash[b];
	});

	// Print out the contacts.
	for (i = 0; i < contacts.length; i++) {
		var contact = contacts[i];
		console.log(contact, '\t', contactHash[contact]);
	}

	console.log("\nFound", contacts.length, "people you email with.");

	// Now, what was your response time?
}

/**
 * Returns whether or not the list of contacts contains my email address.
 * 
 * @param  {Array.String} contactList 	The contacts to verify.
 * @return {boolean}             		True if the list contains my email.
 */
function containsMyAddress (contactList) {
	for (var i = 0; i < contactList.length; i++){
		for (var j = 0; j < options.myAddresses.length; j++) {
			if (contactList[i].indexOf(options.myAddresses[j]) !== -1){
				return true;
			}
		}
	}
	return false;
}

/**
 * Cleans a list of email addresses by validating them, using lowercase, and
 * removing common names.
 * 
 * @param  {Array.String} list A list of email addresses.
 * @return {Array.String}      A cleaned list.
 */
function cleanAddressList (list) {
	list = (list.length === 1) ?
				list[0].split(', ') : list;
	list = list.map(function (el) {
		if (el.indexOf('<') !== -1){
			el = el.slice(el.indexOf('<')+1, el.indexOf('>'));
		}

		return el.toLowerCase();
	}).filter(function (el){
		return el.indexOf('@') !== -1 && el.indexOf('.') !== -1;
	});

	return list;
}
