var myapp = angular.module('myapp', ["ngResource", 'ngRoute', "Devise","ui.router"]);

myapp.controller('signOutCtrl', ['$scope','$state', '$http', '$resource','Auth','$location', '$window','Tasks','Task', function($scope, $state, $http, $resource, Auth, $location, $window, $filter, Tasks, Task) {
  $scope.signout = function() {
    $http.delete('/users/sign_out.json')
    .then(function(response) {
      $window.location.href = '/';
    });  
  };
  
  //~ $scope.edit_user = function(){
    //~ $state.go('edit_user');
  //~ }
  
  $scope.users = function(){
    alert("users");
    $state.go('users');
  };      
}]);
    
myapp.controller('userCtrl', ['$scope', '$http', '$resource','Auth','$location', '$window','Tasks','Task','$rootScope', function($scope, $http, $resource, Auth, $location, $window, $filter, Tasks, Task, $rootScope) {
  $scope.task = { description: '', task_date: ''}; 
  $scope.task.shared_users = '';
  $scope.current_user = '';
  $scope.sign_up = function() {
    var credentials = {
      email: $scope.email,
      password: $scope.password ,
      password_confirmation: $scope.cpassword,
      name: $scope.name 
    };
    $http.post('/users.json', {"user" : credentials})
    .then(function(response) {
      $window.location.href = '/tasks';
    });   
  }      
  $scope.sign_in = function() {
    var credentials = {
      email: $scope.email,
      password: $scope.password,
      name: $scope.name  
    };
    $http.post('/users/sign_in.json', {"user" : credentials})
    .then(function(response) {
      //~ $window.sessionStorage.current_user = response.data;
      //~ alert( $window.sessionStorage.current_user);
      $window.location.href = '/tasks';
    });   
  };
  $scope.update_user = function() {
    $http.put('/users.json', {"user" : {"name": $scope.name,"email": $scope.email, "current_password": $scope.curpassword}})
    .then(function(response) {
      $window.location.href = '/tasks';
    });
  };

  $scope.tasks_ids = [];
  $scope.users = [];
  Tasks.query(function(data){
    $scope.tasks = data[0].tasks;
    $scope.users = data[0].users;
    $scope.shared_tasks = data[0].shared_tasks;
    angular.forEach(data[0].tasks,function(task){
      $scope.tasks_ids.push(task.id);
    });
    //map method is not working on chrome.
  });
  
  var reminder = $resource("/tasks/tasks_reminder.json");
  $scope.reminder_tasks = reminder.query();
  
  $scope.addEditTask = function(task) { 
    if($.inArray(task.id, $scope.tasks_ids) != -1){ 
      dataObject = {id : task.id, description : $scope.task.description, task_date : $scope.task.task_date}
      Task.update(dataObject, function(data){
        $scope.reminder_tasks.push(data.task);
        $scope.flash(data);
      });  
      //var responsePromise = $http.put("/tasks/" + task.id +".json" , dataObject, {});
    } else {
      if ($scope.form.$valid) {
        // Submit as normal
        Auth.currentUser().then(function(user) {
          dataObject = {description : $scope.task.description, user_id : user.id, task_date : $scope.task.task_date}
          Tasks.create(dataObject, function(data, status, headers, config) {
            $scope.tasks.push(data.task);
            $scope.reminder_tasks.push(data.task);
            $scope.flash(data);
          });  
          //~ //var responsePromise = $http.post("/tasks.json" , dataObject).
            //~ success(function(data, status, headers, config) {
              //~ $scope.tasks.push(data);
            //~ });
        });
      } else {
        $scope.form.submitted = true;
      }
    }  
  };
  
  $scope.editTask = function(task) {
    $scope.task = task;
  }
  
  $scope.deleteTask = function(task) {
    if (confirm("Are you sure you want to delete this task?")){
      Task.delete({id:task.id}, function(data){
        $scope.tasks.splice($scope.tasks.indexOf(task), 1);
        $scope.flash(data);
      });
    }  
  }
  
  $scope.flash = function(data) {
    $( "#flash-messages" ).addClass('alert alert-success alert-dismissible').html('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><p>'+ data.message + '</p>');
  }  
  
  $scope.shareTask = function(user, task) {
    dataObject = {task_id: task.id, user_id: user.id}
    responsePromise = $http.post("/shared_tasks.json", dataObject).success(function(data) {
      task.shared_users.push({"name": user.name });
      $scope.flash(data);
    });
  }
  
  $scope.reset = function() {
    $scope.task = { description: '', task_date: ''}
  };
  
  $scope.status_lists = ['New','Done','In-process']
  
  $scope.addStatus = function(task){
    dataObject = {id : task.id, status: task.status}
    Task.update(dataObject, function(data) {
      $scope.flash(data);
    });
  }
  
  $scope.removeSharedTask = function (user, task){
    if (confirm("Are you sure you want to remove this shared task ?")){
      dataObject = {task_id : task.id, user_id : user.id};
      var responsePromise = $http.post("/shared_tasks/remove.json", dataObject, {}).success(function(data) {
        task.shared_users.splice(task.shared_users.indexOf(user.id), 1);
        $scope.flash(data);
      });
    }  
  }
}]);

myapp.filter('getUserName', function() {
  return function(user_id, users){
    angular.forEach(users, function(user){
      if(user.id == user_id){
        user_name = user.name;
      }  
    }); 
  return user_name;   
  }
});

myapp.factory('Tasks', ['$resource',function($resource){
  return $resource('/tasks.json', {},{
    show: { method: 'GET'},
    query: { method: 'GET', isArray: true },
    create: { method: 'POST' }
  })
}]);

myapp.factory('Task', ['$resource', function($resource){
  return $resource('/tasks/:id.json', {}, {
    show: { method: 'GET'},
    update: { method: 'PUT', params: {id: '@id'} },
    delete: { method: 'DELETE', params: {id: '@id'} }
  });
}]);

 
myapp.config(function(AuthProvider) {
  AuthProvider.registerPath('/users.json');
  AuthProvider.registerMethod('Post');
  AuthProvider.resourceName('user');
  
  AuthProvider.loginPath('/users/sign_in.json');
  AuthProvider.loginMethod('Post');
  AuthProvider.resourceName('user');
  
  AuthProvider.logoutPath('/users/sign_out.json');
  AuthProvider.logoutMethod('Delete');
});
myapp.config(['$stateProvider','$locationProvider','$urlRouterProvider', function($stateProvider, $locationProvider, $urlRouterProvider){
  //$urlRouterProvider.otherwise('/tasks');
  alert("1");
  $stateProvider.state('users', {
    url: '/users',
    templateUrl: 'templates/index.html'
  })
}
]);
//~ myapp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider,$urlRouterProvider) {
  
  //~ $routeProvider.when('/users',{
    //~ templateUrl: 'app/views/users/index.html.erb',
    //~ controller: 'signOutCtrl'
  //~ });
  //~ $routeProvider.when('/user_edit',{
    //~ templateUrl: 'app/views/devise/registrations/edit.html.erb',
    //~ controller: 'signOutCtrl'
  //~ });
  //~ $routeProvider.otherwise({
    //~ redirectTo: '/users'
  //~ });
  //~ }
//~ ]);

// custom directives for practice //
myapp.directive('appname', function(){
  return {
    restrict: "E",
    template: "<div enter leave> Todo List </div>"
  }
});

//~ myapp.directive('message', function() {
  //~ return {
    //~ //restrict: "C",
    //~ link: function() {
      //~ alert("Happy new year");
    //~ }
  //~ }
//~ });
//~ myapp.directive('comment', function() {
  //~ return {
    //~ restrict: "C",
  //~ }  
//~ });

//~ myapp.directive('enter', function(){
  //~ return function(scope, element, attrs) {
    //~ element.bind('mouseenter', function(){
      //~ console.log("This is mouse enter event");
      //~ element.addClass("title");
    //~ });
  //~ }
//~ });
//~ myapp.directive("panel", function () {
  //~ return {
    //~ restrict: "E",
    //~ transclude: true,
    //~ template: '<div class="panel">This is a panel component<div ng-transclude></div></div>'
  //~ }
//~ });

//~ myapp.directive('leave', function(){
  //~ return function(scope, element) {
    //~ element.bind('mouseleave', function(){
      //~ //console.log("This is mouse leave event");
      //~ element.removeClass("title");
    //~ });
  //~ }
//~ });
//~ myapp.run(function($rootScope, $log){
  //~ $rootScope.$log = $log;
//~ });
//~ myapp.config(function($logProvider){
  //~ $logProvider.debugEnabled(true);
//~ });

myapp.directive('dateepicker', function() {
  return {
    restrict: 'A',
    // Always use along with an ng-model
    require: '?ngModel',

    link: function(scope, element, attrs, ngModel) {
      if (!ngModel) return;

      ngModel.$render = function() { //This will update the view with your model in case your model is changed by another code.
        element.datepicker('update', ngModel.$viewValue || '');
      };

      element.datepicker().on("changeDate",function(event){ 
        scope.$apply(function() {
          ngModel.$setViewValue(event.date);//This will update the model property bound to your ng-model whenever the datepicker's date changes.
        });
      });
    }
  };
});

