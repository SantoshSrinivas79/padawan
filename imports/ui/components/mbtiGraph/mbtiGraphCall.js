import "./mbtiGraphRender.html";
import { User } from "/imports/api/users/users.js";
import { mbtiGraph } from "./mbtiGraph.js";
import { Template } from "meteor/templating";

Template.mbtiGraphRender.onCreated(function() {
  this.autorun(() => {
    this.subscription2 = this.subscribe("userList", this.userId, {
      onStop: function() {
        console.log("User List subscription stopped! ", arguments, this);
      },
      onReady: function() {
        console.log("User List subscription ready! ", arguments, this);
      }
    });
  });
});

Template.mbtiGraphRender.onRendered(function() {
    let userId = this.data.mbtiUID;
    let user = User.findOne({ _id: userId });
    let personality = user.MyProfile.UserType.Personality

    let valueIE = personality.IE.Value
    let valueNS = personality.NS.Value
    let valueTF = personality.TF.Value
    let valueJP = personality.JP.Value
    mbtiGraph(valueIE, valueNS, valueTF, valueJP, $("#grfTraits"), true, 50);
    // mbtiGraph(canvas, -50, 50, 20, -20);
});
