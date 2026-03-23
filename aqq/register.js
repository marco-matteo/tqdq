const db = require('./fw/db');
const bcrypt = require('bcryptjs');

async function handleRegister(req, res) {
    let msg = '';

    if (typeof req.body.username !== 'undefined' && typeof req.body.password !== 'undefined') {
        let result = await registerUser(req.body.username, req.body.password, req.body.password_confirm);

        if (result.success) {
            // Registration successful -> redirect to login
            res.redirect('/login?registered=1');
            return { redirect: true };
        } else {
            msg = `<div class="error">${result.msg}</div>`;
        }
    }

    return { html: msg + getHtml(res.locals.csrfToken), redirect: false };
}

async function registerUser(username, password, passwordConfirm) {
    let result = { success: false, msg: '' };

    // Input validation
    if (!username || username.trim() === '') {
        result.msg = 'Username is required';
        return result;
    }

    if (username.length < 3 || username.length > 50) {
        result.msg = 'Username must be between 3 and 50 characters';
        return result;
    }

    if (!password || password.length < 12) {
        result.msg = 'Password must be at least 12 characters long';
        return result;
    }

    if (password !== passwordConfirm) {
        result.msg = 'Passwords do not match';
        return result;
    }

    try {
        const existing = await db.knex("users")
            .select("id")
            .where("username", username.trim());

        if (existing.length > 0) {
            result.msg = 'Username already taken';
            return result;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert the new user
        const [newUserId] = await db.knex("users")
            .insert({ username: username.trim(), password: hashedPassword });

        // Assign the default 'User' role (roleID = 2)
        await db.knex("permissions")
            .insert({ userID: newUserId, roleID: 2 });

        result.success = true;
    } catch (err) {
        console.error('Registration error:', err);
        result.msg = 'An error occurred during registration. Please try again.';
    }

    return result;
}

function getHtml(csrfToken) {
    return `
    <h2>Register</h2>

    <form id="form" method="post" action="/register">
        <input type="hidden" name="_csrf" value="${csrfToken}">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control size-medium" name="username" id="username" minlength="3" maxlength="50" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control size-medium" name="password" id="password" minlength="8" required>
        </div>
        <div class="form-group">
            <label for="password_confirm">Confirm Password</label>
            <input type="password" class="form-control size-medium" name="password_confirm" id="password_confirm" minlength="8" required>
        </div>
        <div class="form-group">
            <label for="submit"></label>
            <input id="submit" type="submit" class="btn size-auto" value="Register" />
        </div>
    </form>
    <p>Already have an account? <a href="/login">Login here</a></p>
    `;
}

module.exports = {
    handleRegister: handleRegister
};
