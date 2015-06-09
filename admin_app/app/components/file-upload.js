import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default EmberUploader.FileField.extend({
  url: '',
  filesDidChange: (function() {
  	var me = this;
    var uploadUrl = this.get('url');
    var files = this.get('files');

    var CustomizedUploader = EmberUploader.Uploader.extend({
    	headers: {
    		headers : {
    			'Requested-With' : 'ember',
    			'X-Auth-Token' : window.localStorage.getItem('makeit3d-apikey')
    		}
    	},
    	// Overridable hook, by default changes nothing.
    	 ajaxSettings: function(settings) {
    	 	settings = Ember.merge(settings, this.get('headers'));
    	   	return settings;
    	 },

    	 _ajax: function(settings) {
    	   settings = this.ajaxSettings(settings);
    	   return this._super(settings);
    	 }
    });

    var uploader = CustomizedUploader.create({
    	url: uploadUrl,
    	paramName: "model"
    });

    if (!Ember.isEmpty(files)) {
		var promise = uploader.upload(files[0]);

		promise.then(function(response) {
			me.sendAction('modelUploaded', response);
		});
    }

  }).observes('files')
});
