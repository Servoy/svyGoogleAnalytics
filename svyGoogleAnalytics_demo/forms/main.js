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