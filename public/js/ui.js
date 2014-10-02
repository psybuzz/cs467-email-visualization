/**
 * ui.js
 * This file contains logic for UI such as the load-data button.
 */

// Holds information about the interface.
var UI = {
	/**
	 * Whether or not we are waiting for data from the server.
	 * @type {Boolean}
	 */
	loadingData: false,
};

// Holds information about the state of data.
var state = {
	username: null,
	password: null,
	circleNum: 0,
	contacts: null,
	emailCount: null,
	responseTimes: null,
	avgResponseTimes: {},
	maxMyAvgTime: null,
	maxTheirAvgTime: null,
	minMyAvgTime: null,
	minTheirAvgTime: null,
	medianMyAvgTime: null,
	medianTheirAvgTime: null,
	overallMyAvgTime: null,
	overallTheirAvgTime: null
}

/**
 * Clears out the contents of the SVG container.
 */
function resetSvgContainer (){
	$('#big-stats').html('');
	$('#svgContainer').html('');
}

// References to common elements.
$loadDataBtn = $('#load-data-btn');
$loadFakeBtn = $('#load-fake-btn');

/**
 * Load-data button logic.
 */

$loadFakeBtn.click(function (){
	resetSvgContainer();

	createSVG(.1,"30 min",.3,"January");
	createSVG(.1,"40 min",.4,"Febuary");
	createSVG(.1,"50 min",.5,"March");
	createSVG(.1,"90 min",.9,"April");
});

$loadDataBtn.click(function (){
	if (!UI.loadingData){
		UI.loadingData = true;
		this.innerText = UI.LOADING_TEXT;

		// Request the data.
		$.post('/data', function (data){
			resetSvgContainer();
			console.log(data);

			// Reset the default button text.
			$loadDataBtn.text(UI.LOAD_BUTTON_DEFAULT_TEXT);

			// Set the state in memory.
			state.contacts = data.contacts;
			state.emailCount = data.emailCount;
			state.responseTimes = data.responseTimes;

			// Sort contacts.
			state.contacts = state.contacts.sort(function (a, b){
				return state.emailCount[a] - state.emailCount[b];
			});

			// Process the data.
			processLoadedData();

			// Display the loaded data.
			displayLoadedData();
		});
	} else {
		resetSvgContainer();

		displayLoadedData();
	}
});


/**
 * Processes the data loaded into the state.
 */
function processLoadedData (){
	// Get the average response times.
	for (var i = 0; i < state.contacts.length; i++) {
		var contact = state.contacts[i];
		var myAvgTime = average(state.responseTimes[contact].mine);
		var theirAvgTime = average(state.responseTimes[contact].theirs);

		// Record averages in state variable.
		state.avgResponseTimes[contact] = {
			mine: myAvgTime,
			theirs: theirAvgTime
		}
	}

	// Clean and extract response time values into arrays.
	var myResponseTimeValues = state.contacts.map(function (contact){
		return state.avgResponseTimes[contact].mine;
	}).filter(function (el) {
		return el > 0;
	}).sort(function (a, b) {
		return a - b;
	});

	var theirResponseTimeValues = state.contacts.map(function (contact){
		return state.avgResponseTimes[contact].theirs;
	}).filter(function (el) {
		return el > 0;
	}).sort(function (a, b) {
		return a - b;
	});;

	state.myResponseTimeValues = myResponseTimeValues;
	state.theirResponseTimeValues = theirResponseTimeValues;

	var overallMySum = myResponseTimeValues.reduce(function (a, b){return a+b});
	var overallTheirSum = theirResponseTimeValues.reduce(function (a, b){return a+b});

	// Record averages.
	state.overallMyAvgTime = overallMySum / (myResponseTimeValues.length || 1);
	state.overallTheirAvgTime = overallTheirSum / (theirResponseTimeValues.length || 1);

	// Record medians.
	state.medianMyAvgTime = myResponseTimeValues[Math.floor(myResponseTimeValues.length / 2)];
	state.medianTheirAvgTime = theirResponseTimeValues[Math.floor(theirResponseTimeValues.length / 2)];

	// Record max/min values.
	state.maxMyAvgTime = Math.max.apply(null, myResponseTimeValues);
	state.maxTheirAvgTime = Math.max.apply(null, theirResponseTimeValues);;
	state.minMyAvgTime = Math.min.apply(null, myResponseTimeValues);
	state.minTheirAvgTime = Math.min.apply(null, theirResponseTimeValues);
}

/**
 * Displays the data loaded into the state variable using SVG.
 */
function displayLoadedData (){
	var peopleCount = 50;

	var cleanContacts = state.contacts.filter(function (e){
		return state.avgResponseTimes[e].mine > 0;
	}).sort(function (a, b){
		return state.avgResponseTimes[a].mine - state.avgResponseTimes[b].mine;
	}).slice(0,peopleCount);

	var maxTime = Math.max.apply(null, cleanContacts.map(function (el){
		return state.avgResponseTimes[el].mine;
	}));

	// Create a bubble for each person.
	for (i = 0; i < Math.min(peopleCount, cleanContacts.length); i++) {
		contact = cleanContacts[i];
		myAvgTime = state.avgResponseTimes[contact].mine;
		theirAvgTime = state.avgResponseTimes[contact].theirs;

		if (myAvgTime > 0){
			// Make a circle for my average response time with this person.
			createSVG(.1, prettyTime(myAvgTime), myAvgTime / maxTime, contact);
		}
	}

	// Display big stats.
	$('#big-stats').text(
			"Your average response time is " + 
			prettyTime(state.overallMyAvgTime) +
			" (median: " + prettyTime(state.medianMyAvgTime) + " )" +
			"\nranging from " +
			prettyTime(state.minMyAvgTime) +
			" to " +
			prettyTime(state.maxMyAvgTime)
			+ ".\n\nIt takes others about " +
			prettyTime(state.overallTheirAvgTime) +
			" (median: " + prettyTime(state.medianTheirAvgTime) + " )" +
			" to respond to you\n ranging from " +
			prettyTime(state.minTheirAvgTime) +
			" to " +
			prettyTime(state.maxTheirAvgTime));

	var mineContactSorted = state.contacts.filter(function (el) {
		return state.avgResponseTimes[el].mine > 0;
	}).sort(function (a, b) {
		return state.avgResponseTimes[a].mine - state.avgResponseTimes[b].mine;
	});

	var theirsContactSorted = state.contacts.filter(function (el) {
		return state.avgResponseTimes[el].theirs > 0;
	}).sort(function (a, b) {
		return state.avgResponseTimes[a].theirs - state.avgResponseTimes[b].theirs;
	});

	$('#mine-fast').html(
			"<li>" + 
			mineContactSorted.slice(0, 10).map(function (el){
				return prettyTime(state.avgResponseTimes[el].mine) + ": " + el;
			}).join('</li><li>') +
			"</li>");

	$('#mine-slow').html(
			"<li>" + 
			mineContactSorted.slice(mineContactSorted.length - 10, mineContactSorted.length).map(function (el){
				return prettyTime(state.avgResponseTimes[el].mine) + ": " + el;
			}).join('</li><li>') +
			"</li>");

	$('#theirs-slow').html(
			"<li>" + 
			theirsContactSorted.slice(theirsContactSorted.length - 10, theirsContactSorted.length).map(function (el){
				return prettyTime(state.avgResponseTimes[el].theirs) + ": " + el;
			}).join('</li><li>') +
			"</li>");

	$('#theirs-fast').html(
			"<li>" + 
			theirsContactSorted.slice(0, 10).map(function (el){
				return prettyTime(state.avgResponseTimes[el].theirs) + ": " + el;
			}).join('</li><li>') +
			"</li>");
}

// Utility functions.

/**
 * Averages a list of numbers.  Returns 0 if the list is empty.
 * @param  {Number} list An array of real valued numbers.
 * @return {Number}      The average of the list.
 */
function average (list){
	var sum = 0;
	var len = list.length;
	for (var i = 0; i < len; i++) {
		sum += list[i];
	}
	return sum / (len || 1);
}

/**
 * Converts a time number into a string with seconds, minutes, hours, or days.
 * @param  {Number} time The time to prettify.
 * @return {String}      The pretty time string.
 */
function prettyTime (time){
	if (time < 60 * 1000){
		return Math.floor(time / 1000) + ' sec';
	} else if (time < 60 * 60 * 1000){
		return Math.floor(time / (60 * 1000)) + ' min';
	} else if (time < 24 * 60 * 60 * 1000){
		return Math.floor(time / (60 * 60 * 1000)) + ' hrs';
	} else {
		return Math.floor(time / (24 * 60 * 60 * 1000)) + ' days';
	}
}


// Constants.
UI.LOAD_BUTTON_DEFAULT_TEXT = 'Load Real Data';
UI.LOADING_TEXT = 'Loading, please wait...';
