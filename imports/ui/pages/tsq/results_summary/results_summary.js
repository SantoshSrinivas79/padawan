import './results_summary.html';
import { Template } from 'meteor/templating';
import { User } from '/imports/api/users/users.js';
import { KeyData, SkillsData, HelpText } from '/imports/client/clientSideDbs';
import TSQ_DATA from '/imports/api/tsq/TSQData';

const TSQ = require("/imports/api/tsq/tsq.js");

let user;
let allSkillsFromDB = new ReactiveVar(); // all the skills from the skill database - array of objs

async function getAllSkillsFromDB(list) {
    list.set(SkillsData.find().fetch());
    console.log('All Skills List: ', list);
    return list;
}

async function getUserWhenAdmin(teamUser) {
    var localUserId;
    let isAdmin = Roles.userIsInRole(Meteor.userId(), 'admin', Roles.GLOBAL_GROUP);
    if (!Roles.subscription.ready()) {
        console.log('Roles subscription not ready');
    } else if (isAdmin && FlowRouter.getParam('userId')) {
        localUserId = FlowRouter.getParam('userId');
    } else if (FlowRouter.getParam('userId')) {
        let nonAdminId = FlowRouter.getParam('userId');
        let realId = Meteor.userId();
        if (nonAdminId == realId || isAdmin) {
            localUserId = FlowRouter.getParam('userId');
        } else {
            FlowRouter.go('/char_sheet/' + realId);
        }
    } else {
        localUserId = Meteor.userId();
    }
    teamUser = User.findOne({ _id: localUserId });
    return teamUser;
}

Template.tsq_resultsSummary.onCreated(function(){
    this.autorun(async () => {
        console.log("We are not using key param");
        let cur = this;
        cur.subscription1 = await cur.subscribe('tsqUserList', cur.userId, {
            onStop: function() {
                console.log('tsq user List subscription stopped! ', arguments, cur);
            },
            onReady: async function() {
                console.log('tsq user List subscription ready! ', arguments, cur);
                let userId;
                if(FlowRouter.getParam('key')) {
                    console.log("We are using key param");
                    userId = FlowRouter.getParam('key');
                } else {
                    console.log("We are not using key param");
                    userId = Meteor.userId();
                }
                user = User.findOne({ _id: userId });
                if (user.MyProfile.technicalSkillsData === undefined || !user.MyProfile.technicalSkillsData) {
                    await TSQ.registerUser(user);
                }

                cur.tsqSkillSub = cur.subscribe('tsq.allSkills', {
                    onReady: () => {
                        // Load in the TSQ Test DATA
                        if (SkillsData.find().fetch().length < 1) {
                            for (skills of TSQ_DATA) {
                                let key = Object.keys(skills);
                                for (k of key) {
                                    for (skill of skills[key]) {
                                        Meteor.call('tsq.addSkill', skill.name);
                                    }
                                }
                            }
                        }
                    }
                });

                cur.keyDataSub = cur.subscribe('tsq.keyData', User.findOne({_id: userId}).MyProfile.technicalSkillsData, {
                    onReady: () => (Meteor.isDevelopment) ? console.log({ subName: 'tsq.keyData', readyStatus: true, arguments, THIS: cur}) : null,
                    onError: () => (Meteor.isDevelopment) ? console.log({ subName: 'tsq.keyData', readyStatus: false, arguments, THIS: cur}) : null,
                    onStop: () => (Meteor.isDevelopment) ? console.log({ subName: 'tsq.keyData', readyStatus: false, arguments, THIS: cur}) : null,
                });
                //console.log("The Key is: "+keyInfo.get().key);
                getAllSkillsFromDB(allSkillsFromDB);
            }
        });
    });
});
Template.tsq_resultsSummary.onRendered(function () {
  console.log("rendered tsq_results", this, arguments);
  //$('[data-toggle="tooltip"]').tooltip();
});
Template.tsq_resultsSummary.helpers({
    skillList() {
        return TSQ.totalSkillsSorted(KeyData.findOne());
    },
    returnConfidenceStatement(level) {
      let opt = TSQ.confidenceRubric()[level.hash.level.toString()];
      if(typeof opt != "undefined") { return opt.prompt; }
      return "";
    },
    returnConfidenceClass(level) {
        let opt = TSQ.confidenceRubric()[level.hash.level.toString()];
        if(typeof opt != "undefined") { return opt.cssClass; }
        return "";
    },
    familiarCount() {
        var userBry;
        userBry = getUserWhenAdmin(userBry);
        console.log('??????????????????????????????after return  ');
        if (unknownUser === undefined || !unknownUser) {
            console.log('unknownUser is undefined');
        }else{
            console.log(unknownUser.MyProfile.firstName);
            console.log('!!!!!!!!!Team User tech skills id', unknownUser.MyProfile.technicalSkillsData);
        }
        if (userBry === undefined || !userBry) {
            console.log('userBry is undefined');
        }else{
            console.log(userBry.MyProfile.firstName);
            console.log('!!!!!!!!!Team User tech skills id', userBry.MyProfile.technicalSkillsData);
        }

        let familiar = 0;
//        TSQ.totalSkills(KeyData.findOne({$eq:[{key:userBry.MyProfile.technicalSkillsData}]})).forEach((value, index) => {
        TSQ.totalSkills(KeyData.findOne()).forEach((value, index) => {
            // console.log("value, index: ", value, index);
            if (value.familiar === true) {
                familiar += 1;
            }
        });
        return familiar;
    },
    unfamiliarCount() {
        let kd = KeyData.findOne();
        let un = TSQ.unfamiliarSkills(kd);
        console.log("unfamiliars", un);
        return un.length
    },
    familiarAverage() {
        let familiar = 0;
        let confidenceSum = 0
        TSQ.totalSkills(KeyData.findOne()).forEach((value, index) => {
            // console.log("value, index: ", value, index);
            if (value.familiar === true) {
                familiar += 1;
                confidenceSum += value.confidenceLevel;
            }
        });
        if (familiar > 0) {
            let ave = confidenceSum / familiar;
            if (ave % 1 !== 0) {
                return ave.toFixed(2);
            } else {
                return ave;
            }
        } else {
            return "No Familiar Technology";
        }
    },
    familiarAverageRounded() {
      return Math.round(Template.tsq_results.__helpers.get('familiarAverage').call());
    },
    unfamiliarAverage() {
        let unfamiliar = 0;
        let confidenceSum = 0
        TSQ.totalSkills(KeyData.findOne()).forEach((value, index) => {
            // console.log("value, index: ", value, index);
            if (value.familiar === false) {
                unfamiliar += 1;
                confidenceSum += value.confidenceLevel;
            }
        });
        if (unfamiliar > 0) {
            let ave = confidenceSum / unfamiliar
            if (ave % 1 !== 0) {
                return ave.toFixed(2);
            } else {
                return ave;
            }
        } else {
            return 0
        }
    },
    unfamiliarAverageRounded() {
      return Math.round(Template.tsq_results.__helpers.get('unfamiliarAverage').call());
    }
})

Template.tsq_resultsSummary.events({
});
