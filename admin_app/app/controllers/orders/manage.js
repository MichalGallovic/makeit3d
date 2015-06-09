import Ember from 'ember';

export default Ember.Controller.extend({
	printerUnpluged : true,
	getPrinterStatus: function() {
		var me = this;
		return this.ajax.getJSON('printer/status').then(function(response) {
			if(response.status === "Operational") {
				me.set('printerUnpluged', false);
			}
		});
	},
	actions : {
		print: function(model) {
			model.print();
		},
		shipped: function() {
			this.get('model').set('was_shipped',true).save();
		}
	}
});
