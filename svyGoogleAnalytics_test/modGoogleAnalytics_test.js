/**
 * The tracking code with which to test.
 * Edit this to change GA accounts
 * @type {String}
 * @private 
 * @properties={typeid:35,uuid:"1F99C632-6EFE-437B-9857-6B8D4B289297"}
 */
var GA_TRACKING_CODE = 'UA-30376830-1';

/**
 * Test the session object construction and instance methods
 * Test 
 * @properties={typeid:24,uuid:"0413647F-233E-45CE-8FCD-DF4A01509C3C"}
 */
function testGoogleAnalytics(){
	var session = scopes.svyGoogleAnalytics.initSession(GA_TRACKING_CODE);
	jsunit.assertEquals('Test session construction', session.trackingCode, GA_TRACKING_CODE);
	
	//	test request instance w/ callback
	var req = session.createRequest();
	req.requestType = scopes.svyGoogleAnalytics.GA_REQUEST_TYPES.PAGE_VIEW;
	req.pageTitle = 'testPageTitle';
	req.pageRequest = 'testPageRequest';
	req.referral = 'testReferral';
	req.execute(function(statusCode){
		jsunit.assertEquals('GA Callback',plugins.http.HTTP_STATUS.SC_OK,statusCode);
	});
	
	//	test resume
	var firstVisit = session.firstVisit;
	var previousVisit = session.previousVisit;
	var currentVisit = session.currentVisit;
	var sessionCount = session.sessionCount;
	scopes.svyGoogleAnalytics.destroySession();
	application.sleep(100);
	session = scopes.svyGoogleAnalytics.initSession(GA_TRACKING_CODE,true);
	jsunit.assertEquals('Test Session Resume',session.previousVisit,currentVisit);
	jsunit.assertEquals('Test Session Resume',session.sessionCount,sessionCount + 1);
	jsunit.assertEquals('Test Session Resume',session.firstVisit, firstVisit);
	jsunit.assertTrue('Test Session Resume',session.previousVisit > previousVisit);
	jsunit.assertTrue('Test Session Resume',session.currentVisit > currentVisit);
	
	//	tear down
	scopes.svyGoogleAnalytics.destroySession();
	
}