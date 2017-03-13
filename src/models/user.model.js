/**
 * Created by archheretic on 28.02.17.
 */
let fs = require('fs');
let path = require('path');
let _ = require('underscore');

let utility = require('./utility');
let usersPath = path.join(__dirname, '..', 'storage', 'users.json');
//let jsonString = fs.readFileSync(namesPath, 'utf8');


let user = {
    getUsers: function (callback) {
        try {
            fs.readFile(usersPath, 'utf8', function (err, data) {
                try {
                    let users = JSON.parse(data);
                    callback(err, users);
                }
                catch (err) {
                    callback(err);
                }
            });
        }
        catch (err) {
            callback(err);
        }
    },

    addUser: function(name, callback) {
        this.getUsers( (err, data) => {
            if (err) {
                callback(err);
                return;
            }
            name.name = name.name.trim();
            console.log(name);
            for (let i = 0; i < data.users.length; i++) {
                //console.log("data.users[i] " + JSON.stringify(data.users[i])  + " name " + JSON.stringify(name));
                if (JSON.stringify(data.users[i]).toUpperCase() === JSON.stringify(name).toUpperCase()) {
                    callback(err, {"Message": "Name " + JSON.stringify(name.name).trim() + " already exist"});
                    return;
                }
            }

            let pos = data.users.length;

            data.users[pos] = name;
            users = JSON.stringify(data);
            utility.writeToFile(usersPath, users);
            callback(err, {"Message": "Name " + JSON.stringify(name.name) + " Added"}); // litt fusk

        })
    },

    /**
     * Checks the if the the new User list is the same as the old, if not the user lists gets merged without adding
     * duplicates.
     */
    CheckAndAdd: function(newUsers, callback) {
        this.getUsers( (err, oldUsers) => {
            if (err) {
                console.log(err);
            }
            console.log("newUsers ", newUsers);
            if(JSON.stringify(oldUsers) === newUsers) {
                return;
            }
            try {
                newUsers = JSON.parse(newUsers);
                // if undefined then there is a miss match between the distributed systems
                let test = newUsers.users[0];
            }
            catch (err) {
                console.log("Bad integration between distributed systems.\nError msg: ", err);
                return;
            }
            let oldCount;
            try {
                oldCount =  oldUsers.users.length;
            }
            catch (err) {
                console.log(err);
                return;
            }
            let result = merge(newUsers, oldUsers);

            console.log("result ", JSON.stringify(result));
            if (oldCount === result.users.length) {
                return;
            }
            //newUsers.users = newUsers;

            utility.writeToFile(usersPath, JSON.stringify(result));
        })
    }
};

module.exports = user;

// basicly same method inn node.model.js, should be put out in a seperate file to avoid code duplicity
function merge(newUsers, oldUsers) {
    let unique;
    let newList = [];
    let pos;
    let newUser;
    for (let i = 0; i < newUsers.users.length; i++) {
        unique = true;
        for (let j = 0; j < oldUsers.users.length; j++) {
            newUser = newUsers.users[i];
            newUser.name = newUser.name.trim();
            if (JSON.stringify(newUser).toUpperCase() === JSON.stringify(oldUsers.users[j]).toUpperCase()) {
                unique = false;

                ///console.log(unique);
                break;
            }
        }
        if (unique) {
            //console.log("newNodeList.nodes[i] ", newNodeList.nodes[i]);
            pos = newList.length;
            newList[pos] = newUser;
        }
    }
    for (let i = 0; i < newList.length; i++) {
        pos = oldUsers.users.length;
        //console.log("newList[i] ", newList[i]);
        oldUsers.users[pos] = newList[i];
    }
    return oldUsers;
}