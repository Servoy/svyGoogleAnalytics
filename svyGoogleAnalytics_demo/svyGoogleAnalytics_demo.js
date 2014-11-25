/**
 * @enum 
 * 
 * @properties={typeid:35,uuid:"60389FB2-152F-46CB-B6F9-A8FE45C24397",variableType:-4}
 */
var COLORS = {
	BLUE: "#3498db",
	DARKBLUE: "#0080c0",
	GREEN: "#5cb85c",
	DARKGREEN : "#4cae4c",
	GRAY: "#e6e6e6",
	DARKGRAY: "#717171"
}


/**
 * The tracking code with which to test.
 * Edit this to change GA accounts
 * @type {String}
 * @private 
 * @properties={typeid:35,uuid:"D035A37D-76BF-4171-A067-DC6AAF21DA29"}
 */
var GA_TRACKING_CODE = 'UA-56952164-1';

/**
 * Callback method for when solution is opened.
 * When deeplinking into solutions, the argument part of the deeplink url will be passed in as the first argument
 * All query parameters + the argument of the deeplink url will be passed in as the second argument
 * For more information on deeplinking, see the chapters on the different Clients in the Deployment Guide.
 *
 * @param {String} arg startup argument part of the deeplink url with which the Client was started
 * @param {Object<Array<String>>} queryParams all query parameters of the deeplink url with which the Client was started
 *
 * @properties={typeid:24,uuid:"475F412D-2AEB-41AF-9554-5057FD29F47D"}
 */
function onSolutionOpen(arg, queryParams) {
	if (!scopes.svyGoogleAnalytics.initSession(GA_TRACKING_CODE)) {
		throw new scopes.svyExceptions.IllegalStateException('GA cannot init session !')
	}
}

