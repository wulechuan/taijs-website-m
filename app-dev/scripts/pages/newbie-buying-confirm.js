$(function () { // fake logics
	var wlc = window.webLogicControls;


	var $pL1 = $('#pl-password-input-panel-trading');
	var $pL2 = $('#pl-choose-bank-card');



	new wlc.UI.SingleCharacterInputsSet($pL1.find('.single-char-inputs-set')[0], {
		onAllInputsValid: function (aggregatedValue, status, isCheckingOnLoad) {
			console.log('AWESOME! final value:', aggregatedValue);
			if (isCheckingOnLoad) console.log('What\'s better, we did nothing to get this!');
		}
	});



	$('[button-action="buy"]').on('click', function() {
		console.error('fake logic triggered.');
		var $bp = $pL1[0].elements.$popupLayersBackPlate;
		$bp.show();
		$pL1.show();
		$pL1.on('click', function (event) {
			var el = event.target;
			if (el === $pL1[0] || $(el).hasClass('button-x')) {
				$bp.hide();
				$pL1.hide();
			}
		});
	});



	$('#newbie-buying-confirm-choose-bank-card').on('click', function() {
		console.error('fake logic triggered.');
		var $bp = $pL2[0].elements.$popupLayersBackPlate;
		$bp.show();
		$pL2.show();
		$pL2.on('click', function (event) {
			var el = event.target;
			if (el === $pL2[0] || $(el).hasClass('nav-back')) {
				$bp.hide();
				$pL2.hide();
			}
		});
	});
});