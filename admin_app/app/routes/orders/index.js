import Ember from 'ember';
import AuthenticatedRoute from '../../lib/routes/authenticated';

export default Ember.Route.extend({
	model: function() {
		return this.store.find('order');
	}
});
