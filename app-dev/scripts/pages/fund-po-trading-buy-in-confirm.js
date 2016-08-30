$(function () { // fake logics
	var wlc = window.webLogicControls;
	var UI = wlc.UI;


	var $pl1 = $('#pl-password-input-panel-trading');
	var $pl2 = $('#pl-choose-bank-card');



	var FCCI = new UI.FixedCharsCountInput($pl1.find('.fixed-count-chars-input-block')[0], {
		onValid: function () {
			this.disable();
			UI.popupLayersManager.show('plpm-trading-password-verified');
			setTimeout(function () {
				location.assign('fund-buying-succeeded.html');
			}, 1500);
		}
	});




	var pl1 = $pl1[0];

	$('[button-action="submit"]').on('click', function(event) {
		if (event && typeof event.preventDefault === 'function') event.preventDefault();
		FCCI.clear();
		FCCI.enable();
		UI.popupLayersManager.show(pl1, event, {
			shouldNotAutoFocusAnything: true
		});
		FCCI.focus();
	});

	$pl1.on('click', function (event) {
		var el = event.target;
		if (el === pl1 || $(el).hasClass('button-x')) {
			UI.popupLayersManager.hide(pl1);
		}
	});


	var pl2 = $pl2[0];

	var $chosenValuePresentor = $('#fund-po-trading-buy-in-confirm-choose-bank-card');
	$('.popup-panel-body .menu-item').on('click', function () {
		$chosenValuePresentor.html(this.innerHTML);
		UI.popupLayersManager.hide(pl2);
	});

	$('#fund-po-trading-buy-in-confirm-choose-bank-card').on('click', function(event) {
		UI.popupLayersManager.show(pl2, event);
	});

	$pl2.on('click', function (event) {
		var el = event.target;
		if (el === pl2 || $(el).hasClass('nav-back')) {
			UI.popupLayersManager.hide(pl2);
		}
	});





	var $coveringLayer = $('#cl-funds-trading-notice');
	var $headerButtonNavBack            = $('.page-header #header-nav-back');
	var $headerButtonCloseCoveringLayer = $('.page-header #close-covering-layer');

	$('#button-show-funds-trading-notice-layer').on('click', function () {
		showOrHideCoveryingLayer($coveringLayer, true, $headerButtonNavBack, $headerButtonCloseCoveringLayer);
	});

	$headerButtonCloseCoveringLayer.on('click', function () {
		showOrHideCoveryingLayer($coveringLayer, false, $headerButtonNavBack, $headerButtonCloseCoveringLayer);
	});

	$coveringLayer.find('.row').on('click', function () {
		var bankName = $(this).find('.left')[0];
		if (bankName) {
			bankName = bankName.dataset.value;
			var vf = fakeInputBankName.virtualField;
			if (vf) {
				vf.setValue(bankName);
			} else {
				// $fakeInputBankName.val(bankName).addClass('non-empty-field'); 
			}

		}

		showOrHideCoveryingLayer($coveringLayer, false, $headerButtonNavBack, $headerButtonCloseCoveringLayer);
	});

	function showOrHideCoveryingLayer($cl, isToShow, $buttonToShowWithoutCl, $buttonToShowWithCl) {
		if (!!isToShow) {
			$cl.show();
			$buttonToShowWithCl.show();
			$buttonToShowWithoutCl.hide();
		} else {
			$cl.hide();
			$buttonToShowWithCl.hide();
			$buttonToShowWithoutCl.show();
		}
	}
});