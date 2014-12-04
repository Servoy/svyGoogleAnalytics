/**
 * @type {scopes.svyGoogleAnalytics.GASession}
 *
 * @properties={typeid:35,uuid:"938D7000-CB56-4540-8A99-4EE8EE50A631",variableType:-4}
 */
var session = scopes.svyGoogleAnalytics.getClientSession();

/**
 * @enum 
 * @public 
 * 
 * @properties={typeid:35,uuid:"FA93C89E-7D64-4531-82E4-93B7962B7DFA",variableType:-4}
 */
var PAGES = {
	HOME: 1,
	PRODUCT_A: 2,
	PRODUCT_B: 3
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"E54AB71D-9269-431A-9C5F-FBCEE2449BE2"}
 */
function onShow(firstShow, event) {
	// Track the page at onShow
	session.trackPageView(controller.getName(), 'Layout A', null)
}

/**
 * Switch page menu
 * 
 * @param {Number} page
 * @public 
 * 
 *
 * @properties={typeid:24,uuid:"CC755D7D-3D6E-4694-8E29-0F8C8332A705"}
 */
function showPage(page) {
	if (page < 1 || page > 3) {
		throw new scopes.svyExceptions.IllegalArgumentException('Cannot show page. Page ' + page+ 'does not exists !')
	} else {
		elements.tabless.tabIndex = page
	}
}
