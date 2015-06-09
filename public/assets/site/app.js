define([
  'jquery', 
  'underscore', 
  'backbone',
  'BootstrapJS',
  'when',
  'homeView',
  'categoriesView',
  'BasketView',
  'PrintView',
  'Session',
  'LoginView',
  'RegisterView',
  'ProfileView',
  'HowView'
], function($, _, Backbone,BootstrapJS,when,homeView,CategoriesView,BasketView,PrintView,Session,LoginView,RegisterView,ProfileView,HowView){
  
  var App = {}
  App.initialize = function () {

    //homeview
    // var hv = homeView;
    // hv.kone()
    $('#basket').click(function(){
      BasketView.show();
    })

    $('#profile').click(function(){
      ProfileView.show();
    })

    var Router = Backbone.Router.extend({
  		
      routes: {
          "":"home",
  		    "home":"home",
          "how_it_works":"how_it_works",
  		    "categories":"categories",
          "categories/:id":"category",
  		    "print":"print",
          "login":"login",
          "register":"register",
          "logout":"logout"
  		},
      

      initialize:function(){
        //ak je user neprihlaseny skovam print a logout aj kosik
        // if(!Session.get('is_logged')){
        //   $('#print-link').hide();
        //   $('#logout-link').hide();
        //   $('#basket').hide();
        // }

        this.listenTo(Session,'logged_in',this.logged_in)
        this.listenTo(Session,'not_logged_in',this.not_logged_in)


        // console.log(Session);
        // this.navigate('home',{trigger: true, replace: true});
        // this.showTab('home');

        //ideme to robit ze len raz
        // this.hv = homeView;
        // this.hv.getRecentlyPrinted();
        
        //homeview samo
        //printView sa spusti samo
        //categories view samo

        //ak bude user logged tak sa mu zobrazi aj print tab
        //ak nebude tak sa mu nezobrazi
      },

      
  		
  		home: function() {
        this.showTab('home');
  		},
      how_it_works: function() {
        this.showTab('how_it_works');
      },
      
  		
  		categories: function() {
        $('#categories-container').show()
        this.showTab('categories');
        $('.cats-conts').hide();

  		},
      category: function(id) {
        // $('#model_detail').addClass('hidden').html('');
        // $('.modal_beckdrop').hide();

        // console.log('robim');
        this.showTab('categories');
        CategoriesView.select_category(parseInt(id));
      },
      
  		
  		print: function() {
        this.showTab('print');
  		},
      login: function() {
        this.showTab('login');
      },
      register: function() {
        this.showTab('register');
      },
      logout: function() {
        var that = this
        $.ajax({
                 url: "/api/users/logout",
                 type: "delete",
                 beforeSend: function(xhr){xhr.setRequestHeader('X-Auth-Token', localStorage.getItem('token'));},
                 success: function(resp) { 
                  console.log(resp);
                  // that.showTab('logout');
                  localStorage.removeItem('token');
                  that.navigate('home',{trigger: true, replace: true});
                  localStorage.removeItem('basket');

                  location.reload();

                    
                 }
              });
        
      },

      showTab:function(tab){
        if(!Session.get('is_logged')){
          if(tab =='print' || tab =='logout'){
            this.navigate('home',{trigger: true, replace: true});
            return;
          }
        }
        $( ".indextab" ).removeClass( "active" ).addClass( "hidden" );
        $( "#"+tab ).removeClass( "hidden" ).addClass( "active" );
      },
      logged_in:function(){
        //zobraz basket print logou / skovaj login a register
        // $('#home-link').removeClass('hidden');
        $('#categories-link').removeClass('hidden');
          $('#print-link').removeClass('hidden');
          $('#logout-link').removeClass('hidden');
          $('#basket').removeClass('hidden');
          $('#profile').removeClass('hidden');
          $('#profile-link').removeClass('hidden');


          $('#login-link').addClass('hidden');
          $('#register-link').addClass('hidden');
        this.navigate('home',{trigger: true, replace: true});
        CategoriesView.already_selected = [];
        // console.log(CategoriesView.already_selected);



      },
      not_logged_in:function(){
        //zobraz basket print logou / skovaj login a register
        // $('#home-link').removeClass('hidden');
        $('#categories-link').removeClass('hidden');

          $('#login-link').removeClass('hidden');
          $('#register-link').removeClass('hidden');
        this.navigate('home',{trigger: true, replace: true});
        CategoriesView.already_selected = [];
        // console.log(CategoriesView.already_selected);

      }


      

  	});

    var router = new Router();
    Backbone.history.start();


  }
  

  return App;
});
