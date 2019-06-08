module.exports.authenticate = (email, pswd) => {

    let current_user = {
        auth:null,
        f_name: null,
        l_name: null,
        usr_email: null
    }
    // Iterate over data-array
    for (let obj of this.gen_fake_usr()) { 
        
        // Check if email & paswd match
        if ((email == obj.email) && (pswd == obj.password)) {
            
            // Populate oject to be return
            current_user.auth = true; // true auth
            current_user.f_name = obj.fname;
            current_user.l_name = obj.lname;
            current_user.usr_email = obj.email;
            
            return current_user;
        }
    }
    current_user.auth = false; // false auth
    return current_user;
}

module.exports.gen_fake_usr = () => {

    let user_array = [];

    let user_obj1 = {
        fname: "<First_Name>",
        lname: "<Last_Name>",
        email: "<email@email.com",
        password: "<password>", //TODO: bycrypt value
        connections: []

    }

    user_array.push(user_obj1);

    let user_obj2 = {
        fname: "<First_Name>",
        lname: "<Last_Name>",
        email: "<email@email.com",
        password: "<password>", //TODO: bycrypt value
        connections: []

    }

    user_array.push(user_obj2);

    let usr_obj3 = {
        fname: "<Firstn_Name>",
        lname: "<Last_Name>",
        email: "<email@email.com>",
        password: "<password>", //TODO: bycrypt value
        connections: []
    }

    user_array.push(usr_obj3);

    return user_array;
}