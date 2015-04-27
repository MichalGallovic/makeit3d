import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
  this.route('/');
  this.route('sessions', function() {
      this.route('login');
      this.route('logout'); // authenticated route
  });

  // authenticated routes
  this.route('dashboard');
  this.route('models', function() {
    this.route('create');
    this.route('show',{path:":id"});
    this.route('edit',{path:":id/edit"});
  });
  this.route('users', function() {
    this.route('create');
    this.route('show',{path:":id"});
    this.route('edit',{path:":id/edit"});
  });
  this.route('orders', function() {
    this.route('create');
    this.route('manage', {path:":id/manage"});
    this.route('show',{path:":id"});
    this.route('edit',{path:":id/edit"});
  });
  this.route('categories', function() {
    this.route('create');
    this.route('show',{path:":id"});
    this.route('edit',{path:":id/edit"});
  });
});
