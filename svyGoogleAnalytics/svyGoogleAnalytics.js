/*
 * The MIT License
 * 
 * This file is part of the Servoy Business Application Platform, Copyright (C) 2012-2016 Servoy BV 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */


/**
 * Base URL for GA HTTP service
 * @type {String}
 * @private 
 * @properties={typeid:35,uuid:"D0831A24-736F-4E0F-96DD-94E207302F3F"}
 */
var GA_BASE_URL = 'http://www.google-analytics.com/__utm.gif';

/**
 * Constants for google analytics request types
 * @public  
 * @enum
 * @properties={typeid:35,uuid:"0CA570F2-14DA-43BA-B78E-FC135EB55139",variableType:-4}
 */
var GA_REQUEST_TYPES = {
	
	/**
	 * Type Page view
	 */
	PAGE_VIEW:'page',
	
	/**
	 * Type Event
	 */
	EVENT:'event'
};

/**
 * @type {plugins.http.HttpClient}
 * @properties={typeid:35,uuid:"C3AEF259-9B7E-4B2F-92B9-1603AC3D75E6",variableType:-4}
 */
var client = plugins.http.createNewHttpClient();

/**
 * Instance of the current client session
 * Multiple client session objects can be created, but a single client session is cached for convenience as a single GA session maps to a single Servoy Client
 * @type {GASession}
 * @private
 * @properties={typeid:35,uuid:"4D0E2DB3-A30C-4E29-9FCE-E5D2C35EA2EF",variableType:-4}
 */
var clientSession;

/**
 * The standard prefix for a tracking code
 * @type {String}
 * @private 
 * @properties={typeid:35,uuid:"D02EDC81-E9AE-4ED1-9EB3-1A25DB9E96B3"}
 */
var UA_TRACKING_PREFIX = 'UA';

/**
 * The tracking code prefix for mobile (server-side) usage
 * @type {String}
 * @private 
 * @properties={typeid:35,uuid:"C4A11EC8-4DB7-4D36-B997-BF2E95B0F3C6"}
 */
var MO_TRACKING_PREFIX = 'MO';

/**
 * Access the "current" client session which maps to the running Servoy Client session
 * @public 
 * @return {GASession}
 * @properties={typeid:24,uuid:"AB2C7D22-1547-4E43-89C3-8271F4EF65DC"}
 */
function getClientSession(){
	return clientSession;
}

/**
 * Creates a new GASession Instance which maps to the current Servoy Client instance
 * 
 * This class manages the GA Session state and issues event tracking requests
 * @constructor 
 * @private
 * @properties={typeid:24,uuid:"EEE3A675-1BF8-4BF5-A16B-519CFC23CDD2"}
 */
function GASession(code){
	
	/**
	 * Tracking code for individual GA account/domain
	 * Use the MO prefix to allow for utmip parameter for client IP/location
	 * @type {String}
	 */
	this.trackingCode = code;
	
	/**
	 * GA Version
	 * @type {String}
	 */
	this.gaVersion = '4.7.2';	//	TODO: Externalize and version

	var t = getTimestamp();
	
	/**
	 * Time of first visit (Unix timestamp)
	 * @type {Number}
	 */
	this.firstVisit = t;
	
	/**
	 * Time of previous visit (Unix timestamp)
	 * @type {Number}
	 */
	this.previousVisit = t;
	/**
	 * Time of current visit (Unix timestamp)
	 * @type {Number}
	 */
	this.currentVisit = t;
	/**
	 * Number of sessions (including current)
	 * @type {Number}
	 */
	this.sessionCount = 1;
	
	/**
	 * Name of client host computer
	 * @type {String}
	 */
	this.hostName = application.getHostName();
	
	/**
	 * Character Encoding
	 * @type {String}
	 */
	this.encoding = Packages.java.lang.System.getProperty('file.encoding');
	/**
	 * Screen resolution
	 * @example 1280X800
	 * @type {String}
	 */
	this.resolution = application.getScreenWidth() + 'x' + application.getScreenHeight();
	/**
	 * Bit depth of display
	 * @example 32
	 * @type {String}
	 */
	this.colorDepth = function(){
		var retval = -1
		switch (application.getApplicationType()) {
			case APPLICATION_TYPES.WEB_CLIENT:
				/** @type {Packages.org.apache.wicket.protocol.http.request.WebClientInfo}*/
				var info = Packages.org.apache.wicket.RequestCycle.get().getClientInfo()
				retval = info.getProperties().getScreenColorDepth()
				break;
			case  APPLICATION_TYPES.HEADLESS_CLIENT:
				retval = 0
			case APPLICATION_TYPES.SMART_CLIENT:
				retval = Packages.java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDisplayMode().getBitDepth()
			case APPLICATION_TYPES.RUNTIME_CLIENT:
				retval = Packages.java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDisplayMode().getBitDepth()
			default:
				break;
		}
		return retval.toFixed(0) + '-bit'
	}();
	
	this.generateUAString = function() {
		var uaString;
		switch (application.getApplicationType()) {
			case APPLICATION_TYPES.NG_CLIENT:
				uaString = plugins.ngclientutils.getUserAgent();
				break;
			case APPLICATION_TYPES.WEB_CLIENT:
				/** @type {Packages.org.apache.wicket.protocol.http.request.WebClientInfo}*/
				var info = Packages.org.apache.wicket.RequestCycle.get().getClientInfo()
				uaString = info.getUserAgent()
				break;
			case APPLICATION_TYPES.HEADLESS_CLIENT: //Intentional fall-through
			case APPLICATION_TYPES.RUNTIME_CLIENT: //Intentional fall-through
			case APPLICATION_TYPES.SMART_CLIENT:
				uaString = 'Java/' + Packages.java.lang.System.getProperty("java.version")
				uaString += ' (' 
				var os = application.getOSName().toLowerCase()
				var platform = os.indexOf('win') != -1 ? 'win' : os.indexOf('mac') != -1 ? 'mac' : 'linux'
				switch (platform) {
					case 'win':
						var versions = {
							'4.0': '',
							'4.10': '',
							'4.90': '',
							'5.0': 'Windows NT 5.0', //Windows 2000
							'5.01': 'Windows NT 5.01', //Windows 200, Service Pack 1 (SP1)
							'5.1': 'Windows NT 5.1', //Windows XP
							'5.2': 'Windows NT 5.2', //Windows Servoy 2003; Windows P x64 Edition
							'6.0': 'Windows NT 6.0', //Windows Vista
							'6.1': 'Windows NT 6.1', //Windows 7
							'6.2': 'Windows NT 6.2', //windows 8 / Windows Server 2012 R2		
							'6.3': 'Windows NT 6.3', //windows 8.1 / Windows Server 2012 R2	
							'6.4': 'Windows NT 6.4' //windows 10
						}
						if (!versions[Packages.java.lang.System.getProperty('os.version')]) {
							//TODO: log
						} else {
							uaString += versions[Packages.java.lang.System.getProperty('os.version')]
						}
						if (Packages.java.lang.System.getProperty("os.arch").indexOf('64') && true) {
							uaString += '; WOW64'
						}
						break;
					case 'mac':
						uaString += 'Macintosh'
						break
					case 'linux':
						uaString += 'X11;'
						break
					default:
						break;
				}	
				uaString += ')'
				uaString += ' Servoy/' + application.getVersion()
				break;
		}
		return uaString
	}();
		
	/**
	 * Language of client
	 * @example en-us
	 * @type {String}
	 */
	this.language = i18n.getCurrentLanguage();
	
	/**
	 * The country from which the data originated.
	 * @type {String}
	 */
	this.country = i18n.getCurrentCountry();
	
	/**
	 * Java Enabled (Always 1)
	 * @type {Number}
	 */
	this.javaEnabled = 1;
	
	/**
	 * Version of Servoy (Sent as flash version arg)
	 * @type {String}
	 */
	this.servoyVerion = application.getVersion();
	
	/**
	 * Number to identify host between sessions
	 * @type {Number}
	 */
	this.hostNameHash = getHostNameHash();
	
	/**
	 * Number to udentify visitor between sessions (Based on logged-in user name)
	 * @type {Number}
	 */
	this.visitorID = getVisitorHash();
	
	/**
	 * Returns the GA-format HTTP Param string for this session, used to build request URL
	 * 
	 * @public 
	 * @return {String}
	 */
	this.toHTTPQueryString = function(){
		var props =  {
			utmwv:this.gaVersion,
			utmhn:this.hostName,
			utmcs:this.encoding,
			utmsr:this.resolution,
			utmsc:this.colorDepth,
			utmul:this.language,
			utmje:this.javaEnabled,
			utmfl:this.servoyVerion,
			utmtco:this.country,
			utmac:utils.stringReplace(this.trackingCode,UA_TRACKING_PREFIX,MO_TRACKING_PREFIX),	// Replace with MO prefix to ensure client IP is located
			utmcc:'__utma='+new Array(this.hostNameHash,this.visitorID,this.firstVisit,this.previousVisit,this.currentVisit,this.sessionCount).join('.')
		};
		var params = []; 
		for(var p in props) if(props[p]) params.push(p + '=' + Packages.java.net.URLEncoder.encode(props[p], java.nio.charset.StandardCharsets.UTF_8.toString()));
		return params.join('&');
	}

	/**
	 * Resumes a session. Should ONLY be called when session data has been persisted and the visitor is now returning
	 * Resets the previous & current visit timestamps and the session count
	 * This is called by
	 * @see {@link #scopes#modGooglAnalytics#initSession}
	 * @public 
	 */
	this.resume = function resume(){
		this.previousVisit = this.currentVisit;
		this.currentVisit = getTimestamp();
		this.sessionCount++;
		return this;
	}

	/**
	 * Sends a page view request to GA using the current session information and the supplied parameters
	 * 
	 * @param {String} pageTitle The name of the page for tracking page views
	 * @param {String} pageRequest The requested URL (ideally showing the solutionName concatenated to the formName or form context)
	 * @param {String} [referral] The referring URL if any
	 * @return {Boolean}
	 * @public 
	 */
	this.trackPageView = function(pageTitle, pageRequest, referral){
		var req = this.createRequest();
		req.pageTitle = pageTitle;
		req.pageRequest = pageRequest;
		req.referral = referral;
		return req.execute();	
	}
	
	/**
	 * Sends an event-tracking request to GA using the current session information and the supplied JSEvent object
	 * This is a convenience method to track a component actions implicitly.
	 * It is equivalent to calling trackEvent and supplying component information directly
	 * 
	 * TODO: EXPERIMENTAL. Hadn't been reviewed to see if results are meaningful
	 * TODO: Add meaningful categories & labels to request
	 * 
	 * @protected    
	 * @param {JSEvent} event
	 */
	this.trackEventUI = function(event){
		if(event.getType() == JSEvent.FORM){
			var pageTitle = solutionModel.getForm(event.getFormName()).titleText || event.getFormName();
			var pageRequest = forms[event.getFormName()].controller.getFormContext().getColumnAsArray(2).join('/');
			return this.trackPageView(pageTitle,pageRequest);
		}
		return false;
	}
	
	/**
	 * Sends an event-tracking request to GA using the current session information and the supplied parameters
	 * @param {String} pageTitle The name of the page for tracking page views
	 * @param {String} pageRequest The requested URL (ideally showing the solutionName concatenated to the formName or form context)
	 * @param {String} referral The referring URL if any
	 * @param {String} category The category assigned to an event (e.g., Report or Downloads)
	 * @param {String} action The action assigned to an event (e.g., Play, Download file)
	 * @param {String} label The label assigned to an event (any descriptive string you choose)
	 * @param {String} value Event data
	 * @public 
	 */
	this.trackEvent = function(pageTitle, pageRequest, referral, category, action, label, value){
		var req = this.createRequest();
		req.requestType = GA_REQUEST_TYPES.EVENT;
		req.pageTitle = pageTitle;
		req.pageRequest = pageRequest;
		req.referral = referral;
		req.eventCategory = category;
		req.eventAction = action;
		req.eventLabel = label;
		req.eventValue = value;
		req.execute();	
	}
	
	/**
	 * Returns a new request object for this session
	 * 
	 * @public 
	 * @return {GATrackingRequest}
	 */
	this.createRequest = function(){
		return new GATrackingRequest(this);
	}
	
	Object.seal(this);
}

/**
 * Creates a GA tracking request object
 * Set request parameters and invoke execute()
 * 
 * @private
 * @constructor 
 * @properties={typeid:24,uuid:"948BC766-EE3C-4BA4-8346-11F1A800CE37"}
 */
function GATrackingRequest(gaSession){
	// see link: https://support.google.com/analytics/answer/1034380?hl=en
	
	/**
	 * This request's session object
	 * @type {GASession}
	 */
	this.session = gaSession;
	
	/**
	 * Category used for event requests
	 * The category assigned to an event (e.g., Report or Downloads)
	 * @type {String}
	 */
	this.eventCategory = null;
	
	/**
	 * Action used for event requests
	 * The action assigned to an event (e.g., View file, Download file)
	 * @type {String}
	 */
	this.eventAction = null;
	
	/**
	 * Label used for event requests
	 * The label assigned to an event (any descriptive string you choose)
	 * @type {String}
	 */
	this.eventLabel = null;
		
	/**
	 * Value used for event requests
	 * @type {String}
	 */
	this.eventValue = null;
	
	/**
	 * The request type (Use null for page view)
	 * @example GA_REQUEST_TYPES.EVENT
	 * @type {String}
	 */
	this.requestType = null; 
	
	/**
	 * Internal usage for unique request IDs
	 * @type {Number}
	 */
	var requestID = Math.ceil(Math.random()*1E9);
	
	/**
	 * The page title for tracking page views
	 * @type {String}
	 */
	this.pageTitle = null;
	
	/**
	 * Unique ID generated for integration with ad-sense
	 * @type {String}
	 */
	this.adSenseID = null;
	
	/**
	 * The referring URL
	 * The external referrer, if any. This field is only populated for the initial external referral at the beginning of a session.
	 * @type {String}
	 */
	this.referral = null;
	
	/**
	 * The requested URL (ideally showing the solutionName concatenated to the formName or form context)
	 * 
	 * @example application.getSolutionName() + '/' + controller.formName
	 * 
	 * @type {String}
	 */
	this.pageRequest = null;
	
	/**
	 * Returns the GA-formatted HTTP Parameter string for this request object. Includes session parameters as well.
	 * @public 
	 * @return {String}
	 */
	this.toHTTPQueryString = function() {
		var props = {
			utmn: 	requestID,
			utmdt: 	this.pageTitle,
			utmhid: this.adSenseID,
			utmr: 	this.referral,
			utmp: 	this.pageRequest,
			utmt: 	this.requestType
		};

		//	Add ip address parameter only when client IP is NOT private
		var ipAddress = application.getIPAddress();
		if(!scopes.svyNet.isInternalIPAddress(ipAddress)){
			props.utmip = ipAddress;
		}
		
		// encode parameters
		var params = [];
		for (var p in props) {
			if (props[p]) {
				params.push(p + '=' + encodeParam(props[p])); //CHECKME: why using inline Java here for enconding and not JavaScript encodeURI(Component)?
			}
		}
		
		// event parameters
		if (this.requestType == GA_REQUEST_TYPES.EVENT && this.eventCategory && this.eventAction) {
			var evt = [encodeParam(this.eventCategory), encodeParam(this.eventAction)]
			if (this.eventLabel)evt.push(encodeParam(this.eventLabel));
			if (this.eventValue)evt.push(encodeParam(this.eventValue));
			params.push('utme=5(' + evt.join('*') + ')');
		}
		return params.join('&');
		
		function encodeParam(param) {
			return Packages.java.net.URLEncoder.encode(param, java.nio.charset.StandardCharsets.UTF_8.toString())
		}
	}
	
	/**
	 * Builds the complete URL for this request object which can be dispatched to GA
	 * @public 
	 * @return {String} url
	 */
	this.buildURL = function(){
		return GA_BASE_URL + '?' + this.toHTTPQueryString() + '&' + this.session.toHTTPQueryString();
	}
	
	/**
	 * Executes this request object in an HTTP GET method
	 * 
	 * @param {Function} [callback]
	 * @public 
	 */
	this.execute = function(callback){
		var userAgent = this.session.generateUAString;
		var req = client.createGetRequest(this.buildURL());
		
		if (userAgent) {
			req.addHeader("User-Agent", userAgent);
		}
		req.executeAsyncRequest(successCallbackMethod, errorCallbackMethod);
	}

	Object.seal(this);
}

/**
 * call back for successfull async http request
 * 
 * @param {plugins.http.Response} request
 * @private  
 *
 * @properties={typeid:24,uuid:"D072F8BF-3197-4DA6-AEB5-1BF023C1382D"}
 */
function successCallbackMethod(request) {
	//Empty method
}
		 
/**
 * call back for error async http request
 * 
 * @param {plugins.http.Response} request
 * @private  
 *
 * @properties={typeid:24,uuid:"335A0011-11C8-4FB1-AB4D-1D54F8D239EA"}
 */
function errorCallbackMethod(request) {
	if(request) {
		throw new scopes.svyNet.HTTPException('Failed HTTP Request', request.getStatusCode(), request.getResponseBody());
	}
}

/**
 * Initializes the current session object for the running client instance
 * Attempts to load persistent session data from user properties. Resumes session if found.
 * @public 
 * @param {String} trackingCode
 * @param {Boolean} [resumeFromUserProps] Attempts to resume session data from previous visits stored in user properties file
 * @see GASession.resume()
 * @properties={typeid:24,uuid:"95E85CFD-2BB1-45E9-A6FC-BE1C8D3E44D9"}
 * @return {GASession}
 */
function initSession(trackingCode, resumeFromUserProps){
	
	if (!trackingCode) {
		throw new scopes.svyExceptions.IllegalArgumentException('Tracking code required');
	}
	if (clientSession) {
		throw new scopes.svyExceptions.IllegalStateException('Session is already initialized. Call session destroy first');
	}
	/**
	 * @type {GASession}
	 */
	clientSession = new GASession(trackingCode);
	
	//	Attempt resume from user properties
	//	TODO: Encrypt Tracking Code?
	//	TODO: Use Svy Properties!
	if(resumeFromUserProps){
		var tc =  application.getUserProperty('ga.trackingCode');
		var hnh = application.getUserProperty('ga.hostNameHash');
		var vid = application.getUserProperty('ga.visitorID');
		var fv =  application.getUserProperty('ga.firstVisit');
		var pv =  application.getUserProperty('ga.previousVisit');
		var cv =  application.getUserProperty('ga.currentVisit');
		var sc =  application.getUserProperty('ga.sessionCount');
		if(tc == trackingCode && clientSession.hostNameHash == hnh &&  clientSession.visitorID == vid && fv && pv && cv && sc){
			clientSession.firstVisit = fv;
			clientSession.previousVisit= pv;
			clientSession.currentVisit = cv;
			clientSession.sessionCount = parseInt(sc,10);
			clientSession.resume();
		}
	}
	
	//Store to client props
	persistClientSession();
	
	return clientSession;
}

/**
 * Destroys the current session, after which initSession() can be called
 * @public 
 * @properties={typeid:24,uuid:"FC8145FB-8923-4C66-8A18-1AE4214461C4"}
 */
function destroySession(){
	if(clientSession){
		clientSession = null;
	}
}

/**
 * Persists current session data in user properties. Allows for subsequent resumption. 
 * @private
 * @properties={typeid:24,uuid:"B79094D6-6B5E-4F52-A86F-0D7A203605B2"}
 */
function persistClientSession(){
	if(!clientSession)return;
	application.setUserProperty('ga.trackingCode',clientSession.trackingCode);
	application.setUserProperty('ga.hostNameHash',clientSession.hostNameHash.toString());
	application.setUserProperty('ga.visitorID',clientSession.visitorID.toString());
	application.setUserProperty('ga.firstVisit',clientSession.firstVisit.toString());
	application.setUserProperty('ga.previousVisit',clientSession.previousVisit.toString());
	application.setUserProperty('ga.currentVisit',clientSession.currentVisit.toString());
	application.setUserProperty('ga.sessionCount',clientSession.sessionCount.toString());
}

/**
 * TODO: Which timezone to use? UTC or Server
 * Return UNIX timestamp (sans miliseconds) required for session data
 * @private
 * @param {Date} [date] A Javascript date object, optional uses current if null
 * @return {Number} integer timestamp
 *
 * @properties={typeid:24,uuid:"F13485A0-0ACA-4817-A4A1-31103B6E788D"}
 */
function getTimestamp(date){
	var d = date || new Date();
	return Math.floor(d.getTime()*.001);
}

/**
 * Create 9-digit number for host name hash
 * @private 
 * @param {String} [hostName] optional uses current when null
 * @return {String} Hash of hostname (Integer as string)
 * @properties={typeid:24,uuid:"CCC9945D-1C60-43D0-84C5-64A86483C30F"}
 */
function getHostNameHash(hostName){
	var hn = hostName || application.getHostName();
	return parseInt(utils.stringMD5HashBase16(hn).substr(0,8),16).toString(10);
}

/**
 * Create 9-digit number for logged-in user
 * @private 
 * @param {String} [userName] optional user name, uses current when null
 * @return {String} Hash of userName (Integer as string)
 * @properties={typeid:24,uuid:"8794E137-2D06-44C9-B430-4DB2984D5D1E"}
 */
function getVisitorHash(userName){
	var un = userName || security.getUserUID() || security.getUserName() || application.getHostName();
	return parseInt(utils.stringMD5HashBase16(un).substr(0,8),16).toString(10);
}
