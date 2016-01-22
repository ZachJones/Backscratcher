Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {

    Router.map(function () {

      this.route('home', {
        path: '/',  //overrides the default '/home'
      });

      this.route('forum', {
        data: function () {return Tasks.find({assignedTo: ""}, {sort: {createdAt: -1}})}
      });

      this.route('create', {
		  
	  });

      this.route('myTasks', {
	    data: function () {return Tasks.find({assignedTo: Meteor.userId()}, {sort: {createdAt: -1}})}
	  });
	  
	  this.route('viewTask', {
        path: '/task/:_id',
        data: function () {return Tasks.findOne({_id: this.params._id})},
      });
	  
	  this.route('viewAssignedTask', {
        path: '/assigned/:_id',
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
		  createdBy: Meteor.userId(),
		  assignedTo: "",
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
			Tasks.update(this._id, {$set: {assignedTo: Meteor.userId()}});

			document.getElementById("button").style.display="none";
		}
	});
	
	/* --- Do stuff on page load ---
	Template.viewTask.rendered = function(){
		if(this.assignedTo != "")
		{
			document.getElementById("button").style.display="none";
		}
	}
	*/
	
	Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
    }); 
}