var flite = angular.module('Flite', ['parse-angular']);

flite.run(function($rootScope) {
    Parse.initialize("TYM8QwWiHHFHBogeIk8N2UahFS5p9fvoLpRjG5LL", "3iOvI03egswlVQn5K1WMCLdLQJbjHxoAoYN7o3Wm"); 
    $rootScope.sessionUser = Parse.User.current();
});

flite.controller('AirportsList', function ($http) {
    var temp = this;

    this.query="";
    temp.airports = [ ];

    $http.get('http://fliite.parseapp.com/airports.json').
    success(function(data){
        temp.airports = data.airports;
    });
});

flite.filter('nameAndCity', function () {
  return function (items, query) {
    
    var filtered = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if ((item.name.toLowerCase().indexOf(query) >= 0 || item.city.toLowerCase().indexOf(query) >= 0 
        || item.code.toLowerCase().indexOf(query) >= 0 || item.country.toLowerCase().indexOf(query) >= 0) 
        && item.type == "Airports") {
        
        filtered.push(item);
      }
    }

    return filtered;
  };
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
          },
          error: function(user, error) {
            // The login failed. Check error to see why.
          }
        });
    }

    this.logOut = function(){
        Parse.User.logOut();
        $rootScope.sessionUser = Parse.User.current();
    }
});

flite.controller('ItemForm', function (){

    this.item={name: "", size: 1, weight: 1, value:1};
    var temp = this;

    this.save= function(){
        var Item = Parse.Object.extend("Item");
        var item = new Item();

        item.set("name", this.item.name);
        item.set("size", this.item.size);
        item.set("weight", this.item.weight);
        item.set("value", this.item.value);
        item.save(null, {
          success: function(item) {
            temp.item.name = "";  
            temp.item.size = 1;
            temp.item.value = 1;
            temp.item.weight = 1;
          },
          error: function(item, error) {
            console.log('Failed to create new object, with error code: ' + error.message);
          }
        });
    };

    this.get= function(){
        var temp = this;

        var query = new Parse.Query("Item");

        query.equalTo("name", "iPhone 6");
        
        query.first().then(function(result){
                temp.item.name = result.get("name");
                temp.item.size = result.get("size");
                temp.item.value = result.get("value");
                temp.item.weight = result.get("weight");
        }); 
    };    
});