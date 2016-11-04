$(function () { // fake logics
	var app = window.taijs.app;
	var URIParameters = app.data.URIParameters;
	var wlc = window.webLogicControls;
	var UI = wlc.UI;

	function onShowingAnyPopupMask() {
		setTimeout(function () {
			window.scrollTo(0, 0);
		}, 1);
		document.body.style.overflow = 'hidden';
	}
	function onHidingAllPopupMask() {
		document.body.style.overflow = '';
	}


	var $pl1 = $('#pl-ti-yan-jin-availability-prompt');
	var $pl2 = $('#pl-ti-yan-jin-proceeded-prompt');
	var $pl3 = $('#pl-experience-benifit-available');


	var pl1 = $pl1[0];
	var pl2 = $pl2[0];
	var pl3 = $pl3[0];

    if (URIParameters.experienceBenifitAvailable) {
		onShowingAnyPopupMask();
		UI.popupLayersManager.show(pl3);
    } else if (URIParameters.experienceProceeded) {
		onShowingAnyPopupMask();
		UI.popupLayersManager.show(pl2);
    } else // if (URIParameters.firstTimeLogin)
	{
		onShowingAnyPopupMask();
		UI.popupLayersManager.show(pl1);
	}

	// $pl1.on('click', function (event) {
	// 	// var el = event.target;
	// 	// if ((el.getAttribute('button-action') === 'call-to-action')) {
	// 		UI.popupLayersManager.hide(pl1);
	// 	// }
	// });

	$pl3.on('click', function (event) {
		var el = event.target;
		if ((el.getAttribute('button-action') === 'confirm')) {
			UI.popupLayersManager.hide(pl3);
			onHidingAllPopupMask();
		}
	});





	var $anchorExperience = $('#experience-trading-record-detail-anchor');
	var $anchorTaiJinBao = $('#tai-jin-bao-anchor');
	var buttonForExperienceTrans = $anchorExperience.find('.interaction-hot-area')[0];

	function transferingMoneyFromExperienceToTaiJinBao() {
		// ajax: transfering money from experience to tai-jin-bao
		onTransferingAjaxDone();
	}
	function onTransferingAjaxDone(result) {
		var alreadyTransferred = false;
		if (alreadyTransferred) return true;

		var $experienceBalance = $anchorExperience.find('.right .value');
		var $taiJinBaoBalance = $anchorTaiJinBao.find('.right .value');

		var experienceBalanceValue = $experienceBalance.text().replace(/\,/g, '');
		experienceBalanceValue = parseFloat(experienceBalanceValue) || 0;

		var taiJinBaoBalanceValue = $taiJinBaoBalance.text().replace(/\,/g, '');
		taiJinBaoBalanceValue = parseFloat(taiJinBaoBalanceValue) || 0;

		taiJinBaoBalanceValue += experienceBalanceValue;

		$experienceBalance.text('0');
		$taiJinBaoBalance.text(taiJinBaoBalanceValue);

		$(buttonForExperienceTrans).hide();
	}





	(function _SetupIconAnimations() {
		function buttonForExperienceTransOnClick(event) {
			playABunchOfCoinsAnimationOnce();
			transferingMoneyFromExperienceToTaiJinBao();
		}

		var leadIconSymbolCoin = $anchorExperience.find('.lead-icon .icon.js-the-symbol')[0];
		var leadIconSymbolMoneyBag = $anchorTaiJinBao.find('.lead-icon')[0];

		var theCoinOfPulse = $('.coin-of-pulse')[0];
		var aBunchOfCoinsContainer = $('.a-bunch-of-coins')[0];
		var allCoinsOfTheBunch = $(aBunchOfCoinsContainer).find('.coin');

		$anchorExperience.on('click', function (event) {
			var clickedElementWasButton = event.target === buttonForExperienceTrans;
			if (clickedElementWasButton) {
				event.preventDefault();
				event.stopPropagation();
				buttonForExperienceTransOnClick();
			}
		});

		function playABunchOfCoinsAnimationOnce() {
			theCoinOfPulse.style.display = 'none';
			aBunchOfCoinsContainer.style.display = 'block';
			leadIconSymbolCoin.style.transform = 'scale(0.01, 0.01)';

			var maxTotalDuration = 0;
			var minTotalDuration = 1000;
			for (var i=0; i<allCoinsOfTheBunch.length; i++) {
				var coin = allCoinsOfTheBunch[i];
				var aDuration = Math.random() * 0.15 + 0.7;
				var aDelay = (Math.random() - 0.5) * 0.9 + 0.9;
				var aTotalDuration = aDuration+aDelay;
				if (aTotalDuration > maxTotalDuration) maxTotalDuration = aTotalDuration;
				if (aTotalDuration < minTotalDuration) minTotalDuration = aTotalDuration;

				coin.style.animation = [
					'coin-in-a-bunch-drops-once',
					aDuration+'s',
					'ease-in',
					aDelay+'s',
					'both'
				].join(' ');
			}

			leadIconSymbolMoneyBag.style.animationDelay = (minTotalDuration - 0.1)+'s';
			$(leadIconSymbolMoneyBag).addClass('animating');

			setTimeout(function () {
				theCoinOfPulse.style.display = '';
				aBunchOfCoinsContainer.style.display = '';
				leadIconSymbolCoin.style.transform = '';
				// leadIconSymbolMoneyBag.style.animation = '';
				leadIconSymbolMoneyBag.style.animationDelay = '';
				$(leadIconSymbolMoneyBag).removeClass('animating');

				for (var i=0; i<allCoinsOfTheBunch.length; i++) {
					var coin = allCoinsOfTheBunch[i];
					coin.style.animation = ' ';
				}
			}, maxTotalDuration*1111);
		}
	})();
});