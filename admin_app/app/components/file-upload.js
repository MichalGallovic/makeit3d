import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default EmberUploader.FileField.extend({
  url: '',
  parameterName: '',
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
    	paramName: me.get('parameterName')
    });

    if (!Ember.isEmpty(files)) {
      var promise = uploader.upload(files[0]);

      if(this.get('url') == '/api/models/create') {
        promise.then(function(response) {
          me.sendAction('modelUploaded', response);
        });
      }
      console.log(this.get('url'));
      if(this.get('url') == '/api/models/image') {
        console.log(this.get('url'));
        promise.then(function(response) {
            me.sendAction('imageUploaded', response);
        });
      }
    }

  }).observes('files')
});
