const db = require('./fw/db');
const bcrypt = require('bcryptjs');

async function handleLogin(req, res) {
    let msg = '';
    let user = { 'username': '', 'userId': 0, 'role': '', 'lastLogin': null };

    if (req.query && req.query.registered === '1') {
        msg = '<div class="success">Registration successful! You can now log in.</div>';
    }

    if(typeof req.body.username !== 'undefined' && typeof req.body.password !== 'undefined') {
        // Get username and password from the form and call the validateLogin
        let result = await validateLogin(req.body.username, req.body.password);

        if(result.valid) {
            // Login is correct. Store user information to be returned.
            user.username = req.body.username;
            user.userId = result.userId;
            user.role = result.role;
            user.lastLogin = result.lastLogin;
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
    req.session.lastLogin = user.lastLogin;
    res.redirect('/');
}

async function validateLogin (username, password) {
    let result = { valid: false, msg: '', userId: 0, role: '' };

    try {
        const results = await db.knex('users')
            .leftJoin('permissions', 'users.ID', 'permissions.userID')
            .leftJoin('roles', 'permissions.roleID', 'roles.ID')
            .where('users.username', username)
            .select('users.ID', 'users.username', 'users.password', 'users.last_login', 'roles.title as role');

        if(results.length > 0) {
            // Bind the result variables
            let db_id = results[0].ID;
            let db_username = results[0].username;
            let db_password = results[0].password;
            let db_role = results[0].role;
            let db_last_login = results[0].last_login;

            // Verify the password
            const passwordMatch = await bcrypt.compare(password, db_password);

            if (passwordMatch) {
                // Update last_login timestamp in database
                await db.knex('users')
                    .where('ID', db_id)
                    .update({ last_login: db.knex.fn.now() });

                result.userId = db_id;
                result.role = db_role;
                result.lastLogin = db_last_login;
                result.valid = true;
                result.msg = 'login correct';
            } else {
                // Password is incorrect
                result.msg = '<div class="error">Invalid username or password</div>';
            }
        } else {
            // Username does not exist
            // Perform a dummy hash comparison to mitigate timing attacks
            await bcrypt.compare(password, "$2b$12$L7R2.U6WlZ0A.V.m.Z0W.O/V.Z0A.V.m.Z0W.O/V.Z0A.V.m.Z0W.");
            result.msg = '<div class="error">Invalid username or password</div>';
        }

        console.log('Login query returned %d row(s) for username %s', results.length, username);
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
    <br />
    <p style="margin: 20px;">Don't have an account? <a href="/register">Register here</a></p>
    `;
}

module.exports = {
    handleLogin: handleLogin,
    startUserSession: startUserSession
};