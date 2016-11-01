$(function () { // fake logics
	var app = window.taijs.app;
	var URIParameters = app.data.URIParameters;
	var wlc = window.webLogicControls;
	var UI = wlc.UI;


	var $pl1 = $('#pl-ti-yan-jin-availability-prompt');
	var $pl2 = $('#pl-ti-yan-jin-proceeded-prompt');


	var pl1 = $pl1[0];
	var pl2 = $pl2[0];

    if (URIParameters.experienceProceeded) {
		UI.popupLayersManager.show(pl2);
    } else
	// if (URIParameters.firstTimeLogin)
	{
		UI.popupLayersManager.show(pl1);
	}

	// $pl1.on('click', function (event) {
	// 	// var el = event.target;
	// 	// if ((el.getAttribute('button-action') === 'call-to-action')) {
	// 		UI.popupLayersManager.hide(pl1);
	// 	// }
	// });
});