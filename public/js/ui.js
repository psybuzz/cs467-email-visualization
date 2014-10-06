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

	/**
	 * How many people circles to show.
	 */
	peopleCount: 15,

	/**
	 * How many people to show in each list.
	 */
	listSize: 5,
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
	$('#results').hide();
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
	
	//demo of ticking
	createSVG2(.1,"30 min",.3,"50 min",.5,"90 min",.9,"10 min",.1, "25 min",.25,"FriendA");
	createSVG2(.1,"15 min",.15,"10 min",.1,"90 min",.9,"40 min",.4, "70 min",.7,"FriendB");
	createSVG2(.1,"90 min",.9,"70 min",.7,"50 min",.5,"30 min",.3, "10 min",.1,"FriendC");
	createSVG2(.1,"10 min",.1,"30 min",.3,"50 min",.5,"70 min",.7, "90 min",.9,"FriendD");
	
	// Display the loaded data.
	displayLoadedData();
});

$loadDataBtn.click(function (){
	if (!UI.loadingData){
		UI.loadingData = true;
		this.innerText = UI.LOADING_TEXT;

		// Request the data.
		$.post(
				'/data',
				{
					username: $('#username-input').val(),
					password: $('#password-input').val()
				},
				function (data){
					UI.loadingData = false;
					resetSvgContainer();
					console.log(data);

					// Reset the default button text.
					$loadDataBtn.text(UI.LOAD_BUTTON_DEFAULT_TEXT);

					// Set the state in memory.
					state.contacts = data.contacts;
					state.emailCount = data.emailCount;
					state.responseTimes = data.responseTimes;
					state.monthTimes = data.monthTimes;
					state.monthCounts = data.monthCounts;
					state.hourTimes = data.hourTimes;

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



// Constants.
UI.LOAD_BUTTON_DEFAULT_TEXT = 'Load Real Data';
UI.LOADING_TEXT = 'Loading, please wait...';
UI.MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
