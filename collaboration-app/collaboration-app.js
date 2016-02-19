if(Meteor.isServer)
{
	var database = new MongoInternals.RemoteCollectionDriver("mongodb://127.0.0.1:3001/meteor");
	Tasks = new Mongo.Collection("tasks", {_driver: database});
	UserInfo = new Mongo.Collection("userInfo", {_driver: database});
	Discussions = new Mongo.Collection("discussions", {_driver: database});
}

if (Meteor.isClient) 
{
	Meteor.subscribe('tasks'); //Links the tasks database to its driver connection
	Tasks = new Mongo.Collection("tasks");
	
	Meteor.subscribe('userInfo');
	UserInfo = new Mongo.Collection("userInfo");
	
	Meteor.subscribe('discussions');
	Discussions = new Mongo.Collection("discussions");
	
    Router.map(function () {

      this.route('home', {
        path: '/',  //overrides the default '/home'
		data: function () {return {
			userData: UserInfo.findOne({user: Meteor.userId()})}
		}
      });

      this.route('forum', {
        data: function () {return {
			tasks: Tasks.find({ $and: [{assignedTo: ""}, {createdBy: {$not: Meteor.userId()}}]}, {sort: {createdAt: -1}}),
			userData: UserInfo.findOne({user: Meteor.userId()})}
		}
      });

      this.route('create', {
		data: function () {return {
			userData: UserInfo.findOne({user: Meteor.userId()})}
		}
	  });

      this.route('myTasks', {
	    data: function () {return {
			tasks: Tasks.find({ $and: [{ $or: [{completed1: ""}, {completed2: ""}]}, {$or: [{assignedTo: Meteor.userId()}, {createdBy: Meteor.userId()}]}]}, {sort: {createdAt: -1}}),
			userData: UserInfo.findOne({user: Meteor.userId()})}
		}
	  });
	  
	  this.route('viewTask', {
        path: '/task/:_id',
        data: function () {return {
			tasks: Tasks.findOne({_id: this.params._id}),
			userData: UserInfo.findOne({user: Meteor.userId()}),
			discussions: Discussions.find({task: this.params._id})}
		}
	});
	  
	  this.route('viewAssignedTask', {
        path: '/assigned/:_id',
        data: function () {return {
			tasks: Tasks.findOne({_id: this.params._id}),
			userData: UserInfo.findOne({user: Meteor.userId()}),
			discussions: Discussions.find({task: this.params._id})}
		}
      });
	  
	  this.route('tipUser', {
        data: function () {return {
			allUsers: UserInfo.find({}),
			userData: UserInfo.findOne({user: Meteor.userId()})}
		}
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
			  completed1: "",
			  completed2: "",
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
	
	    Template.tipUser.events({
      'click button': function (event) {

        //Get values from form element
		var enteredUser = document.getElementById('user').value;
		var credits = document.getElementById('credits').value;
		var currentUser = UserInfo.findOne({user: Meteor.userId()});
		var tippedUser = UserInfo.findOne({username: enteredUser})
		var minusCredits = currentUser.credits - credits;
		var addCredits = Number(tippedUser.credits) + Number(credits);
		
		if(tippedUser)
		{
			if(minusCredits >= 0 && credits > 0)
			{
				//Update Credits
				UserInfo.update({_id: currentUser._id}, {$set: {credits: minusCredits}});
				UserInfo.update({_id: tippedUser._id}, {$set: {credits: addCredits}});
				
				//Clear form
				document.getElementById('user').value = "";
				document.getElementById('credits').value = "";	
			}
			else
			{
				throw new Error("You don't have enough credits, please enter an amount you can afford")
			}
		}
		else
		{
			throw new Error("This user does not exist, please make sure you've entered their username correctly")
		}
      }
    });
	
	Template.viewTask.events({
		'click .taskButton': function (event) {
			
			//Assign task to current user
			Tasks.update(this.tasks._id, {$set: {assignedTo: Meteor.userId()}});

			document.getElementById("taskButton").style.display="none";
		}
	});
	
	Template.viewTask.events({
		'click .commentButton': function (event) {
			
			var newComment = document.getElementById('newComment').value;
			var taskId = Router.current().params._id;

			//Save entered comment to file
			Discussions.insert({
			  task: taskId,
			  comment: newComment,
			  createdBy: Meteor.user().username,
			  createdAt: new Date() // current time
			});
			
			//Clear form
			document.getElementById('newComment').value = "";
		}
	});
	
	Template.viewAssignedTask.events({
		'click .taskButton': function (event) {
			
		//Complete task for current user
		var taskId = Router.current().params._id;
		var currentTask = Tasks.findOne({_id: taskId});
			
		if(currentTask.completed1 != Meteor.userId() && currentTask.completed2 != Meteor.userId)
		{
				
			if(currentTask.completed1 == "")
				Tasks.update(taskId, {$set: {completed1: Meteor.userId()}});
			else
				Tasks.update(taskId, {$set: {completed2: Meteor.userId()}});
		}
			
		document.getElementById("taskButton").style.display="none";
		}
	});
		
	Template.viewAssignedTask.events({
		'click .commentButton': function (event) {
			
			var newComment = document.getElementById('newComment').value;
			var taskId = Router.current().params._id;

			//Save entered comment to file
			Discussions.insert({
			  task: taskId,
			  comment: newComment,
			  createdBy: Meteor.user().username,
			  createdAt: new Date() // current time
			});
			
			//Clear form
			document.getElementById('newComment').value = "";
		}
	});
	
	// --- Template Helpers ---
	Template.home.helpers(
	{
		addUser: function()
		{
			var found = false;
			var id = Meteor.userId();

			if(UserInfo.findOne({user: Meteor.userId()}))
			{
				found = true;
			}
			else if(found == false)
			{
				UserInfo.insert({user: Meteor.userId(), credits: "100", username: Meteor.user().username})
			}
	}});
	
	Template.create.helpers(
	{	
		genUserData: function()
		{
			var created = 0;
			var doc = UserInfo.findOne({user: Meteor.userId()});
			var creditElement = document.getElementById("currentCredits");
					
			if(doc && !creditElement)
			{
				console.log("Creating element");
				
				var creditPara = document.createElement("P");
				creditPara.setAttribute("id", "currentCredits")
				var textVar = document.createTextNode("Credits: " + doc.credits);
				creditPara.appendChild(textVar);

				var elementLoc = document.getElementById("head");

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
		
			if(doc && !creditElement)
			{
				console.log("Creating element");
				
				var creditPara = document.createElement("P");
				creditPara.setAttribute("id", "currentCredits")
				var textVar = document.createTextNode("Credits: " + doc.credits);
				creditPara.appendChild(textVar);

				var elementLoc = document.getElementById("head");

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
				var creditPara = document.createElement("P");
				creditPara.setAttribute("id", "currentCredits")
				var textVar = document.createTextNode("Credits: " + doc.credits);
				creditPara.appendChild(textVar);

				var elementLoc = document.getElementById("head");

				elementLoc.appendChild(creditPara);
				
				created = 1;		
			}
		}
	});

	Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
    }); 
}