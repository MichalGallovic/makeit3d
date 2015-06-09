<html id="csstyle" lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>.:MakeIt 3D:.</title>
    <link rel="stylesheet" type="text/css" href="{{ asset('assets/site/mystyle.css')  }}"/>
    <link rel="stylesheet" type="text/css" href="{{ asset('assets/site/style.css') }}"/>
    <script data-main="assets/site/main" src="{{ asset('assets/site/libs/require/require.js') }}"></script>
  </head>
  <body id="body">
    <nav role="navigation" class="navbar navbar-default">
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <div class="navbar-header">
              <button type="button" data-toggle="collapse" data-target=".navbar-ex1-collapse" class="navbar-toggle collapsed"><span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><a href="/#home" class="navbar-brand"><img src="/images/logo_sm.png" alt=""/><img src="/images/logo2_sm.png" alt=""/></a>
            </div>
            <div class="collapse navbar-collapse navbar-ex1-collapse pull-right">
              <ul class="nav navbar-nav"> 
                <li><a href="/#how_it_works">How it works</a></li>
                <li id="categories-link" class="hidden"><a href="/#categories">Categories</a></li>
                <li id="print-link" class="hidden"><a href="/#print">Print Your Model</a></li>
                <li id="register-link" class="hidden"><a href="/#register">Sign up</a></li>
                <li id="login-link" class="hidden"><a href="/#login">Login</a></li>
                <li id="logout-link" class="hidden"><a href="/#logout">Logout</a></li>
                <li id="profile-link" class="hidden dropdown"><a id="logged-name" href="" data-toggle="dropdown" role="button" aria-expanded="false" class="dropdown-toggle"><span class="caret"></span></a>
                  <ul role="menu" class="dropdown-menu">
                    <li><a href="#profileView" data-toggle="modal" id="profile">Edit profile</a></li>
                    <li><a href="#basketView" data-toggle="modal" id="basket">Shopping cart</a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <div id="home" class="indextab hidden"></div>
    <div id="how_it_works" class="indextab hidden"></div>
    <div id="categories" class="indextab hidden"></div>
    <div id="print" class="indextab hidden"></div>
    <div id="login" class="indextab hidden"></div>
    <div id="register" class="indextab hidden"></div>
    <div id="logout" class="indextab hidden"></div>
    <div id="model_detail2" class="modal fade"></div>
    <div id="basketView" class="modal fade"></div>
    <div id="profileView" class="modal fade"></div>
    
    
    
    
    
    
    
    
    
    <script type="text/template" id="search-template">
      <div class="container">
        <div class="row mt20">
          <h1 class="text-center +txtshadow">What do you want to print today ?</h1>
          <div class="col-lg-12 mt20">
            <div class="m3d-searchbar"></div>
            <input type="search" autocomplete="off" autofocus="autofocus" placeholder="Robot..." class="search_input m3d-searchbar__input"/><span class="glyphicon m3d-searchbar__icon --loupe"></span>
          </div>
        </div>
        <div class="row mt20">
          <div class="col-lg-12">
            <div id="search_results" class="row"></div>
          </div>
        </div>
        <div class="row mt20">
          <div class="col-lg-12">
            <h3>Recently printed
              <div class="row"><% _.each(models,function(model){ %>
                <div data-id="<%= model.get('id') %>" class="col-md-3 col-sm-6 mt30 model_detail">
                  <div class="m3d-tile"><a data-toggle="modal" href="#model_detail2" class="m3d-tile__content"><img src="<%= model.get('image_url') %>" class="img-responsive"/></a>
                    <div class="m3d-tile__info"><span class="left"><%= model.get('name') %></span><span class="right"><%= model.get('price') %> &euro;</span></div>
                  </div>
                </div><% }); %>
              </div>
            </h3>
          </div>
        </div>
      </div>
    </script>
    <script type="text/template" id="modal-model-detail-template">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 style="color:black" class="modal-title text-center"><%= model.get('name')%></h2>
          </div>
          <div class="modal-body"><img src="<%= model.get('image_url')%>" class="img-responsive"/></div>
          <div class="modal-footer"><a href="#categories/<%=model.get('category').data.id%>" class="left">Category: <%=model.get('category').data.name%></a><span class="left">Price: <%= model.get('price')%> &euro;</span><% var t = (model.get('printing_time')/60).toFixed(2);%><span class="left fa fa-clock-o"> <%= t%> mins</span><% if (logged) { %>
            <button type="button" id="add_to_cart" class="btn btn-primary btn-lg">+</button><% }else{%><a href="#register" class="btn btn-primary btn-lg">Register</a><% } %>
          </div>
        </div>
      </div>
      
    </script>
    <script type="text/template" id="modal-basket-template">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 style="color:black" class="modal-title text-center"><i class="fa fa-shopping-cart"> Shopping cart</i></h2>
          </div>
          <div class="modal-body --padding">
            <div id="basket_obsah"><% _.each(models,function(model){ %>
              <div class="row mt20">
                <div class="col-lg-10 col-lg-offset-1">
                  <div class="modal-body__item"><span class="ml20"><%= model.pocet %></span><span class="ml20">x</span><span class="ml20"> </span><span><%= model.model.name %></span><span class="ml20"> ( <%= model.model.price %> &euro;)</span>
                    <div class="pull-right ml20">
                      <button type="button" data-id="<%= model.model.id %>" class="btn btn-primary btn-sm plus +font-md ml20">+</button>
                      <button type="button" data-id="<%= model.model.id %>" class="btn left btn-default btn-sm minus">-</button>
                    </div>
                    <div class="pull-right"><span class="ml20"><%= model.model.price*model.pocet %> &euro;</span></div>
                  </div>
                </div>
              </div><% }); %>
              <hr/>
              <div class="row mt20">
                <div class="col-lg-10 col-lg-offset-1">
                  <div class="modal-body__item"><span class="ml20">Total</span><span class="pull-right price"><%= total%> &euro;</span></div>
                </div>
              </div>
              <div class="modal-footer mt20">
                <button type="button" id="hide_basket" class="left btn btn-default btn-lg">Close</button>
                <button type="button" id="next_to_address" class="btn btn-primary btn-lg">Next</button>
              </div>
            </div>
            <div id="basket_address" hidden="hidden">
              <form id="basket_address_checkout_form">
                <div class="row mt20">
                  <div class="col-lg-10 col-lg-offset-1">
                    <input type="text" name="first_name" value="<%= user.first_name%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                    <label>First</label>
                  </div>
                </div>
                <div class="row mt20">
                  <div class="col-lg-10 col-lg-offset-1">
                    <input type="text" name="last_name" value="<%= user.last_name%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                    <label>Last</label>
                  </div>
                </div>
                <div class="row mt20">
                  <div class="col-lg-10 col-lg-offset-1">
                    <input type="text" name="street" value="<%= user.street%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                    <label>Street</label>
                  </div>
                </div>
                <div class="row mt20">
                  <div class="col-lg-10 col-lg-offset-1">
                    <input type="text" name="town" value="<%= user.town%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                    <label>Town</label>
                  </div>
                </div>
                <div class="row mt20">
                  <div class="col-lg-10 col-lg-offset-1">
                    <input type="text" name="country" value="<%= user.country%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                    <label>State</label>
                  </div>
                </div>
                <div class="row mt20">
                  <div class="col-lg-10 col-lg-offset-1">
                    <input type="text" name="zip_code" value="<%= user.zip_code%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                    <label>Zip</label>
                  </div>
                </div>
                <div class="modal-footer mt20">
                  <button type="button" id="back_to_obsah" class="left btn btn-default btn-lg">Back</button>
                  <button type="submit" id="next_to_checkout" class="btn btn-primary btn-lg">Next</button>
                </div>
              </form>
            </div>
            <div id="basket_checkout" hidden="hidden"></div>
          </div>
        </div>
      </div>
    </script>
    <script type="text/template" id="partial_basket-template"><% _.each(models,function(model){ %>
      <div class="row mt20">
        <div class="col-lg-10 col-lg-offset-1">
          <div class="modal-body__item"><span class="ml20"><%= model.pocet %></span><span class="ml20">x</span><span class="ml20"> </span><span><%= model.model.name %></span><span class="ml20"> ( <%= model.model.price %> &euro;)</span>
            <div class="pull-right ml20">
              <button type="button" data-id="<%= model.model.id %>" class="btn btn-primary btn-sm plus +font-md ml20">+</button>
              <button type="button" data-id="<%= model.model.id %>" class="btn left btn-default btn-sm minus">-</button>
            </div>
            <div class="pull-right"><span class="ml20"><%= model.model.price*model.pocet %> &euro;</span></div>
          </div>
        </div>
      </div><% }); %>
      <hr/>
      <div class="row mt20">
        <div class="col-lg-10 col-lg-offset-1">
          <div class="modal-body__item"><span>Total</span><span class="pull-right price"><%= total%> &euro;</span></div>
        </div>
      </div>
      <div class="modal-footer mt20">
        <button type="button" id="hide_basket" class="left btn btn-default btn-lg">Close</button>
        <button type="button" id="next_to_address" class="btn btn-primary btn-lg">Next</button>
      </div>
    </script>
    <script type="text/template" id="checkout-template"><% _.each(order,function(model){ %>
      <div class="row mt20">
        <div class="col-lg-10 col-lg-offset-1">
          <div class="modal-body__item"><span class="ml20"><%= model.pocet %></span><span class="ml20">x</span><span class="ml20"> </span><span><%= model.model.name %></span><span class="ml20"> ( <%= model.model.price %> &euro;)</span>
            <div class="pull-right ml20"></div>
            <div class="pull-right"><span class="ml20"><%= model.model.price*model.pocet %> &euro;</span></div>
          </div>
        </div>
      </div><% }); %>
      <hr/>
      <div class="row mt10">
        <div class="col-lg-10 col-lg-offset-1">
          <div class="modal-body__item"><span class="ml20">Total</span><span class="pull-right"><%= total%> &euro;</span></div>
        </div>
      </div>
      <hr/>
      <div class="row mt10">
        <div class="col-lg-10 col-lg-offset-1">
          <div class="modal-body__item"><span>Delivery information</span><span class="pull-right"><%= user.first_name%> <%= user.last_name%></span></div>
        </div>
      </div>
      <div class="row mt10">
        <div class="col-lg-10 col-lg-offset-1">
          <div class="modal-body__item"><span class="pull-right"><%= user.street%></span></div>
        </div>
      </div>
      <div class="row mt10">
        <div class="col-lg-10 col-lg-offset-1">
          <div class="modal-body__item"><span class="pull-right"><%= user.town%>, <%= user.zip_code%></span></div>
        </div>
      </div>
      <div class="row mt10">
        <div class="col-lg-10 col-lg-offset-1">
          <div class="modal-body__item"><span class="pull-right"><%= user.country%></span></div>
        </div>
      </div>
      <div class="modal-footer mt20">
        <button type="button" id="hide_basket" class="left btn btn-default btn-lg">Close</button>
        <button type="button" id="back_to_address" class="pull-left btn btn-primary btn-lg">Back</button>
        <button type="button" id="order" class="btn btn-primary btn-lg">Send oder</button>
      </div>
      
      
    </script>
    <script type="text/template" id="print-template">
      <div class="container">
        <div class="row mt20">
          <h1 class="text-center --shadow">Upload your model and let us print it for you !</h1>
        </div>
        <div class="row mt40 text-center">
          <div class="m3d-upload btn btn-lg"><i class="fa fa-cloud m3d-upload__icon"></i>
            <input id="upload_input" type="file"/><span>Upload model</span>
          </div>
        </div>
      </div>
    </script>
    <script type="text/template" id="categories-template">
      <div class="container">
        <div id="categories-container" class="row">
          <div class="col-lg-12">
            <h2>Categories</h2><% _.each(categories,function(category){ %>
            <div class="col-md-3 col-sm-6 mt30">
              <div class="m3d-tile"><a href="#categories/<%= category.id %>" class="category m3d-tile__content"><img src="<%= category.image_url %>" class="img-responsive"/></a>
                <div class="m3d-tile__info --badge"><span class="left"><%= category.name %></span><span class="right"><%= category.model_count %></span></div>
              </div>
            </div><% }); %>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12"><% _.each(categories,function(category){ %>
            <div id="<%= category.id %>-cat-cont" class="cats-conts"></div><% }); %>
          </div>
        </div>
      </div>
    </script>
    <script type="text/template" id="category-cont-template">
      <h2>Category / <%= category.name%></h2><% _.each(models,function(model){ %>
      <div data-id="<%= model.get('id') %>" class="col-md-3 col-sm-6 mt30 model_detail">
        <div class="m3d-tile"><a data-toggle="modal" href="#model_detail2" class="m3d-tile__content"><img src="<%= model.get('image_url') %>" class="img-responsive"/></a>
          <div class="m3d-tile__info"><span class="left"><%= model.get('name') %></span><span class="right"><%= model.get('price') %> &euro;</span></div>
        </div>
      </div><% }); %>
    </script>
    <script type="text/template" id="login-template">
      <div class="container">
        <form id="login-form">
          <div class="row mt20">
            <h1 class="text-center +txtshadow">Login</h1>
          </div>
          <div class="row mt40">
            <div class="col-lg-6 col-lg-offset-3">
              <input type="email" name="email" autocomplete="off" autofocus="autofocus" placeholder="Email" required="required" class="m3d-searchbar__input --lowercase"/>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-6 col-lg-offset-3">
              <input type="password" name="password" autocomplete="off" autofocus="autofocus" placeholder="Password" required="required" class="m3d-searchbar__input --lowercase"/>
            </div>
          </div>
          <div class="row mt20">
            <div class="col-lg-6 col-lg-offset-3">
              <button type="submit" class="btn btn-default btn-lg pull-right +bxshadow">Login</button><a href="forgotpassword.html" class="pull-left">Forgot password?</a>
            </div>
          </div>
        </form>
        <div id="log_message"></div>
      </div>
    </script>
    <script type="text/template" id="register-template">
      <div class="container">
        <form id="register-form">
          <div class="row mt20">
            <h1 class="text-center +txtshadow">Sign up</h1>
          </div>
          <div class="row mt40">
            <div class="col-lg-6 col-lg-offset-3">
              <input type="email" name="email" autocomplete="off" autofocus="autofocus" placeholder="Email" required="required" class="m3d-searchbar__input --lowercase"/>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-6 col-lg-offset-3">
              <input type="password" name="password" autocomplete="off" autofocus="autofocus" placeholder="Password" required="required" class="m3d-searchbar__input --lowercase"/>
            </div>
          </div>
          <div class="row mt20">
            <div class="col-lg-6 col-lg-offset-3">
              <button type="submit" class="btn btn-default btn-lg pull-right +bxshadow">Sign up</button>
            </div>
          </div>
        </form>
        <div class="row mt20">
          <h1 id="reg_message" class="text-center +txtshadow"></h1>
        </div>
      </div>
    </script>
    <script type="text/template" id="modal-profile-template">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"></div>
          <h2 style="color:black" class="modal-title text-center">Edit profile</h2>
          <form id="profile-form">
            <div class="modal-body --padding">
              <div class="row mt20">
                <div class="col-lg-10 col-lg-offset-1">
                  <input type="email" name="email" value="<%= user.email%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                  <label>Email</label>
                </div>
              </div>
              <div class="row mt20">
                <div class="col-lg-10 col-lg-offset-1">
                  <input type="text" name="first_name" value="<%= user.first_name%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                  <label>First</label>
                </div>
              </div>
              <div class="row mt20">
                <div class="col-lg-10 col-lg-offset-1">
                  <input type="text" name="last_name" value="<%= user.last_name%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                  <label>Last</label>
                </div>
              </div>
              <div class="row mt20">
                <div class="col-lg-10 col-lg-offset-1">
                  <input type="text" name="street" value="<%= user.street%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                  <label>Street</label>
                </div>
              </div>
              <div class="row mt20">
                <div class="col-lg-10 col-lg-offset-1">
                  <input type="text" name="town" value="<%= user.town%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                  <label>Town</label>
                </div>
              </div>
              <div class="row mt20">
                <div class="col-lg-10 col-lg-offset-1">
                  <input type="text" name="country" value="<%= user.country%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                  <label>State</label>
                </div>
              </div>
              <div class="row mt20">
                <div class="col-lg-10 col-lg-offset-1">
                  <input type="text" name="zip_code" value="<%= user.zip_code%>" autocomplete="off" required="required" class="m3d-searchbar__input --lowercase --gray"/>
                  <label>Zip</label>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary btn-lg mt20">Save changes</button>
            </div>
          </form>
        </div>
      </div>
    </script>
    <script type="text/template" id="search_results-template"><% _.each(models,function(model){ %>
      <div data-id="<%= model.id %>" class="col-md-3 col-sm-6 mt30 model_detail_resp">
        <div class="m3d-tile"><a data-toggle="modal" href="#model_detail2" class="m3d-tile__content"><img src="<%= model.image_url %>" class="img-responsive"/></a>
          <div class="m3d-tile__info"><span class="left"><%= model.name %></span><span class="right"><%= model.price %> &euro;</span></div>
        </div>
      </div><% }); %>
    </script>
    <script type="text/template" id="how-template">
      <div class="container">
        <div class="row mt20">
          <h1 class="text-center +txtshadow">How it works ?</h1>
        </div>
      </div>
    </script>
  </body>
</html>