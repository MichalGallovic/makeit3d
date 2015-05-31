import Ember from 'ember';

export default Ember.Controller.extend({
	actions : {
		print: function(model) {
			model.print();
		},
		shipped: function() {
			this.get('model').set('was_shipped',true).save();
		}
	}
});
