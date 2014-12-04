/**
 * @type {scopes.svyGoogleAnalytics.GASession}
 *
 * @properties={typeid:35,uuid:"651A8B71-6621-45E4-A6D7-F8B82AF834CB",variableType:-4}
 */
var session = scopes.svyGoogleAnalytics.getClientSession()

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"723E3339-F154-44CD-BE0C-91AD573B23A4"}
 */
var purchased

/**
 * @enum
 *
 * @properties={typeid:35,uuid:"A7C82A5E-5598-4B7B-AFA1-01C75FB9AC4B",variableType:-4}
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
 * @properties={typeid:24,uuid:"7719C683-84D4-46D5-B81C-F041770FC290"}
 */
function onShow(firstShow, event) {
	// Track GA at page onShow
	session.trackPageView(controller.getName(), 'ProductA', null)
	refreshUI()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"136EC738-6A7A-401D-92E9-767FA8018397"}
 */
function btnBuyTrial(event) {
	session.trackEvent(controller.getName(), 'LayoutA', null, 'Buy-A', 'Trial', 'Buy Product A Trial', 'FREE')
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
 * @properties={typeid:24,uuid:"F044271D-1421-4BCF-B056-117C80BCFDC3"}
 */
function btnBuyPremium(event) {
	session.trackEvent(controller.getName(), 'LayoutA', null, 'Buy-A', 'Premium', 'Buy Product A Premium', '50')
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
 * @properties={typeid:24,uuid:"2F1B0C98-4BC5-4192-9012-F36487F06B7C"}
 */
function btnBuyEnterprise(event) {
	session.trackEvent(controller.getName(), 'LayoutA', null, 'Buy-A', 'Enterprise', 'Buy Product A Enterprise', '100')
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
 * @properties={typeid:24,uuid:"CEB58228-ED9F-48D3-8BB7-71F3ADB2D61B"}
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
 * @properties={typeid:24,uuid:"29230A15-56E5-4CB2-B01E-D9F6CFCD50E7"}
 */
function btnShowProductB(event) {
	forms.layoutA.showPage(forms.layoutA.PAGES.PRODUCT_B)
}

/**
 * @properties={typeid:24,uuid:"8C6959BE-9ED0-4ACB-9054-92F65546654C"}
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
