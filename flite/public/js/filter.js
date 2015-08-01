var flite = angular.module('Flite', ['parse-angular']);


flite.run(function($rootScope) {
    Parse.initialize("TYM8QwWiHHFHBogeIk8N2UahFS5p9fvoLpRjG5LL", "3iOvI03egswlVQn5K1WMCLdLQJbjHxoAoYN7o3Wm"); 
    
    if(Parse.User.current() != null){
        $rootScope.sessionUser = Parse.User.current();
    }

    window.fbAsyncInit = function() {
        Parse.FacebookUtils.init({ // this line replaces FB.init({
            appId      : '792544870853072', // Facebook App ID
            cookie     : true,  // enable cookies to allow Parse to access the session
            xfbml      : true,  // initialize Facebook social plugins on the page
            version    : 'v2.4' // point to the latest Facebook Graph API version
        });
    // Run code after the Facebook SDK is loaded.
    };

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
});

flite.controller('UserForm', function($rootScope){

    this.user = new Parse.User();

    this.signUp = function(){
        var temp = this;

        var User = Parse.Object.extend("_User");
        var user = new User();

        user.set("username", this.user.name);
        user.set("password", this.user.password);
        user.set("email", this.user.email);
        user.set("phoneNumber", this.user.phone);
        user.set("creditNumber", this.user.credit);
        user.set("admin", this.user.admin);

        user.signUp(null, {
          success: function(user) {
            $rootScope.sessionUser = Parse.User.current();
            alert("Welcome! Now link your Facebook account please");
          },
          error: function(item, error) {
            console.log('Failed to create new object, with error code: ' + error.message);
          }
        });
    }

    this.logIn = function(){
        Parse.User.logIn(this.user.name, this.user.password, {
          success: function(user) {
            // Do stuff after successful login.
            $rootScope.sessionUser = Parse.User.current();
            window.location.href = "index.html";
          },
          error: function(user, error) {
            // The login failed. Check error to see why.
          }
        });
    };

    this.fLink = function() {
        if (!Parse.FacebookUtils.isLinked($rootScope.sessionUser)) {
          Parse.FacebookUtils.link($rootScope.sessionUser, null, {
            success: function(user) {
              alert("Succesfully linked with Facebook!");
              window.location.href = "index.html";
            },
            error: function(user, error) {
              alert(error.message);
            }
          });
        }
    };

    this.logOut = function(){
        Parse.User.logOut();
        $rootScope.sessionUser = Parse.User.current();
    }
});

flite.controller('Logistics', function ($rootScope){
    this.sender={user: $rootScope.sessionUser, reciever: null, from: "", to:"", byWhen: new Date(), item:null};

    this.reciever={name: "", phone:"", address: ""};

    this.item={user: $rootScope.sessionUser, name: "", size: 1, weight: 1, value:1};

    var temp = this;

    this.save= function(){
        var Item = Parse.Object.extend("Item");
        var item = new Item();
        item.set("name", this.item.name);
        item.set("user", this.item.user);
        item.set("size", this.item.size);
        item.set("weight", this.item.weight);
        item.set("value", this.item.value);


        var Sender = Parse.Object.extend("Senders");
        var sender = new Sender();
        sender.set("user", this.sender.user);
        
        sender.set("from", this.sender.from);
        sender.set("to", this.sender.to);
        sender.set("byWhen", this.sender.byWhen);
        


        var Reciever = Parse.Object.extend("Recievers");
        var reciever = new Reciever();
        reciever.set("name", this.reciever.name);
        reciever.set("phone", this.reciever.phone);
        reciever.set("address", this.reciever.address);

        item.save(null, {
          success: function(item) {
            sender.set("item", item);

            reciever.save(null, {
              success: function(reciever) {

                sender.set("reciever", reciever);
                sender.save(null, {
                  success: function(sender) {
                    alert("Success!")
                  },
                  error: function(item, error) {
                    console.log('Failed to create new object, with error code: ' + error.message);
                  }
                });
              },
              error: function(item, error) {
                console.log('Failed to create new object, with error code: ' + error.message);
              }
            });
          },
          error: function(item, error) {
            console.log('Failed to create new object, with error code: ' + error.message);
          }
        });
    };

    this.weightLabels = ["<2kg","2-5kg","5-10kg","10-16kg","16-23kg"];
    this.sizeLabels = ["small items(phone, watch, etc)","medium-small(clothes, shoe, etc)",
    "medium(bag, laptop, etc)","medium-large(carry-on, etc)","large(big luggage, etc)"];
    this.valueLabels = ["<$500","$500-$1000","$1000-$1500","$1500-$2000","$2000-$2500"];

    this.weightprice = function(){
      if (this.item.weight == 1){
        return 10;
      }else if(this.item.weight == 2){
        return 30;
      }else if(this.item.weight == 3){
        return 80;
      }else if(this.item.weight == 4){
        return 140;
      }else if(this.item.weight == 5){
        return 200;
      }
    };

    this.sizeprice = function(){
      if(this.item.size == 1){
        return 9.99;
      }else if(this.item.size == 2){
        return 19.99;
      }else if(this.item.size == 3){
        return 99.99;
      }else if(this.item.size == 4){
        return 150.99;
      }else if(this.item.size == 5){
        return 199.99;
      }
    };

    this.valueprice = function(){
      if(this.item.value == 1){
        return 10;
      }else if(this.item.value == 2){
        return 20;
      }else if(this.item.value == 3){
        return 40;
      }else if(this.item.value == 4){
        return 70;
      }else if(this.item.value == 5){
        return 100;
      }
    };

    this.total = function(){
      return this.weightprice() + this.sizeprice() + this.valueprice();
    };


    var placeSearch, autocomplete, autocomplete2, autocomplete3;

    this.initialize = function() {
        autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), 
          { types: [ '(cities)' ] });

        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var place = autocomplete.getPlace();
            temp.sender.from = place.formatted_address;
        });

        autocomplete2 = new google.maps.places.Autocomplete(document.getElementById('autocomplete2'), 
          { types: [ '(cities)' ] });

        google.maps.event.addListener(autocomplete2, 'place_changed', function() {
            var place = autocomplete2.getPlace();
            temp.sender.to = place.formatted_address;
        });

        autocomplete3 = new google.maps.places.Autocomplete(document.getElementById('autocomplete3'), 
          { types: [ 'geocode' ] });

        google.maps.event.addListener(autocomplete3, 'place_changed', function() {
            var place = autocomplete3.getPlace();
            temp.reciever.address = place.formatted_address;
        });
    };
});


flite.factory('Matches', function () {
    var data = [];

    return {
        get: function () {
            return data;
        },
        set: function (id) {
            data.push(id);
        }
    };
});


flite.controller('Deliver', function ($rootScope, Matches){
  this.deliverer={user: $rootScope.sessionUser, sender: null, from: "", to:"", reciever: null, 
  dateOfTravel: new Date()};

  this.senders = [];

  var temp = this;

  this.save= function(){
      var Deliverers = Parse.Object.extend("Deliverers");
      var deliverer = new Deliverers();
      
      deliverer.set("user", this.deliverer.user);
      deliverer.set("sender", this.deliverer.sender);
      deliverer.set("from", this.deliverer.from);
      deliverer.set("to", this.deliverer.to);
      deliverer.set("reciever", this.deliverer.reciever);
      deliverer.set("dateOfTravel", this.deliverer.dateOfTravel);

      deliverer.save(null, {
        success: function(deliverer) {
          var match = new Parse.Query("Senders");

          match.equalTo("from", temp.deliverer.from);
          match.equalTo("to", temp.deliverer.to);
          match.greaterThan("byWhen", temp.deliverer.dateOfTravel);
          
          match.find({
            success: function(senders) {
              if(senders.length == 0){
                alert("Found no matches");
              }

              for (var i = 0; i < senders.length; i++) {
                var sender = senders[i];
                Matches.set(sender.id);
                alert("Found a match with a sender with id: " + Matches.data.length);
              }

              window.location.href = "search.html";
            },
            error: function(error) {
              alert("Error: " + error.code + " " + error.message);
            }
          });
        },
        error: function(deliverer, error) {
          console.log('Failed to create new object, with error code: ' + error.message);
        }
      });
  };

  var placeSearch, autocomplete, autocomplete2;

  this.initialize = function() {
      autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), 
        { types: [ '(cities)' ] });

      google.maps.event.addListener(autocomplete, 'place_changed', function() {
          var place = autocomplete.getPlace();
          temp.deliverer.from = place.formatted_address;
      });

      autocomplete2 = new google.maps.places.Autocomplete(document.getElementById('autocomplete2'), 
        { types: [ '(cities)' ] });

      google.maps.event.addListener(autocomplete2, 'place_changed', function() {
          var place = autocomplete2.getPlace();
          temp.deliverer.to = place.formatted_address;
      });
  };
});

flite.controller('Search', function ($rootScope, $scope, Matches){
  // $rootScope.matches = [];
  // $rootScope.matches[0]= "tLI65xSl3o";
  // $rootScope.matches[1]= "1AFhvZuDbo";

  var senders = new Parse.Query("Senders");

  this.posts = [];

  $scope.clicked = false 
  
  var user = new Parse.Query("_User");
  var reciever = new Parse.Query("Recievers");
  var item = new Parse.Query("Item");

  var temp = this;

  var matches = Matches.get();

  for (var i= 0; i < matches; i++) {
    senders.get(matches[i], {
      success: function(sender) {

        user.get(sender.get("user").id, {
          success: function(user) {

            reciever.get(sender.get("reciever").id, {
              success: function(reciever) {

                item.get(sender.get("item").id, {
                  success: function(item) {

                    temp.posts.push({
                      user: user.get("username"), address: reciever.get("address"), 
                      when: sender.get("byWhen"), item: item.get("name"), weight: item.get("weight"), 
                      size: item.get("size"), price: item.get("price")
                    });

                  },
                  error: function(object, error) {
                    // The object was not retrieved successfully.
                    // error is a Parse.Error with an error code and message.
                  }
                });

              },
              error: function(object, error) {
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
              }
            });
          },
          error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
          }
        });
      },
      error: function(object, error) {
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and message.
      }
    });
  }
  
});