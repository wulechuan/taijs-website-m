(function () {
	var $pL1 = $('#pl-info-too-many-vcodes-today');
	var $pL2 = $('#pl-input-image-vcode');




	$('.panel').each(function () {
		var $panel = $(this);
		var $allRequiredInputs = $panel.find('input[required], textarea[required], [contentEditable="true"][required]');
		var buttonSubmit = $panel.find('[button-action="submit"]')[0];

		var allInputsAreValid = false;

		var allInputValidations = [];
		for (var i = 0; i < $allRequiredInputs.length; i++) {
			allInputValidations[i] = false;
		}


		_validateAllRequiredInputs();


		$allRequiredInputs.each(function (index) {
			var tnlc = this.tagName.toLowerCase();

			if (tnlc === 'input') {
				var type = this.type.toLowerCase();
				if (type === 'checkbox') {
					$(this).on('change', function () {
						allInputValidations[index] = this.checked;
						_validateAllRequiredInputs();
					});
				} else {
					$(this).on('input', function () {
						allInputValidations[index] = !!this.value.replace(/(^\s+|\s+$)/, '');
						_validateAllRequiredInputs();
					});
				}
			} else if (tnlc === 'textarea') {
				$(this).on('input', function () {
					allInputValidations[index] = !!this.value.replace(/(^\s+|\s+$)/, '');
					_validateAllRequiredInputs();
				});
			} else {
				// not implemented yet
			}
		});


		function _validateAllRequiredInputs() {
			allInputsAreValid = true;
			for (var i = 0; i < allInputValidations.length; i++) {
				allInputsAreValid = allInputsAreValid && allInputValidations[i];
			}

			if (buttonSubmit) buttonSubmit.disabled = !allInputsAreValid;
		}
	});


	$('[button-action="sign-in"]').on('click', function(event) {
		console.log('sign-in');
	});

	$('[button-action="sign-up"]').on('click', function(event) {
		console.log('sign-up');
	});


	var $thePL = $pL1;
	$('[button-action="fetch-sms-vcode"]').on('click', function(event) {
		console.error('fake logic triggered.');
		$thePL[0].elements.$popupLayersBackPlate.show();
		$thePL.show();
	});
})();