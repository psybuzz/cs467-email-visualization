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

	createSVG(.1,"30 min",.3,"January", 'monthContainer');
	createSVG(.1,"40 min",.4,"Febuary", 'monthContainer');
	createSVG(.1,"50 min",.5,"March", 'monthContainer');
	createSVG(.1,"90 min",.9,"April", 'monthContainer');
	
	createSVGlarge( " 1 min",.2,
					" 4 min",.4,
					" 5 min",.5,
					" 7 min",.7,
					" 7 min",.7,"",'contactContainer');
	data = 
	[
    {index: .7, identification: "jonnyx", value: .20, text: "jonnyx"},
    {index: .6, identification: "adeline", value: .50, text: "adeline"},
    {index: .5, identification: "prc",   value: .25, text: "prc"},
    {index: .3, identification: "norman",    value: .9, text: "norman"},
    {index: .3, identification: "maks",    value: .7, text: "maks "}
  ];
	createLegend(data);
	$('#big-stats').html('Your average response time is <span class="fast">34 days</span> (median: 2 days) ranging from 1 min to 879 days.<br>It takes others about <span class="slow">17 days</span> (median: 3 days) to respond to you ranging from 23 sec to 443 days');

	$('#top-list').html('' +
			'<div class="col">' +
				'<span class="list-title">People I respond <span class="fast">quickly</span> to</span>' +
				'<ul id="mine-fast"><li>1 min: jonny.x@linkedin.com</li><li>4 min: adeline@gmail.com</li><li>5 min: prc@uiuc.edu</li><li>7 min: norman.c@uiuc.edu</li><li>7 min: maks@uiuc.edu</li></ul>' +
				'<span class="list-title">People who respond <span class="fast">quickly</span> to me</span>' +
				'<ul id="theirs-fast"><li>23 sec: jobs@google.com</li><li>25 sec: it-help@illinois.edu</li><li>1 min: mrstuart@linkedin.com</li><li>1 min: ipod@illinois.edu</li><li>2 min: dragonista@gmail.com</li></ul>' +
			'</div>' +
			'<div class="col">' +
				'<span class="list-title">People I respond <span class="slow">slowly</span> to</span>' +
				'<ul id="mine-slow"><li>879 days: whoami@gmail.com</li><li>428 days: wongfu@gmail.com</li><li>395 days: curryandpasta@gmail.com</li><li>381 days: meet1232132@gmail.com</li><li>318 days: pmonrose@illinois.edu</li></ul>' +
				'<span class="list-title">People who respond <span class="slow">slowly</span> to me</span>' +
				'<ul id="theirs-slow"><li>443 days: mystery@uiuc.edu</li><li>196 days: joe.doe@gmail.com</li><li>187 days: lorem.ipsum2@gmail.com</li><li>159 days: adacraft332@gmail.com</li><li>116 days: jamescp@gmail.com</li></ul>' +
			'</div>');


	$('#results').show();
		toastr.success("Data Loaded Successfully")

});

$loadDataBtn.click(function (){

	var validateFlag = validation();
	if(!validateFlag){
		return //validaiton failed. 
	}
	toastr.info("Loading data for " + $("#username-input").val());


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

					// Notify user
					console.log(state)
					toastr.success("Data Loaded Successfully")
				});
	} else {
		resetSvgContainer();

		displayLoadedData();
		toastr.error("Data failed to load")
	}
});

function validation(){
	//validation
	if($("#login-form").css("display")=="none"){toastr.error("Please Click on Enter Email Login First"); return false;}
	if($("#username-input").val()=="")
	{
		toastr.error("Missing Email")
		return false;
	}
	if($("#password-input").val()=="")
	{
		toastr.error("Missing Password")
		return false;
	}
	return true;
}

// Constants.
UI.LOAD_BUTTON_DEFAULT_TEXT = 'Load Real Data';
UI.LOADING_TEXT = 'Loading, please wait...';
UI.MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
