/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"94E8C7FE-ADD1-4AAC-BCC8-00F1510CFD77"}
 */
var trackingCode = 'UA-30376830-1';

/**
 * @type {scopes.modGoogleAnalytics.GASession}
 *
 * @properties={typeid:35,uuid:"7119D682-81B7-4738-9BC9-78DD9895AF81",variableType:-4}
 */
var session;

/**
 * Callback method when form is (re)loaded.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"06643D1A-9A7E-482B-A01E-C2196B21E2D4"}
 */
function onLoad(event) {
	session = new scopes.modGoogleAnalytics.GASession(trackingCode);
	var file = plugins.file.createFile('C:\\Users\\Sean\\Documents\\Servoy\\GA-Session-WC.json');
	if(file.exists()){
		var str = plugins.file.readTXTFile(file);
		var obj = JSON.parse(str);
		cloneFrom(obj);
	}
	str = JSON.stringify(session);
	plugins.file.writeTXTFile(file,str);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"107EBBEC-2B0E-4BE9-9855-E6F010E8DE4F"}
 */
function examplePageView(event) {
	session.trackPageView('testSessionData','/ga-test/sessionData',null);
}

/**
 * // TODO generated, please specify type and doc for the params
 * @param {Object} obj
 *
 * @properties={typeid:24,uuid:"9D6897F4-B7BC-43A1-B88E-0FB483684B9A"}
 */
function cloneFrom(obj){

	if(obj.trackingCode == trackingCode && session.hostNameHash == obj.hostNameHash && session.visitorID == obj.visitorID && obj.firstVisit && obj.previousVisit && obj.currentVisit && obj.sessionCount){
		session.firstVisit = obj.firstVisit;
		session.previousVisit= obj.previousVisit;
		session.currentVisit = obj.currentVisit;
		session.sessionCount = parseInt(obj.sessionCount,10);
		session.resume();
	}
}

/**
 * TODO remove when real test methods are added
 * @author Sean
 * @properties={typeid:24,uuid:"D7DA354E-946F-4749-83F3-3A252B3A6163"}
 */
function testDummy(){
	
}