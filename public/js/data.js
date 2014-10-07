/**
 * This file contains logic about data processing.
 */


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

	var overallMySum = myResponseTimeValues.reduce(function (a, b){return a+b}, 0);
	var overallTheirSum = theirResponseTimeValues.reduce(function (a, b){return a+b}, 0);

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
	$('#results').show();

	// Display month data.
	var maxMonthTimes = Math.max.apply(null, state.monthTimes);
	var maxMonthCount = Math.max.apply(null, state.monthCounts);

	$('#monthContainer').html('');
	for (var i = 0; i < 12; i++) {
		createSVG(
				state.monthCounts[i] / (maxMonthCount*5),
				prettyTime(state.monthTimes[i]),
				state.monthTimes[i] / maxMonthTimes,
				UI.MONTH_NAMES[i],
				'monthContainer');
	}


	// Display hourly data.
	var morningTimes = average(state.hourTimes.slice(5, 12));
	var afternoonTimes = average(state.hourTimes.slice(12, 21));
	var nightTimes = average(state.hourTimes.slice(0, 5).concat(state.hourTimes.slice(21)));
	var maxHourTimes = Math.max(morningTimes, afternoonTimes, nightTimes);

	console.log(morningTimes, afternoonTimes, nightTimes, maxHourTimes)
	// $('#monthContainer').html('');
	createSVG(0.1, prettyTime(morningTimes), morningTimes / maxHourTimes, 'Morning', 'hourContainer');
	createSVG(0.1, prettyTime(afternoonTimes), afternoonTimes / maxHourTimes, 'Afternoon', 'hourContainer');
	createSVG(0.1, prettyTime(nightTimes), nightTimes / maxHourTimes, 'Night', 'hourContainer');


	// Display people data.
	var peopleCount = UI.peopleCount;

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
	$('#big-stats').html(
			"Your average response time is <span class='fast'>" + 
			prettyTime(state.overallMyAvgTime) +
			"</span> (median: " + prettyTime(state.medianMyAvgTime) + ")" +
			" ranging from " +
			prettyTime(state.minMyAvgTime) +
			" to " +
			prettyTime(state.maxMyAvgTime)
			+ ".It takes others about <span class='slow'>" +
			prettyTime(state.overallTheirAvgTime) +
			"</span> (median: " + prettyTime(state.medianTheirAvgTime) + ")" +
			" to respond to you ranging from " +
			prettyTime(state.minTheirAvgTime) +
			" to " +
			prettyTime(state.maxTheirAvgTime)) +
			".";

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


	// Display top lists.
	$('#mine-fast').html(
			"<li>" + 
			mineContactSorted.slice(0, UI.listSize).map(function (el){
				return prettyTime(state.avgResponseTimes[el].mine) + ": " + el;
			}).join('</li><li>') +
			"</li>");

	$('#mine-slow').html(
			"<li>" + 
			mineContactSorted.slice(mineContactSorted.length - UI.listSize, mineContactSorted.length).map(function (el){
				return prettyTime(state.avgResponseTimes[el].mine) + ": " + el;
			}).reverse().join('</li><li>') +
			"</li>");

	$('#theirs-slow').html(
			"<li>" + 
			theirsContactSorted.slice(theirsContactSorted.length - UI.listSize, theirsContactSorted.length).map(function (el){
				return prettyTime(state.avgResponseTimes[el].theirs) + ": " + el;
			}).reverse().join('</li><li>') +
			"</li>");

	$('#theirs-fast').html(
			"<li>" + 
			theirsContactSorted.slice(0, UI.listSize).map(function (el){
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

/**
 * Returns the sum of a list.
 * @param  {Array.Number} list 	The list of numbers.
 * @return {Number}      		The sum of the list.
 */
function sum (list){
	var sum = 0;
	for (var i = 0; i < len; i++) {
		sum += list[i];
	}
	return sum;
}
