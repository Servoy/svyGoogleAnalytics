/**
 * @type {scopes.svyGoogleAnalytics.GASession}
 *
 * @properties={typeid:35,uuid:"B08A6BCF-1756-4AFC-8DD7-E64792CC9426",variableType:-4}
 */
var session = scopes.svyGoogleAnalytics.getClientSession()


/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"8989EBF8-B46A-4FB8-AA56-068FA09C519C"}
 */
function onShow(firstShow, event) {
	// Track the page at onShow
	session.trackPageView(controller.getName(), 'Layout A Home', null)
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"DE3A09D0-6FCF-4B14-A897-807A318D5E66"}
 */
function showProductA(event) {
	forms.layoutA.showPage(forms.layoutA.PAGES.PRODUCT_A)
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"97F05B6D-FC7F-4708-8897-4EDFA3A4C212"}
 */
function shotProductB(event) {
	forms.layoutA.showPage(forms.layoutA.PAGES.PRODUCT_B)
}

