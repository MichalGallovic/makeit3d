import CrudCreateRoute from '../../lib/routes/crudcreate';

export default CrudCreateRoute.extend({
  model: function() {
    return this.store.createRecord('user');
  },
  actions : {
    create: function (item) {
      var me = this;
      item.save().then(function () {
        me.transitionTo('users.index');
      });
    }
  }
});
