(function () {
	function processParametersPassedIn() {
		var qString = location.href.match(/\?[^#]*/);
		if (qString) qString = qString[0].slice(1);

		var qKVPairs = [];
		if (qString) {
			qKVPairs = qString.split('&');
		}

		var login = false;

		for (var i in qKVPairs){
			var kvpString = qKVPairs[i];
			var kvp = kvpString.split('=');

			if (kvp[0] === 'login') login = kvp[1].toLowerCase() === 'true';
		}

		return {
			login: login
		};
	}

	var urlParameters = processParametersPassedIn();
	if (urlParameters.login) {
		$('body').addClass('user-has-logged-in');
	} else {
		$('body').removeClass('user-has-logged-in');
	}
})();