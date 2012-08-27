/**
 * Base URL for GA HTTP service
 * @type {String}
 *
 * @properties={typeid:35,uuid:"D0831A24-736F-4E0F-96DD-94E207302F3F"}
 */
var GA_BASE_URL = 'http://www.google-analytics.com/__utm.gif';

/**
 * Constant for Request type page view
 * @type {String}
 *
 * @properties={typeid:35,uuid:"4EBCF71E-9C2A-4CB5-8FEC-34F4211089BB"}
 */
var GA_REQUEST_TYPE_PAGE_VIEW = 'page';

/**
 * Constant for Request type event
 * @type {String}
 *
 * @properties={typeid:35,uuid:"DC3A1AE4-9AAA-4A0C-9635-6FDB473CA566"}
 */
var GA_REQUEST_TYPE_EVENT = 'event';

/**
 * ID of the client to use for dispatching remote http calls
 * @type {String}
 * @private 
 * @properties={typeid:35,uuid:"7575E947-C21A-4CDC-8E60-F19B28D5F7A3"}
 */
var headlessClientID = null;

/**
 * Instance of the current client session
 * @type {scopes.modGoogleAnalytics.GASession}
 * @private
 * @properties={typeid:35,uuid:"4D0E2DB3-A30C-4E29-9FCE-E5D2C35EA2EF",variableType:-4}
 */
var clientSession;

/**
 * Access the current client session
 * @return {GASession}
 * @properties={typeid:24,uuid:"AB2C7D22-1547-4E43-89C3-8271F4EF65DC"}
 */
function getClientSession(){
	return clientSession;
}

/**
 * Creates a new GASession Instance
 * @constructor 
 * @properties={typeid:24,uuid:"EEE3A675-1BF8-4BF5-A16B-519CFC23CDD2"}
 */
function GASession(code){
	
	/**
	 * Tracking code for individual GA account/domain
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
	this.colorDepth = Packages.java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDisplayMode().getBitDepth();	//	TODO: Not Headless/WC compatible
	
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
			utmac:this.trackingCode,
			utmcc:'__utma='+new Array(this.hostNameHash,this.visitorID,this.firstVisit,this.previousVisit,this.currentVisit,this.sessionCount).join('.')
		};
		var params = []; 
		for(p in props) if(props[p]) params.push(p + '=' + Packages.java.net.URLEncoder.encode(props[p]));
		return params.join('&');
	}

	/**
	 * Resumes a session. Should called when session data has been persisted and the visitor is now returning
	 * Resets the previous & current visit timestamps and the session count
	 * @return {scopes.modGoogleAnalytics.GASession}
	 */
	this.resume = function(){
		this.previousVisit = this.currentVisit;
		this.currentVisit = getTimestamp();
		this.sessionCount = this.sessionCount + 1; // Weirdness in code complete this.foo++ not working
		return this;
	}

	/**
	 * Sends a page view request to GA using the current session information and the supplied parameters
	 * @param {String} pageTitle The name of the page
	 * @param {String} pageRequest The requested URL (ideally the full form context)
	 * @param {String} referral The referring URL if any
	 * @return {Boolean}
	 */
	this.trackPageView = function(pageTitle, pageRequest, referral){
		var req = new scopes.modGoogleAnalytics.GATrackingRequest(this);
		req.pageTitle = pageTitle;
		req.pageRequest = pageRequest;
		req.referral = referral;
		return req.execute();	
	}
	
	/**
	 * EXPERIMENTAL!
	 * Sends an event-tracking request to GA using the current session information and the supplied JSEvent object
	 * This is a convenience method to track a component actions implicitly.
	 * It is equivalent to calling trackEvent and supplying component information directly
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
	 * @return {Boolean}
	 */
	this.trackEvent = function(pageTitle, pageRequest, referral, category, action, label, value){
		var req = new scopes.modGoogleAnalytics.GATrackingRequest(this);
		req.requestType = GA_REQUEST_TYPE_EVENT;
		req.pageTitle = pageTitle;
		req.pageRequest = pageRequest;
		req.referral = referral;
		req.eventCategory = category;
		req.eventAction = action;
		req.eventLabel = label;
		req.eventValue = value;
		return req.execute();	
	}
}

/**
 * Creates a GA tracking request object
 * Set request parameters and invoke execute()
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
	 * @example GA_REQUEST_TYPE_EVENT
	 * @type {String}
	 */
	this.requestType = null; 
	/**
	 * Internal usage for unique request IDs
	 * @private 
	 * @type {Number}
	 */
	this.requestID = Math.ceil(Math.random()*1E9);
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
	 * @return {String}
	 */
	this.toHTTPQueryString = function(){
		var props =  {
			utmn:this.requestID,
			utmdt:this.pageTitle,
			utmhid:this.adSenseID,
			utmr:this.referral,
			utmp:this.pageRequest,
			utmt:this.requestType
		};
		
		var params = []; 
		for(p in props) if(props[p]) params.push(p + '=' + Packages.java.net.URLEncoder.encode(props[p]));
		if(this.requestType == GA_REQUEST_TYPE_EVENT && this.eventCategory && this.eventAction){
			var evt = [this.eventCategory,this.eventAction]
			if(this.eventLabel)evt.push(this.eventLabel);
			if(this.eventValue)evt.push(this.eventValue);
			params.push('utme=5(' + evt.join('*') + ')');
		}
		return params.join('&');
	}
	
	/**
	 * Builds the complete URL for this request object which can be dispatched to GA
	 * @return {String} url
	 */
	this.buildURL = function(){
		return GA_BASE_URL + '?' + this.toHTTPQueryString() + '&' + this.session.toHTTPQueryString();
	}
	
	/**
	 * Executes this request object in an HTTP GET method
	 * Convenience method which calls the dispatch method
	 * @param {Function} [callback]
	 */
	this.execute = function(callback){
		dispatch(this,callback);
	}
}


/**
 * Initializes the current session object for the running client instance
 * Attempts to load persistent session data from user properties. Resumes session if found.
 * @param {String} trackingCode
 * @see GASession.resume()
 * @properties={typeid:24,uuid:"95E85CFD-2BB1-45E9-A6FC-BE1C8D3E44D9"}
 */
function initSession(trackingCode){
	// TODO: Can be called more than once? Or implement something like session.destroy() to notify GA?
	if(!trackingCode) throw 'Tracking code required'
	/**
	 * @type {scopes.modGoogleAnalytics.GASession}
	 */
	clientSession = new GASession(trackingCode);
	
	//	Attempt resume from user properties
	//	TODO: Encrypt Tracking Code?
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
		persistClientSession();
	}
	return clientSession;
}

/**
 * Persists current session data in user properties. Allows for subsequent resumption. 
 * @properties={typeid:24,uuid:"B79094D6-6B5E-4F52-A86F-0D7A203605B2"}
 */
function persistClientSession(){
	if(!clientSession)return;
	application.setUserProperty('ga.trackingCode',clientSession.trackingCode);
	application.setUserProperty('ga.hostNameHash',clientSession.hostNameHash);
	application.setUserProperty('ga.visitorID',clientSession.visitorID);
	application.setUserProperty('ga.firstVisit',clientSession.firstVisit.toString());
	application.setUserProperty('ga.previousVisit',clientSession.previousVisit.toString());
	application.setUserProperty('ga.currentVisit',clientSession.currentVisit.toString());
	application.setUserProperty('ga.sessionCount',clientSession.sessionCount.toString());
}

/**
 * Central dispatch for all GA HTTP requests 
 * Asynchronously sends requests to a server-side queue.
 * @param {GATrackingRequest} request
 * @param {Function} [callback]
 * @properties={typeid:24,uuid:"6D976D46-2F5B-41F9-AC78-BB6B6E618DF3"}
 */
function dispatch(request, callback){
	var url = request.buildURL()
	var c = getHeadlessClient();
	c.queueMethod(null,'scopes.modGoogleAnalytics.dispatchRemote',[url],onDispatchCallback);
}

/**
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"D57C559D-6691-4401-8612-8C94EC9D48E5"}
 */
function onDispatchCallback(event){
	application.output(event);
}

/**
 * Remote dispatch for all GA HTTP requests 
 * receives requested URLs in a server-side queue and processes sequentially
 * @param {String} url
 * @properties={typeid:24,uuid:"01382ADE-B92E-4C19-8B02-5484367F17EB"}
 */
function dispatchRemote(url){
	var res = plugins.http.createNewHttpClient().createGetRequest(url).executeRequest();
	return res.getStatusCode();
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
 * Create and/or get headless client instance used to queue requests
 * @private
 * @return {plugins.headlessclient.JSClient}
 * @properties={typeid:24,uuid:"6475B5E0-0356-4DBC-84CB-E5002F538B19"}
 */
function getHeadlessClient(){
	var c;
	if(headlessClientID){
		c = plugins.headlessclient.getClient(headlessClientID);
		if(c && c.isValid()) return c;
	}
	
	//	TODO this is a work-around for weirdness in HC plugin in developer (filed a case for it)
	var un = 'GA-dispatch-remote-user';
	var pw = 'servoy'
		
	c = plugins.headlessclient.createClient('modGoogleAnalytics',un,pw,null);
	headlessClientID = c.getClientID();
	return c;
}