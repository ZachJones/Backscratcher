if(Meteor.isServer)
{
	var database = new MongoInternals.RemoteCollectionDriver("mongodb://127.0.0.1:3001/meteor");
	Tasks = new Mongo.Collection("tasks", {_driver: database});
	//Meteor.publish('tasks', function() { return Tasks.find(); }); --- Not needed with autopublish
	
	//database.mongo.close();
	
	//var database2 = new MongoInternals.RemoteCollectionDriver("mongodb://127.0.0.1:3007/meteor");
	UserInfo = new Mongo.Collection("userInfo", {_driver: database});
}

if (Meteor.isClient) 
{
	Meteor.subscribe('tasks'); //Links the tasks database to its driver connection
	Tasks = new Mongo.Collection("tasks");
	
	Meteor.subscribe('userInfo');
	UserInfo = new Mongo.Collection("userInfo");
	
    Router.map(function () {

      this.route('home', {
        path: '/',  //overrides the default '/home'
      });

      this.route('forum', {
        data: function () {return Tasks.find({assignedTo: ""}, {sort: {createdAt: -1}})}
      });

      this.route('create', {
		data: function () {return UserInfo.find()}
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
		var currentUser = UserInfo.findOne({user: Meteor.userId()});
		var newCredits = currentUser.credits - credits;
		
		if(newCredits >= 0 && credits > 0)
		{
			//Insert a task into the collection
			Tasks.insert({
			  title: title,
			  description: description,
			  credits: credits,
			  createdBy: Meteor.userId(),
			  assignedTo: "",
			  createdAt: new Date() // current time
			});

			//Update credits
			UserInfo.update({_id: currentUser._id}, {$set: {credits: newCredits}});
			
			//Clear form
			document.getElementById('title').value = "";
			document.getElementById('description').value = "";
			document.getElementById('credits').value = "";	
		}
		else
		{
			throw new Error("You don't have enough credits, please enter an amount you can afford")
		}
      }
    });
	
	Template.viewTask.events({
		'click button': function (event) {
			
			//Assign task to current user
			Tasks.update(this._id, {$set: {assignedTo: Meteor.userId()}});

			document.getElementById("button").style.display="none";
		}
	});
	
	// --- Template Helpers ---
	Template.home.helpers(
	{
		addUser: function()
		{
			var found = false;
			var id = Meteor.userId();
			console.log(id);

			if(UserInfo.findOne({user: Meteor.userId()}))
			{
				console.log(UserInfo.findOne({user: Meteor.userId()}))
				found = true;
			}
			else if(found == false)
			{
				console.log("Created!")
				UserInfo.insert({user: Meteor.userId(), credits: "100"})
			}
	}});
	
	Template.create.helpers(
	{	
		genUserData: function()
		{
			var created = 0;
			var doc = UserInfo.findOne({user: Meteor.userId()});
			var creditElement = document.getElementById("currentCredits");
			
			//console.log(creditElement);
					
			if(doc && !creditElement)
			{
				console.log("Creating element");
				
				var creditPara = document.createElement("P");
				creditPara.setAttribute("id", "currentCredits")
				var textVar = document.createTextNode("Credits: " + doc.credits);
				creditPara.appendChild(textVar);
				
				//console.log(creditPara);
				
				var elementLoc = document.getElementById("head");
				
				//console.log(elementLoc);
				
				elementLoc.appendChild(creditPara);
				
				created = 1;		
			}
		}
	});
	
	Template.forum.helpers(
	{	
		genUserData: function()
		{
			var created = 0;
			var doc = UserInfo.findOne({user: Meteor.userId()})
			var creditElement = document.getElementById("currentCredits");
			
			//console.log(creditElement);
					
			if(doc && !creditElement)
			{
				console.log("Creating element");
				
				var creditPara = document.createElement("P");
				creditPara.setAttribute("id", "currentCredits")
				var textVar = document.createTextNode("Credits: " + doc.credits);
				creditPara.appendChild(textVar);
				
				//console.log(creditPara);
				
				var elementLoc = document.getElementById("head");
				
				//console.log(elementLoc);
				
				elementLoc.appendChild(creditPara);
				
				created = 1;		
			}
		}
	});

	Template.myTasks.helpers(
	{	
		genUserData: function()
		{
			var created = 0;
			var doc = UserInfo.findOne({user: Meteor.userId()})
			var creditElement = document.getElementById("currentCredits");
			
			console.log(creditElement);
					
			if(doc)
			{
				console.log(doc.credits); //How to reference the current credits?
				
				var creditPara = document.createElement("P");
				creditPara.setAttribute("id", "currentCredits")
				var textVar = document.createTextNode("Credits: " + doc.credits);
				creditPara.appendChild(textVar);
				
				console.log(creditPara);
				
				var elementLoc = document.getElementById("head");
				
				console.log(elementLoc);
				
				elementLoc.appendChild(creditPara);
				
				created = 1;		
			}
		}
	});
	

	Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
    }); 
}