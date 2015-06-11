import CrudEditRoute from '../../lib/routes/crudedit';

export default CrudEditRoute.extend({
	model: function(params) {
		return this.store.find('category',params.id);
	},
  actions : {
    forceDelete: function(item) {
      var me = this;
      item.forceDelete().then(function(response) {
        var oldModel = me.controllerFor('categories.index').get('model');
        oldModel.removeRecord(item);
        me.controllerFor('categories.index').set('model',oldModel);
        me.transitionTo('categories.index');
      });
    }
  }
});
