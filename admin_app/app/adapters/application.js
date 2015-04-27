import DS from 'ember-data';

export default DS.RESTAdapter.extend({
	namespace : 'api',
	headers : function() {
		return {
			'Requested-With' : 'ember',
			'X-Auth-Token' : window.localStorage.getItem('makeit3d-apikey')
		};
	}.property().volatile()
});
