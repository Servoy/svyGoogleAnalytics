/**
 * @type {scopes.svyGoogleAnalytics.GASession}
 *
 * @properties={typeid:35,uuid:"8AACCFB1-32D5-4954-A12A-EB2ED413E4B4",variableType:-4}
 */
var session = scopes.svyGoogleAnalytics.getClientSession();

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"88D6B34A-1F90-48B9-85A0-56F745038424"}
 */
var pageTitle = 'LayoutB'

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"458D98A1-01C7-472E-8804-21502407F377"}
 */
var pageRequest =  application.getSolutionName() + '/' + pageTitle;

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"4C90D8BA-CA25-4169-87FE-FB129DB6BAC2"}
 */
function onShow(firstShow, event) {
	// Track the page at onShow
	session.trackPageView(pageTitle, pageRequest)
}

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"2431DC28-7911-4B09-9828-80DB33C6A965"}
 */
var purchasedA

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"0A8545DC-B10B-4500-9565-886B33774EAC"}
 */
var purchasedB

/**
 * @enum
 *
 * @properties={typeid:35,uuid:"42BDA7FB-C154-4ED1-B925-D569C32713E7",variableType:-4}
 */
var OFFERS = {
	TRIAL: 'trial',
	PREMIUM: 'premium',
	ENTERPRISE: 'enterprise'
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"7B099A36-E965-4C01-B6CE-8B56080327B8"}
 */
function btnBuyTrialA(event) {
	session.trackEvent(pageTitle, pageRequest, null, 'Buy-A', 'Trial', 'Buy Product A Trial', 'FREE')
	purchasedA = OFFERS.TRIAL
	refreshUI()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"1B53DD1F-9197-4F87-BAFB-5250E4483377"}
 */
function btnBuyPremiumA(event) {
	session.trackEvent(pageTitle, pageRequest, null, 'Buy-A', 'Premium', 'Buy Product A Premium', '50')
	purchasedA = OFFERS.PREMIUM
	refreshUI()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"50098151-58EB-40B6-83F6-CFC4E813B003"}
 */
function btnBuyEnterpriseA(event) {
	session.trackEvent(pageTitle, pageRequest, null, 'Buy-A', 'Enterprise', 'Buy Product A Enterprise', '100')
	purchasedA = OFFERS.ENTERPRISE
	refreshUI()
}

/**
 * @properties={typeid:24,uuid:"25D543E6-CF72-4ADD-BC1F-9FBBEFAB512B"}
 */
function refreshUI() {
	var COLORS = scopes.svyGoogleAnalytics_demo.COLORS

	var trial = elements.btnTrialA
	var premium = elements.btnPremiumA
	var enterprise = elements.btnEnterpriseA

	// change the button color background depending on the selected item
	if (purchasedA) {
		trial.bgcolor = COLORS.GRAY
		trial.border = 'LineBorder, 1,' + COLORS.GRAY
		premium.bgcolor = COLORS.GRAY
		premium.border = 'LineBorder, 1,' + COLORS.GRAY
		enterprise.bgcolor = COLORS.GRAY
		enterprise.border = 'LineBorder, 1,' + COLORS.GRAY

		switch (purchasedA) {
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

	// Product B
	trial = elements.btnTrialB
	premium = elements.btnPremiumB
	enterprise = elements.btnEnterpriseB

	// change the button color background depending on the selected item
	if (purchasedB) {
		trial.bgcolor = COLORS.GRAY
		trial.border = 'LineBorder, 1,' + COLORS.GRAY
		premium.bgcolor = COLORS.GRAY
		premium.border = 'LineBorder, 1,' + COLORS.GRAY
		enterprise.bgcolor = COLORS.GRAY
		enterprise.border = 'LineBorder, 1,' + COLORS.GRAY

		switch (purchasedB) {
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

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"32C8C694-A297-4622-9D12-7BE4EB8E2E13"}
 */
function btnBuyTrialB(event) {
	session.trackEvent(pageTitle, pageRequest, null, 'Buy-B', 'Trial', 'Buy Product B Trial', 'FREE')
	purchasedB = OFFERS.TRIAL
	refreshUI()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"4433DC86-0864-4967-90FB-DC92AE6BBEBE"}
 */
function btnBuyPremiumB(event) {
	session.trackEvent(pageTitle, pageRequest, null, 'Buy-B', 'Premium', 'Buy Product B Premium', '75')
	purchasedB = OFFERS.PREMIUM
	refreshUI()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"542C98B9-474E-4CE4-96E6-D21E0D6C022A"}
 */
function btnBuyEnterpriseB(event) {
	session.trackEvent(pageTitle, pageRequest, null, 'Buy-B', 'Enterprise', 'Buy Product B Enterprise', '125')
	purchasedB = OFFERS.ENTERPRISE
	refreshUI()
}

