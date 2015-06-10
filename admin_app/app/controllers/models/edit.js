import Ember from 'ember';

export default Ember.Controller.extend({
	users: [],
  categories: [],
	actions: {
		update: function(item) {
			var me = this;
			item.save().then(function() {
				me.transitionToRoute('models.index');
			});
		},
		cancel: function() {
			this.transitionToRoute('models.index');
			return false;
		}
	}
});
