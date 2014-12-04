/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"9F984476-269D-468E-B371-9CA96D862A1C"}
 */
var homeLayout;


/**
 * Callback method when form is (re)loaded.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"4C7D0FAF-EF50-450C-ACC0-821D439E8BA7"}
 */
function onLoad(event) {

	var x = Math.random()
	if (x > 0.5) {
		homeLayout = 'layoutA'
	} else {
		homeLayout = 'layoutB'
	}
	elements.tabless.addTab(homeLayout)
}
