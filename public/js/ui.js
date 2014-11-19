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
	createSVG(.1,"20 min",.2,"April", 'monthContainer');
	createSVG(.1,"10 min",.1,"May", 'monthContainer');
	createSVG(.1,"15 min",.15,"June", 'monthContainer');
	createSVG(.1,"30 min",.3,"July", 'monthContainer');
	createSVG(.1,"50 min",.5,"August", 'monthContainer');
	
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

	if (window.innerWidth > 640){
		$('#top-list').html('' +
				'<div class="col">' +
					'<span class="list-title">People I respond <span class="fast">quickly</span> to</span>' +
					'<ul id="mine-fast"><li><span class="time" data-value="1">1 min:</span> jonny.x@linkedin.com</li><li><span class="time" data-value="4">4 min:</span> adeline@gmail.com</li><li><span class="time" data-value="5">5 min:</span> prc@uiuc.edu</li><li><span class="time" data-value="7">7 min:</span> norman.c@uiuc.edu</li><li><span class="time" data-value="7">7 min:</span> maks@uiuc.edu</li></ul>' +
					'<span class="list-title">People who respond <span class="fast">quickly</span> to me</span>' +
					'<ul id="theirs-fast"><li><span class="time" data-value="23">23 sec:</span> jobs@google.com</li><li><span class="time" data-value="25">25 sec:</span> it-help@illinois.edu</li><li><span class="time" data-value="1">1 min:</span> mrstuart@linkedin.com</li><li><span class="time" data-value="1">1 min:</span> ipod@illinois.edu</li><li><span class="time" data-value="2">2 min:</span> dragonista@gmail.com</li></ul>' +
				'</div>' +
				'<div class="col">' +
					'<span class="list-title">People I respond <span class="slow">slowly</span> to</span>' +
					'<ul id="mine-slow"><li><span class="time" data-value="879">879 days:</span> whoami@gmail.com</li><li><span class="time" data-value="428">428 days:</span> wongfu@gmail.com</li><li><span class="time" data-value="395">395 days:</span> curryandpasta@gmail.com</li><li><span class="time" data-value="381">381 days:</span> meet1232132@gmail.com</li><li><span class="time" data-value="318">318 days:</span> pmonrose@illinois.edu</li></ul>' +
					'<span class="list-title">People who respond <span class="slow">slowly</span> to me</span>' +
					'<ul id="theirs-slow"><li><span class="time" data-value="443">443 days:</span> mystery@uiuc.edu</li><li><span class="time" data-value="196">196 days:</span> joe.doe@gmail.com</li><li><span class="time" data-value="187">187 days:</span> lorem.ipsum2@gmail.com</li><li><span class="time" data-value="159">159 days:</span> adacraft332@gmail.com</li><li><span class="time" data-value="116">116 days:</span> jamescp@gmail.com</li></ul>' +
				'</div>');
	} else {
		$('#top-list').html('' +
				'<div class="col">' +
					'<span class="list-title">People I respond <span class="fast">quickly</span> to</span>' +
					'<ul id="mine-fast"><li><span class="time" data-value="1">1 min:</span> jonny.x@linkedin.com</li><li><span class="time" data-value="4">4 min:</span> adeline@gmail.com</li><li><span class="time" data-value="5">5 min:</span> prc@uiuc.edu</li><li><span class="time" data-value="7">7 min:</span> norman.c@uiuc.edu</li><li><span class="time" data-value="7">7 min:</span> maks@uiuc.edu</li></ul>' +
					'<span class="list-title">People who respond <span class="fast">quickly</span> to me</span>' +
					'<ul id="theirs-fast"><li><span class="time" data-value="23">23 sec:</span> jobs@google.com</li><li><span class="time" data-value="25">25 sec:</span> it-help@illinois.edu</li><li><span class="time" data-value="1">1 min:</span> mrstuart@linkedin.com</li><li><span class="time" data-value="1">1 min:</span> ipod@illinois.edu</li><li><span class="time" data-value="2">2 min:</span> dragonista@gmail.com</li></ul>' +
					'<span class="list-title">People I respond <span class="slow">slowly</span> to</span>' +
					'<ul id="mine-slow"><li><span class="time" data-value="879">879 days:</span> whoami@gmail.com</li><li><span class="time" data-value="428">428 days:</span> wongfu@gmail.com</li><li><span class="time" data-value="395">395 days:</span> curryandpasta@gmail.com</li><li><span class="time" data-value="381">381 days:</span> meet1232132@gmail.com</li><li><span class="time" data-value="318">318 days:</span> pmonrose@illinois.edu</li></ul>' +
					'<span class="list-title">People who respond <span class="slow">slowly</span> to me</span>' +
					'<ul id="theirs-slow"><li><span class="time" data-value="443">443 days:</span> mystery@uiuc.edu</li><li><span class="time" data-value="196">196 days:</span> joe.doe@gmail.com</li><li><span class="time" data-value="187">187 days:</span> lorem.ipsum2@gmail.com</li><li><span class="time" data-value="159">159 days:</span> adacraft332@gmail.com</li><li><span class="time" data-value="116">116 days:</span> jamescp@gmail.com</li></ul>' +
				'</div>');
	}

	$('#svgContainer').html(
			'<h2>Johnny Smith</h2>' +
			'<h2>Adeline Gable</h2>' +
			'<h2>Norman Wiggins</h2>');

	// Add listener for faster scrolling.
	$('.svgDiv').click(function (e){
		var next = $(this).next()[0];
		if (next) next.scrollIntoView();
	});

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
