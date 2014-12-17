/**
 * @type {scopes.svyGoogleAnalytics.GASession}
 *
 * @properties={typeid:35,uuid:"BA01E669-578E-4EF0-90E8-3B9343CA2180",variableType:-4}
 */
var session = scopes.svyGoogleAnalytics.getClientSession();

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"A27624B2-6D6A-40E8-B19A-F83BAC7852D0"}
 */
var purchased

/**
 * Get LayoutA pageTitle
 * @type {String}
 *
 * @properties={typeid:35,uuid:"3D7845ED-83D4-4D87-9CB1-F0DBFA913A87"}
 */
var pageTitle = forms.layoutA.pageTitle

/**
 * Use the full context path as pageRequest URL
 * @type {String}
 *
 * @properties={typeid:35,uuid:"7DECA933-90C5-41E9-9BF4-574413D151D5"}
 */
var pageRequest =  forms.layoutA.pageRequest + '/ProductB'

/**
 * @enum
 *
 * @properties={typeid:35,uuid:"0FC8D368-55FF-4DFC-ACCD-65991101EB6B",variableType:-4}
 */
var OFFERS = {
	TRIAL: 'trial',
	PREMIUM: 'premium',
	ENTERPRISE: 'enterprise'
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"13C067C6-8C5C-4BFC-A65B-52A42DE65F1F"}
 */
function onShow(firstShow, event) {
	// Track GA at page onShow
	session.trackPageView(pageTitle, pageRequest)
	refreshUI()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"AF385713-170B-45BA-B6A4-0622111E7207"}
 */
function btnBuyTrial(event) {
	session.trackEvent(pageTitle, pageRequest, null, 'Buy-B', 'Trial', 'Buy Product B Trial', 'FREE')
	purchased = OFFERS.TRIAL
	refreshUI()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"194E4626-18C7-4D25-9A5A-4575D4E88DA2"}
 */
function btnBuyPremium(event) {
	session.trackEvent(pageTitle, pageRequest, null, 'Buy-B', 'Premium', 'Buy Product B Premium', '75')
	purchased = OFFERS.PREMIUM
	refreshUI()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"92B82845-3C58-4E8C-8973-DA607E3DD68F"}
 */
function btnBuyEnterprise(event) {
	session.trackEvent(pageTitle, pageRequest, null, 'Buy-B', 'Enterprise', 'Buy Product B Enterprise', '125')
	purchased = OFFERS.ENTERPRISE
	refreshUI()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"B69237B3-68E9-41E5-9814-CD1DDD51E266"}
 */
function btnShowHome(event) {
	forms.layoutA.showPage(forms.layoutA.PAGES.HOME)
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"55803817-AEF5-4260-A588-D61D67D6EDEF"}
 */
function btnShowProductA(event) {
	forms.layoutA.showPage(forms.layoutA.PAGES.PRODUCT_A)
}

/**
 * @properties={typeid:24,uuid:"158D8EB9-3395-4624-AFC9-765D0FDC854E"}
 */
function refreshUI() {
	var COLORS = scopes.svyGoogleAnalytics_demo.COLORS

	var trial = elements.btnTrial
	var premium = elements.btnPremium
	var enterprise = elements.btnEnterprise

	// change the button color background depending on the selected item
	if (purchased) {
		trial.bgcolor = COLORS.GRAY
		trial.border = 'LineBorder, 1,' + COLORS.GRAY
		premium.bgcolor = COLORS.GRAY
		premium.border = 'LineBorder, 1,' + COLORS.GRAY
		enterprise.bgcolor = COLORS.GRAY
		enterprise.border = 'LineBorder, 1,' + COLORS.GRAY

		switch (purchased) {
		case OFFERS.TRIAL:
			trial.bgcolor = COLORS.GREEN
			break;
		case OFFERS.PREMIUM:
			premium.bgcolor = COLORS.GREEN
			premium.border = 'LineBorder, 1,' + COLORS.GREEN
			break;
		case OFFERS.ENTERPRISE:
			enterprise.bgcolor = COLORS.GREEN
			enterprise.border = 'LineBorder, 1,' + COLORS.GREEN
			break;
		default:
			break;
		}
	}
}
