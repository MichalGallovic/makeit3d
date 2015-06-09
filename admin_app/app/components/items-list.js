import Ember from 'ember';

export default Ember.Component.extend({
	showRoute: null,
	prepareProperties: function() {
		this.update();
	}.on('init'),
	update: function() {
		var propString = this.get('properties');
		var propsArr = null;
		if(!Ember.isArray(propString)) {
			propsArr = propString.replace(/ /g,"").split(',');
			this.set('properties',propsArr);
		} else {
			propsArr = this.get('properties');
		}
		var items = this.get('items');
		var itemsArr = Ember.A();
		items.forEach(function(elm) {
			var obj = Ember.Object.create();
			var data = Ember.A();
			propsArr.forEach(function(prop){
				data.pushObject(elm.get(prop));
			});
			obj.set('data',data);
			obj.set('store',elm);
			itemsArr.pushObject(obj);
		});

		this.set('items_list', itemsArr);
	}.observes('items.@each'),
	items_properties: null,
	items_list: null,
	resource: null,
	actions: {
		delete: function(item) {
			if(confirm('Do you really want to delete this model?')) {
				this.sendAction('delete', item);
			}
		},
		edit: function(item) {
			this.sendAction('edit', item);
		},
		restore: function(item) {
			this.sendAction('restore', item);
		}
	}
});
