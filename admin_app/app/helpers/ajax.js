import Ember from 'ember';
import DS from 'ember-data';



export default Ember.Object.extend({
	namespace : function() {
		return this.adapter.get('namespace');
	}.property('this.adapter'),
	headers : function() {
		return this.adapter.get('headers');
	}.property().volatile(),
	getJSONwoDS: function(url) {
		var me = this;
		
		var promise = new Ember.RSVP.Promise(function(resolve,reject) {
			Ember.$.ajax({
				type: "GET",
				url :  me.get('namespace') + "/" + url,
				headers : {
					'X-Auth-Token' : window.localStorage.getItem('makeit3d-apikey')
				}
			}).done(function(response) {
				resolve(response);
			}).fail(function(error) {
				reject(error);
			});
		});

		return promise;
	},
	getJSON : function(url) {
		var me = this;
		
		var promise = new Ember.RSVP.Promise(function(resolve,reject) {
			Ember.$.ajax({
				type: "GET",
				url :  me.get('namespace') + "/" + url,
				headers : me.get('headers')
			}).done(function(response) {
				resolve(response);
			}).fail(function(error) {
				reject(error);
			});
		});

		return promise;
	},
	post: function(url, data) {
		var me = this;

		var promise = new Ember.RSVP.Promise(function(resolve, reject) {
			Ember.$.ajax({
				type: "POST",
				url: me.get('namespace') + "/" + url,
				headers: me.get('headers'),
				data: data
			}).done(function(response){
				resolve(response);
			}).fail(function(error){
				reject(error);
			});
		});

		return promise;
	},
	delete: function(url) {
		var me = this;
		
		var promise = new Ember.RSVP.Promise(function(resolve,reject) {
			Ember.$.ajax({
				type: "DELETE",
				url :  me.get('namespace') + "/" + url,
				headers : me.get('headers')
			}).done(function(response) {
				resolve(response);
			}).fail(function(error) {
				reject(error);
			});
		});

		return promise;
	},
	put: function(url, data) {
		var me = this;

		var promise = new Ember.RSVP.Promise(function(resolve, reject) {
			Ember.$.ajax({
				type: "PUT",
				url: me.get('namespace') + "/" + url,
				headers: me.get('headers'),
				data: data
			}).done(function(response){
				resolve(response);
			}).fail(function(error){
				reject(error);
			});
		});

		return promise;
	},
});