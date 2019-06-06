import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

//const airtable = require('./at.js');
const AT_URL = "https://api.airtable.com/v0/appXlqlAQhi8cedpP/";
const AT_KEY = "keynpUHJS7l5QFWfQ";
const auth = {
    "Authorization" : "Bearer "+AT_KEY
};

Meteor.methods({
  'at.TeamRoles'() {
    let modifiedResult;
    try {
        let result = HTTP.call('GET', AT_URL+'Team%20Roles', {
        headers: auth
        });

        let records = result.data.records;
        let data = [];
        records.forEach(record => {
            data.push({'id': record.id, 'name': record.fields.Name, 'rating': record.fields['Dev Role Activity Rating copy']});
        });
        
        modifiedResult = data;
    } catch (e) {
        throw new Meteor.Error('Error retrieving TeamRoles', e);
    }
    return modifiedResult;
  },
  'at.DeveloperRoles'() {
    let modifiedResult;
    try {
        let result = HTTP.call('GET', AT_URL+'Developer%20Roles', {
            headers: auth
        });

        let records = result.data.records;
        let data = [];
        records.forEach(record => {
            data.push({'id': record.id, 'name': record.fields.Name, 'rating': record.fields['Dev Role Activity Rating'], 'definition': record.fields.Definition});
        });
        
        modifiedResult = data;
    } catch (e) {
        throw new Meteor.Error('Error retrieving DeveloperRoles', e);
    }
    return modifiedResult;
  },
  'at.Activities'() {
    let modifiedResult;
    try {
        let result = HTTP.call('GET', AT_URL+'Activities', {
        headers: auth
        });

        let records = result.data.records;
        let data = [];
        records.forEach(record => {
            let ie = record.fields['E/I'].split('/');
            ie = ie[0]-50;
            let sn = record.fields['S/N'].split('/');
            sn = sn[0]-50;
            let tf = record.fields['T/F'].split('/');
            tf = tf[0]-50;
            let jp = record.fields['J/P'].split('/');
            jp = jp[0]-50;
            data.push({'id': record.id, 'name': record.fields.Name, 'dev_rating': record.fields['Dev Role Activity Rating'], 'team_rating': record.fields['Dev Role Activity Rating copy'], 'ie': ie, 'sn': sn, 'tf': tf, 'jp': jp});
        });
        
        modifiedResult = data;
    } catch (e) {
        throw new Meteor.Error('Error retrieving Activities', e);
    }
    return modifiedResult;
  },
  'at.DevRoleActivityRating'() {
    let modifiedResult;
    try {
        let result = HTTP.call('GET', AT_URL+'Dev%20Role%20Activity%20Rating', {
        headers: auth
        });

        let records = result.data.records;
        let data = [];
        records.forEach(record => {
            data.push({'id': record.id, 'key': record.fields.ID, 'dev_role': record.fields['Dev Role'], 'activity': record.fields.Activity, 'm_rating': record.fields['Moroni Rating'], 'k_rating': record.fields['Karl Rating'], 'mk_delta': record.fields['Moroni Karl Delta']});
        });
        
        modifiedResult = data;
    } catch (e) {
        throw new Meteor.Error('Error retrieving DevRoleActivityRating', e);
    }
    return modifiedResult;
  },
  'at.TeamRoleActivityRating'() {
    let modifiedResult;
    try {
        let result = HTTP.call('GET', AT_URL+'Team%20Role%20Activity%20Rating', {
        headers: auth
        });

        let records = result.data.records;
        let data = [];
        records.forEach(record => {
            data.push({'id': record.id, 'key': record.fields.ID, 'team_role': record.fields['Team Role'], 'activity': record.fields.Activity});
        });
        
        modifiedResult = data;
    } catch (e) {
        throw new Meteor.Error('Error retrieving TeamRoleActivityRating', e);
    }
    return modifiedResult;
  }
});