import Ember from 'ember';

export function parsetime(params) {
	var percents = params[0];
	return Math.round(percents*100)/100 + "%";
}

export default Ember.HTMLBars.makeBoundHelper(parsetime);
