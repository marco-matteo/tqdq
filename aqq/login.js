const db = require('./fw/db');
const bcrypt = require('bcryptjs');

const FAILED_AUTH = '<div class="error">Invalid username or password.</div>';

async function handleLogin(req, res) {
    let msg = '';
    let user = { 'username': '', 'userId': 0, 'role': '' };

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

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

async function validateLogin (username, password) {
    let result = { valid: false, msg: '', userId: 0, role: '' };

    try {
        const results = await db.knex('users')
            .leftJoin('permissions', 'users.ID', 'permissions.userID')
            .leftJoin('roles', 'permissions.roleID', 'roles.ID')
            .where('users.username', username)
            .select('users.ID', 'users.username', 'users.password', 'users.failed_attempts', 'users.locked_until', 'roles.title as role');

        if(results.length > 0) {
            let db_id = results[0].ID;
            let db_password = results[0].password;
            let db_role = results[0].role;
            let db_failed_attempts = results[0].failed_attempts || 0;
            let db_locked_until = results[0].locked_until;

            // Check if account is locked
            if (db_locked_until && new Date(db_locked_until) > new Date()) {
                const unlockTime = new Date(db_locked_until).toLocaleString();
                result.msg = `<div class="error">Account is locked due to too many failed login attempts. Try again after ${unlockTime}.</div>`;
                console.log('Login blocked for locked account: %s', username);
                return result;
            }

            // Verify the password
            const passwordMatch = await bcrypt.compare(password, db_password);

            if (passwordMatch) {
                // Reset failed attempts on successful login
                await db.knex('users').where('ID', db_id).update({ failed_attempts: 0, locked_until: null });
                result.userId = db_id;
                result.role = db_role;
                result.valid = true;
                result.msg = 'login correct';
            } else {
                // Increment failed attempts
                const newFailedAttempts = db_failed_attempts + 1;
                if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
                    const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
                    await db.knex('users').where('ID', db_id).update({ failed_attempts: newFailedAttempts, locked_until: lockUntil });
                    result.msg = '<div class="error">Too many failed login attempts. Your account has been locked for 24 hours.</div>';
                    console.log('Account locked for user %s after %d failed attempts', username, newFailedAttempts);
                } else {
                    await db.knex('users').where('ID', db_id).update({ failed_attempts: newFailedAttempts });
                    result.msg = FAILED_AUTH;
                }
            }
        } else {
            // Username does not exist
            result.msg = FAILED_AUTH;
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