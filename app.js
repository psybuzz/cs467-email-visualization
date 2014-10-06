var Secret = require('./secret');
var Mailman = require('./mailman');
var express = require('express');
var port = process.env.PORT || 3000;
var fs = require('fs');
var app = express();

var server = require('http').createServer(app);		// Create a server.
server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

// Serve the static web page located in the public directory.
app.use(express.static(__dirname + '/public'));

// Use JSON request bodies.
// app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());

// Serve pre-saved email data from local files.
app.post('/data', function (req, res){
	var user = req.body.username;
	var pass = req.body.password;
	if (user.length > 0 && pass.length > 0){
		options.myAddresses = [user];

		Mailman.initialize(user, pass, options.limit);
		Mailman.connect(function (messages){
			// If we can authenticate, try to look for a file first.
			fs.readFile(user+"_"+options.outputFile, 'utf8', function (err,data) {
				if (err) {
					// Otherwise, return results fetched from server.
					try{
						var results = analyzeEmails(messages);
						res.send(results);
					}finally{};
				} else {
					var results = analyzeEmails(JSON.parse(data));
					res.send(results);
				}
			});
		});
	} else {
		fetchEmailFromFile(options.outputFile, function (messages){
			var results = analyzeEmails(messages);
			res.send(results);
		});
	}
});



// Configuration options.
var options = {
	fetchFromFile: true,
	outputFile: 'my_email.txt',
	limit: 1000,
	myAddresses: Secret.aliases || 'krestofur@gmail.com'
};

// Either fetch email data from online and save to a file, or read from a
// previously saved file.  Both paths will end with a call to analysis.
if (options.fetchFromFile){
	fetchEmailFromFile(options.outputFile);
} else {
	// Initialize with the secret.
	Mailman.initialize(Secret.user, Secret.password, options.limit);
	fetchEmailFromServer(options.outputFile, options.limit);
}



/**
 * Directly analyze the email data from a previously saved file.
 * 
 * @param  {String} outputFile The output file.
 * @param  {Function} callback The callback to be executed with the data.
 */
function fetchEmailFromFile (outputFile, callback) {
	fs.readFile(outputFile, 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}

		var messages = JSON.parse(data);
		if (typeof callback === 'undefined'){
			analyzeEmails(messages);
		} else {
			callback(messages);
		}
	});
}

/**
 * Uses the imap module via Mailman to fetch emails from the server.  After
 * writing the results to a file, it attempts to analyze the emails.
 *
 * @param {String} outputFile 	The output file.
 * @param {Number} limit 		The number of emails to get.  Leave undefined to
 *                         		get all emails.
 * @param {Function} callback 	The callback to be executed with the data.
 * @param {Function} failback 	The callback to be executed on failure.
 */
function fetchEmailFromServer (outputFile, limit, callback, failback){
	console.log('Fetching mail...');

	// We can fetch emails to be analyzed and write the results to a file.
	Mailman.getMail(function (messages){
		console.log('Done fetching messages');

		if (outputFile){
			fs.writeFile(outputFile, JSON.stringify(messages), function(err) {
				if(err) {
					console.log(err);
				} else {
					console.log("The file was saved!");
				}
			});
		}

		if (typeof callback === 'undefined'){
			analyzeEmails(messages);
		} else {
			callback(messages);
		}
	}, limit, failback);
}



/**
 * Analyzes email message data.
 * 
 * @param  {Array.Object} messages 	A list of email metadata objects.
 * @return {Object}          		A results object.
 */
function analyzeEmails (messages){
	if (!messages) return;

	var messageCount = messages.length;
	console.log('Analyzing', messages.length, 'messages...');

	var contactHash = {};
	var dateHash = {};
	var contacts = [];
	var responseSubjects = [];

	// Get a list of unique contacts whom I send emails to.
	// Also, save the dates in the TO field for each person.
	for (var i=0; i<messageCount; i++){
		var message = messages[i];
		var contact;

		// Clean the list.
		message.to = cleanAddressList(message.to);
		message.from = cleanAddressList(message.from);

		// If I am the sender and the TO field is not blank.
		if (containsMyAddress(message.from) === true && message.to){
			// Check the to fields.
			for (var j=0; j<message.to.length; j++) {
				contact = message.to[j];

				// Hash it if we haven't seen it, excluding your own address.
				if (contactHash[contact] === undefined &&
						!containsMyAddress([contact])){
					contactHash[contact] = 0;
					contactHash[contact] += 1;

					// Create array for TO dates.
					dateHash[contact] = [{date: message.date, type: 'sent'}];

					contacts.push(contact);
				} else if (!containsMyAddress([contact])){
					// Otherwise, keep track of frequencies.
					contactHash[contact] += 1;

					// Update TO date hash.
					dateHash[contact].push({date: message.date, type: 'sent'});
				}
			}
		} else if (!containsMyAddress(message.from)){
			// If I am not the sender.
			// Update the FROM date hash for people who send me emails.
		
			// Check the from fields.
			for (j=0; j<message.from.length; j++) {
				contact = message.from[j];

				// Hash the date if we have been contacted by this person.
				if (contacts.indexOf(contact) !== -1){
					if (dateHash[contact] === undefined){
						// Create array for FROM dates.
						dateHash[contact] = [{date: message.date, type: 'received'}];
					} else {
						// Update FROM date hash.
						dateHash[contact].push({date: message.date, type: 'received'});
					}
				}

				// Hash the event if we have contacted this person.
				if (contactHash[contact] !== undefined){
					contactHash[contact] += 1;
				}
			}
		}
	}

	// Filter out people with TO and FROM communications.
	contacts = contacts.filter(function (el){
		return typeof dateHash[el] !== 'undefined';
	});
	console.log('Analyzing', contacts.length, 'contacts');

	// Create space to save month/hour info.
	var monthSums = {'0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0};
	var monthCounts = {'0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0};
	var hourSums = new Array(24);
	var hourCounts = new Array(24);
	for (i = 0; i < 24; i++) {
		hourSums[i] = 0;
		hourCounts[i] = 0;
	}

	// Compute response times.
	var responseTimeHash = {};
	var responseTimes, dates, dateDiff;
	for (i = 0; i < contacts.length; i++) {
		contact = contacts[i];
		responseTimes = {mine: [], theirs: []};

		// Get an array of response times whenever a 'received' is followed by a
		// 'sent' email.
		dates = dateHash[contact];

		for (j = 1; j < dates.length; j++) {
			if (!dates[j]) continue;

			var firstDate = new Date(dates[j-1].date);
			var secondDate = new Date(dates[j].date);
			var currMonth = secondDate.getMonth();
			var currHour = secondDate.getHours();
			dateDiff = secondDate.getTime() - firstDate.getTime();

			if (dates[j-1].type === 'received' && dates[j].type === 'sent'){
				responseTimes.mine.push(dateDiff);
				monthCounts[currMonth]++;
				monthSums[currMonth] += dateDiff;
				hourCounts[currHour]++;
				hourSums[currHour] += dateDiff;

			} else if (dates[j-1].type === 'sent' && dates[j].type === 'received'){
				responseTimes.theirs.push(dateDiff);

			}
		}

		// Hash the array of response times.
		responseTimeHash[contact] = responseTimes;
	}

	console.log(responseTimes)

	// Eliminate contacts without valid response times, or only one email.
	for (i = 0; i < contacts.length; i++) {
		contact = contacts[i];

		responseTimes = responseTimeHash[contact];
		if ((responseTimes.mine.length === 0 && responseTimes.theirs.length === 0) ||
				contactHash[contact] < 2){
			// Remove the contact.
			contacts.splice(i, 1);
			delete contactHash[contact];
			delete responseTimeHash[contact];

			// Don't advance if we removed something.
			i--;
		}
	}

	// TODO: Analyze subject lines.

	console.log('Finished analyzing.');

	return {
		contacts: contacts,
		emailCount: contactHash,
		responseTimes: responseTimeHash,
		monthTimes: Object.keys(monthSums).map(function (month){
			return monthSums[month] / (monthCounts[month] || 1);
		}),
		monthCounts: Object.keys(monthSums).map(function (month){
			return monthCounts[month];
		}),
		hourTimes: hourSums.map(function (sum, i){
			return sum / hourCounts[i];
		}),
	};
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
	if (typeof list === 'undefined') return void 0;

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
