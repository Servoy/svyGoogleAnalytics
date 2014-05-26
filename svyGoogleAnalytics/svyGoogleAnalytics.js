/**
 * @type {String}
 * @private
 *
 * @properties={typeid:35,uuid:"40DEAB1D-3F4D-4A39-AF13-96060D2C7365"}
 */
var SOLUTION_NAME = 'svyGoogleAnalytics';
/**
 * @type {String}
 * @private
 * @properties={typeid:35,uuid:"55DACCB0-5289-48DF-B2D3-30FD4AD09965"}
 */
var DEFAULT_REMOTE_USER_NAME = 'googleAnalyticsRemoteDispatch';
/**
 * @type {String}
 * @private
 *
 * @properties={typeid:35,uuid:"CEE8334D-718B-47DE-924B-D5EBF5FEDC4A"}
 */
var DEFAULT_REMOTE_USER_PASSWORD = 'servoy';
/**
 * @type {String}
 * @private
 * @properties={typeid:35,uuid:"A37E497C-440A-4840-BB47-332D9BB2F65F"}
 */
var REMOTE_CLIENT_ID = '00000000-0000-0000-0000-00GANALYTICS';

/**
 * @type {String}
 * @private 
 *
 * @properties={typeid:35,uuid:"0804955C-60AB-4C6B-9FBA-B7B0AD0C1C48"}
 */
var remoteUserName = DEFAULT_REMOTE_USER_NAME;

/**
 * @type {String}
 * @private 
 *
 * @properties={typeid:35,uuid:"D3153FFF-4240-4E78-8317-7CBCE429279E"}
 */
var remoteUserPassword = DEFAULT_REMOTE_USER_PASSWORD;


/**
 * Base URL for GA HTTP service
 * @type {String}
 * @private 
 * @properties={typeid:35,uuid:"D0831A24-736F-4E0F-96DD-94E207302F3F"}
 */
var GA_BASE_URL = 'http://www.google-analytics.com/__utm.gif';

/**
 * Constants for google analytics request types
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
 * Instance of the current client session
 * Multiple client session objects can be created, but a single client session is cached for convenience as a single GA session maps to a single Servoy Client
 * @type {GASession}
 * @private
 * @properties={typeid:35,uuid:"4D0E2DB3-A30C-4E29-9FCE-E5D2C35EA2EF",variableType:-4}
 */
var clientSession;

/**
 * Callback placeholder for tracking requests
 * @type {Function}
 * @private 
 * @properties={typeid:35,uuid:"AADE4424-60B0-4C1F-8D37-B82C21C59DF8",variableType:-4}
 */
var requestCallback;

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
		
	/**
	 * Language of client
	 * @example en-us
	 * @type {String}
	 */
	this.language = i18n.getCurrentLanguage();
	
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
	 * @this {GASession}
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
			utmac:utils.stringReplace(this.trackingCode,UA_TRACKING_PREFIX,MO_TRACKING_PREFIX),	// Replace with MO prefix to ensure client IP is located
			utmcc:'__utma='+new Array(this.hostNameHash,this.visitorID,this.firstVisit,this.previousVisit,this.currentVisit,this.sessionCount).join('.')
		};
		var params = []; 
		for(var p in props) if(props[p]) params.push(p + '=' + Packages.java.net.URLEncoder.encode(props[p]));
		return params.join('&');
	}

	/**
	 * Resumes a session. Should ONLY be called when session data has been persisted and the visitor is now returning
	 * Resets the previous & current visit timestamps and the session count
	 * This is called by
	 * @see {@link #scopes#modGooglAnalytics#initClientSession}
	 * @this {GASession}
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
	 * @param {String} pageTitle The name of the page
	 * @param {String} pageRequest The requested URL (ideally the full form context)
	 * @param {String} [referral] The referring URL if any
	 * @return {Boolean}
	 * @this {GASession}
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
	 * TODO: EXPERIMENTAL. Hadn't been reviewd to see if results are meaningful
	 * TODO: Add meaningful categories & labels to request
	 * 
	 * @this {GASession}
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
	 * @param {String} pageTitle The name of the page
	 * @param {String} pageRequest The requested URL (ideally the full form context)
	 * @param {String} referral The referring URL if any
	 * @param {String} category The category of the event
	 * @param {String} action The event's action
	 * @param {String} label The label for the event
	 * @param {String} value Event data
	 * @this {GASession}
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
	 * @this {GASession}
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
 * @private
 * @constructor 
 * @properties={typeid:24,uuid:"948BC766-EE3C-4BA4-8346-11F1A800CE37"}
 */
function GATrackingRequest(gaSession){
	
	/**
	 * This request's session object
	 * @type {GASession}
	 */
	this.session = gaSession;
	
	/**
	 * Category used for event requests
	 * @type {String}
	 */
	this.eventCategory = null;
	
	/**
	 * Action used for event requests
	 * @type {String}
	 */
	this.eventAction = null;
	
	/**
	 * Label used for event requests
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
	 * @type {String}
	 */
	this.referral = null;
	
	/**
	 * The requested URL (ideally showing form context)
	 * @type {String}
	 */
	this.pageRequest = null;
	
	/**
	 * Returns the GA-formatted HTTP Parameter string for this request object. Includes session parameters as well.
	 * @this {GATrackingRequest}
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
		
		var params = [];
		for (var p in props) {
			if (props[p]) {
				params.push(p + '=' + Packages.java.net.URLEncoder.encode(props[p])); //CHECKME: why using inline Java here for enconding and not JavaScript encodeURI(Component)?
			}
		}
		if (this.requestType == GA_REQUEST_TYPES.EVENT && this.eventCategory && this.eventAction) {
			var evt = [this.eventCategory, this.eventAction]
			if (this.eventLabel)evt.push(this.eventLabel);
			if (this.eventValue)evt.push(this.eventValue);
			params.push('utme=5(' + evt.join('*') + ')');
		}
		return params.join('&');
	}
	
	/**
	 * Builds the complete URL for this request object which can be dispatched to GA
	 * @this {GATrackingRequest}
	 * @return {String} url
	 */
	this.buildURL = function(){
		return GA_BASE_URL + '?' + this.toHTTPQueryString() + '&' + this.session.toHTTPQueryString();
	}
	
	/**
	 * Executes this request object in an HTTP GET method
	 * 
	 * @param {Function} [callback]
	 * @this {GATrackingRequest}
	 */
	this.execute = function(callback){
		dispatch(this.buildURL(),callback);
	}
	
	Object.seal(this);
}


/**
 * Initializes the current session object for the running client instance
 * Attempts to load persistent session data from user properties. Resumes session if found.
 * @param {String} trackingCode
 * @param {Boolean} [resumeFromUserProps] Attempts to resume session data from previous visits stored in user properties file
 * @see GASession.resume()
 * @properties={typeid:24,uuid:"95E85CFD-2BB1-45E9-A6FC-BE1C8D3E44D9"}
 */
function initSession(trackingCode, resumeFromUserProps){
	
	if(!trackingCode){
		throw new scopes.svyExceptions.IllegalArgumentException('Tracking code required');
	}
	if(clientSession){
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
 * Central dispatch for all GA HTTP requests 
 * Asynchronously sends requests to a server-side queue.
 * 
 * @param {String} url
 * @param {Function} [callback]
 * @private
 * @properties={typeid:24,uuid:"6D976D46-2F5B-41F9-AC78-BB6B6E618DF3"}
 */
function dispatch(url, callback){
	requestCallback = callback;
//	var url = request.buildURL();
	var userAgent = generateUAString();
	
	getHeadlessClient().queueMethod(null,'scopes.svyGoogleAnalytics.dispatchRemote', [url, userAgent], onDispatchCallback);
}

/**
 * Callback handler for GA request, delegates to callback handler if assigned
 * @param {JSEvent} event
 * @private 
 * @properties={typeid:24,uuid:"D57C559D-6691-4401-8612-8C94EC9D48E5"}
 */
function onDispatchCallback(event){
	if(event.getType() != plugins.headlessclient.JSClient.CALLBACK_EVENT){
		application.output('No response received for GA Tracking request',LOGGINGLEVEL.ERROR);
	}
	if(!requestCallback){
		return;
	}	
	requestCallback.apply(this,[event.data]);
	requestCallback = null;
}

/**
 * Remote dispatch for all GA HTTP requests
 * receives requested URLs in a server-side queue and processes sequentially
 * @param {String} url
 * @param {String} [userAgent]
 * @private
 * @properties={typeid:24,uuid:"01382ADE-B92E-4C19-8B02-5484367F17EB"}
 */
function dispatchRemote(url, userAgent){
	var client = plugins.http.createNewHttpClient()
	var req = client.createGetRequest(url);
	
	if (userAgent) {
		req.addHeader("User-Agent", userAgent);
	}
	var res = req.executeRequest();
	var code = res.getStatusCode();
	if(code != plugins.http.HTTP_STATUS.SC_OK) throw new scopes.svyNet.HTTPException('Failed HTTP Request', code, res.getResponseBody());
	return code;
}

/**
 * First draft of generating proper User Agent strings from which Google Analytics can get the relevant information
 * The User Agent strings are custom only for Smart, Headless and Runtime client. For Web Client the actual browser User Agent string is forwarded.
 * 
 * Implementation is far form complete. Much of the info used by browsers to generate US Strings seems unavailable in Java. Need to figure out how to improve this
 * 
 * For more info on User Agent Strings, see:
 * - http://en.wikipedia.org/wiki/User_agent
 * - http://www.texsoft.it/index.php?c=software&m=sw.php.useragent&l=it
 * - http://lopica.sourceforge.net/os.html
 * - http://www.useragentstring.com/pages/Chrome/
 * - http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
 * 
 * TODO improve platform/os info in UA String 
 * TODO append relevant Servoy info to Web Client US String
 * TODO somehow differentiate between Smart, Headless and runtime Client in the UA String
 * 
 * @private
 * @return {String}
 * @properties={typeid:24,uuid:"C1D52EAF-FFDD-4812-9186-7234FCBDA45B"}
 */
function generateUAString() {
	var uaString;
	switch (application.getApplicationType()) {
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
						'6.2': 'Windows NT 6.2' //windows 8 Release Preview	
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

/**
 * FIXME: Use Constants for client id, user name and password 
 * Create and/or get headless client instance used to queue requests
 * @private
 * @return {plugins.headlessclient.JSClient}
 * @properties={typeid:24,uuid:"6475B5E0-0356-4DBC-84CB-E5002F538B19"}
 */
function getHeadlessClient(){
	var client = plugins.headlessclient.getClient(REMOTE_CLIENT_ID);
	if(!client){
		var uid = security.getUserUID(remoteUserName);
		if(!uid || !security.checkPassword(uid,remoteUserPassword) || security.getUserGroups(uid).getMaxRowIndex() < 1)
			throw new scopes.svyExceptions.IllegalStateException(
			'Failed to authenticate remote dispatch user "'+remoteUserName+'" for Google Analytics Remote Dispatch Client. '+
			'Ensure that the account exists and has correct credentials and is valid/belongs to a valid group. '+
			'The remote dispatch user can be configured using scopes.modGoogleAnalyics.setRemoteDispatchUser()');
		client = plugins.headlessclient.getOrCreateClient(REMOTE_CLIENT_ID,SOLUTION_NAME,remoteUserName,remoteUserPassword,null);
		if(!client) throw new scopes.svyExceptions.IllegalStateException('Failed to create headless client for Google Analytics Remote Dispatch. Check the server log for details');
	}
	if(!client.isValid()) throw new scopes.svyExceptions.IllegalStateException('Google Analytics Remote Dispatch Client exists, but is not valid');	
	return client;
}

/**
 * Overrides the internal security user name and credentials for headless client usage
 * 
 * @param {String} userName
 * @param {String} password
 * @private
 * @properties={typeid:24,uuid:"7471A958-90F9-4867-8AEA-7FFA8B586C92"}
 */
function setRemoteDispatchUser(userName,password){
	var client = plugins.headlessclient.getClient(REMOTE_CLIENT_ID);
	if(client) throw new scopes.svyExceptions.IllegalStateException('The remote client (Client ID:'+REMOTE_CLIENT_ID+') is already started. Shutdown the client first and try again');
}