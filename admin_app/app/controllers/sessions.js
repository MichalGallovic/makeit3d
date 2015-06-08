import Ember from 'ember';

export default Ember.Controller.extend({
	needs: ['application'],
	localStorageName : "makeit3d-apikey",
	currentUser : null,
	attemptedTransition : null,
	username : null,
	password: null,
	init : function () {
		this._super();

		var access_token = this.getToken();

		if(!Ember.isEmpty(access_token)) {
			this.restore();
		}
	},

	getToken : function () {
		if(typeof(Storage) === "undefined") {
			Ember.assert('No local storage support.');
		}

		var ls_token = window.localStorage.getItem(this.localStorageName);

		return ls_token;
	},
	setToken : function(token) {
		if(typeof(Storage) === "undefined") {
			Ember.assert('No local storage support.');
		}
		window.localStorage.setItem(this.localStorageName, token);
	},
	restore : function() {
		var me = this;

		this.ajax.getJSON('users/current').then(
			function(response) {
				me.login(response);
			},
			function() {
				me.resetSession();
				me.transitionToRoute('sessions.login');
			}
		);
	},
	resetProperties : function () {
		this.setProperties({
			username : null,
			password : null,
			currentUser : null
		});
	},
	resetSession : function() {
		this.resetProperties();
		this.setToken("");
		this.get('controllers.application').set('isAuthenticated', false);
	},
	login : function(response) {
		this.resetProperties();
		var user = this.store.createRecord('user', response.user[0]);
		this.set('currentUser', user);
		this.setToken(user.get('token'));
		var attemtedTrans = this.get('attemptedTransition');
		
		this.get('controllers.application').set('isAuthenticated', true);

		if(attemtedTrans) {
			attemtedTrans.retry();
			this.set('attemptedTransition', null);
		} else {
			this.transitionToRoute('dashboard');
		}

	},
	logout : function() {
		var me = this;

		var promise = new Ember.RSVP.Promise(function(resolve, reject) {
			me.ajax.delete('users/logout').then(
				function(response) {
					me.store.deleteRecord(me.currentUser);
					me.resetSession();
					resolve(response);
				},
				function(error){
					reject(error);
				}
			);
		});	

		return promise;
	}
});
