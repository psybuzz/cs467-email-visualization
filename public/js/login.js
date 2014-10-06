/**
 * This file contains logic related to login credentials.
 */

$('#login-btn').click(function (){
	$('#login-form').slideToggle();
	$('#username-input').focus();
});

$('#login-form').keyup(function (e){
	if (e.keyCode === 13){
		$('#load-data-btn').click();
	}
});