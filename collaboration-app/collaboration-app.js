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
        data: function () {return Tasks.find({}, {sort: {createdAt: -1}})}, //set template data context
      });

      this.route('myTasks', {});
	  
	  this.route('viewTask', {
        path: '/task/:_id',
        data: function () {return Tasks.findOne({_id: this.params._id})},
      });
    });

    Template.create.events({
      "submit .new-task": function (event) {
        //Prevent default browser form submit
        event.preventDefault();
        //Get value from form element
        var text = event.target.text.value;

        //Insert a task into the collection
        Tasks.insert({
          text: text,
          createdAt: new Date() // current time
        });
        //Clear form
        event.target.text.value = "";
      }
    });
}
