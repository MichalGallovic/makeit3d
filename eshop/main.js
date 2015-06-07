require.config({
	shim : {
        "BootstrapJS" : { "deps" :['jquery'] }
    },
	paths:{
		//libs
		jquery: 'libs/jquery/jquery',
		underscore: 'libs/underscore/underscore',
		backbone: 'libs/backbone/backbone',		
		BootstrapJS: 'libs/bootstrap/bootstrap',



		//models
		Model:'app/model/model',
		Basket:'app/basket/basket_model',
		PrintModel: 'app/print/print_model',
		CategoriesModel: 'app/categories/categories-model',
		Session: 'app/session/session-model',
		//views
		homeView: 'app/home/home-view',
		categoriesView: 'app/categories/categories-view',
		ModelView:'app/model/model_view',
		BasketView: 'app/basket/basket_view',
		PrintView: 'app/print/print_view',
		LoginView: 'app/session/login_view',
		RegisterView: 'app/session/register_view',
		ProfileView: 'app/session/profile_view',
		HowView : 'app/how_it_works/how-view',
		


	},
	packages:[
	{ name : 'when', location: 'libs/when', main: 'when'

	}]
});

require([
  'app',
], function(App){
	App.initialize();
});