import Ember from 'ember';

export function log(params, hash) {
	params.get('firstObject').get('content').forEach(function(elm) {
		console.log(elm.get('data'));
	});
}

export default Ember.HTMLBars.makeBoundHelper(log);
