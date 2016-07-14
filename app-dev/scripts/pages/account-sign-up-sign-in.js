(function () {
	var $bP = $('.popup-layers-back-plate');
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

			buttonSubmit.disabled = !allInputsAreValid;
		}
	});


	$('[button-action="sign-in"]').on('click', function(event) {
		console.error('sign-in');
	});

	$('[button-action="sign-up"]').on('click', function(event) {
		console.error('sign-up');
	});

	$('[button-action="fetch-sms-vcode"]').on('click', function(event) {
		console.error('fake logic triggered.');
		$bP.show();
		$pL1.show();
	});

	$pL1.find('[button-action="confirm"]').on('click', function(event) {
		$bP.hide();
		$pL1.hide();
	});


	$('#credit-abstract-pane .operations button').on('click', function(event) {
		$bP.show();
		$pL2.show();
	});

	$pL2.find('[button-action="confirm"]').on('click', function(event) {
		$bP.hide();
		$pL2.hide();
	});
})();