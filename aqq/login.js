const db = require('./fw/db');
const bcrypt = require('bcryptjs');

async function handleLogin(req, res) {
    let msg = '';
    let user = { 'username': '', 'userId': 0, 'role': '' };

    if(typeof req.body.username !== 'undefined' && typeof req.body.password !== 'undefined') {
        // Get username and password from the form and call the validateLogin
        let result = await validateLogin(req.body.username, req.body.password);

        if(result.valid) {
            // Login is correct. Store user information to be returned.
            user.username = req.body.username;
            user.userId = result.userId;
            user.role = result.role;
            msg = result.msg;
        } else {
            msg = result.msg;
        }
    }

    return { 'html': msg + getHtml(res.locals.csrfToken), 'user': user };
}

function startUserSession(req, res, user) {
    console.log('login valid... start user session now for userId '+user.userId);
    req.session.loggedin = true;
    req.session.username = user.username;
    req.session.userId = user.userId;
    req.session.role = user.role;
    res.redirect('/');
}

async function validateLogin (username, password) {
    let result = { valid: false, msg: '', userId: 0, role: '' };

    try {
        const results = await db.knex('users')
            .leftJoin('permissions', 'users.ID', 'permissions.userID')
            .leftJoin('roles', 'permissions.roleID', 'roles.ID')
            .where('users.username', username)
            .select('users.ID', 'users.username', 'users.password', 'roles.title as role');

        if(results.length > 0) {
            // Bind the result variables
            let db_id = results[0].ID;
            let db_username = results[0].username;
            let db_password = results[0].password;
            let db_role = results[0].role;

            // Verify the password
            const passwordMatch = await bcrypt.compare(password, db_password);

            if (passwordMatch) {
                result.userId = db_id;
                result.role = db_role;
                result.valid = true;
                result.msg = 'login correct';
            } else {
                // Password is incorrect
                result.msg = 'Incorrect password';
            }
        } else {
            // Username does not exist
            result.msg = 'Username does not exist';
        }

        console.log(results); // results contains rows returned by server
    } catch (err) {
        console.log(err);
    }
    
    return result;
}

function getHtml(csrfToken) {
    return `
    <h2>Login</h2>

    <form id="form" method="post" action="/login">
        <input type="hidden" name="_csrf" value="${csrfToken}">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control size-medium" name="username" id="username">
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control size-medium" name="password" id="password">
        </div>
        <div class="form-group">
            <label for="submit" ></label>
            <input id="submit" type="submit" class="btn size-auto" value="Login" />
        </div>
    </form>
    <p>Don't have an account? <a href="/register">Register here</a></p>
    `;
}

module.exports = {
    handleLogin: handleLogin,
    startUserSession: startUserSession
};