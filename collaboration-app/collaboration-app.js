Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {

    Router.map(function () {

      this.route('home', {
        path: '/',  //overrides the default '/home'
      });

      this.route('forum', {
        data: function () {return Tasks.find({}, {sort: {createdAt: -1}})}  //set template data context
      });

      this.route('create', {

      });

      this.route('myTasks', {});
	  
	  this.route('viewTask', {
        path: '/task/:_id',
        data: function () {return Tasks.findOne({_id: this.params._id})},
      });
    });

    Template.create.events({
      'click button': function (event) {

        //Get values from form element
		var title = document.getElementById('title').value;
		var description = document.getElementById('description').value;
		var credits = document.getElementById('credits').value;

        //Insert a task into the collection
        Tasks.insert({
          title: title,
		  description: description,
		  credits: credits,
          createdAt: new Date() // current time
        });
		
		//Clear form
        document.getElementById('title').value = "";
		document.getElementById('description').value = "";
		document.getElementById('credits').value = "";
      }
    });
	
	Template.viewTask.events({
		'click button': function (event) {
			
			//Assign task to current user
		}
	});
	
	Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
    }); 
}