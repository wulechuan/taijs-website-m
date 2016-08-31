$(function () { // fake logics
	var wlc = window.webLogicControls;
	var UI = wlc.UI;


	var $pl1 = $('#pl-password-input-panel-trading');
	// var $pl2 = $('#pl-choose-bank-card');



	var FCCI = new UI.FixedCharsCountInput($pl1.find('.fixed-count-chars-input-block')[0], {
		onValid: function () {
			this.disable();
			UI.popupLayersManager.show('plpm-trading-password-verified');
			setTimeout(function () {
				location.assign('fund-sale-succeeded.html');
			}, 1500);
		}
	});




	var inputSaleAmount = $('#fund-po-sale-amount')[0];
	var vf;

	if (inputSaleAmount) {
		vf = inputSaleAmount.virtualField;
	}

	$('#button-sale-all-shares').on('click', function () {
		// $inputSaleAmount.val(4988);
		vf.setValue('4988.00');
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


	// var pl2 = $pl2[0];
	var $coveringLayerChooseBankCard = $('#cl-choosing-bank-card');

	var $chosenValuePresentor = $('#fund-po-trading-sale-confirm-choose-bank-card');
	// $('.popup-panel-body .menu-item').on('click', function () {
	// 	$chosenValuePresentor.html(this.innerHTML);
	// 	UI.popupLayersManager.hide(pl2);
	// });

	$('#fund-po-trading-sale-confirm-choose-bank-card').on('click', function(event) {
		// UI.popupLayersManager.show(pl2, event);
		showOrHideCoveryingLayer($coveringLayerChooseBankCard, true, $headerButtonNavBack, $headerButtonHideCoveringLayer);
	});

	// $pl2.on('click', function (event) {
	// 	var el = event.target;
	// 	if (el === pl2 || $(el).hasClass('nav-back')) {
	// 		UI.popupLayersManager.hide(pl2);
	// 	}
	// });


	var $headerButtonNavBack            = $('.page-header #header-nav-back');
	var $headerButtonHideCoveringLayer = $('.page-header #hide-covering-layer');


	$headerButtonHideCoveringLayer.on('click', function () {
		showOrHideCoveryingLayer($coveringLayerChooseBankCard, false, $headerButtonNavBack, $headerButtonHideCoveringLayer);
	});

	$coveringLayerChooseBankCard.find('.row').on('click', function () {
		$chosenValuePresentor.html(this.innerHTML);
		showOrHideCoveryingLayer($coveringLayerChooseBankCard, false, $headerButtonNavBack, $headerButtonHideCoveringLayer);
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