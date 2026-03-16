const db = require('./fw/db');
const bcrypt = require('bcryptjs');
const security = require('./fw/security');

async function handleRegister(req, res) {
    let msg = '';
    if (req.method === 'POST') {
        const { username, password } = req.body;
        if (username && password) {
            try {
                const conn = await db.connectDB();
                // Check if user already exists
                const [existing] = await conn.execute('SELECT id FROM users WHERE username = ?', [username]);
                if (existing.length > 0) {
                    msg = '<span class="info info-error">Username already exists.</span>';
                } else {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    await conn.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
                    msg = '<span class="info info-success">Registration successful! You can now login.</span>';
                }
            } catch (err) {
                console.error(err);
                msg = '<span class="info info-error">Registration failed.</span>';
            }
        } else {
            msg = '<span class="info info-error">Please provide both username and password.</span>';
        }
    }

    return msg + getHtml(res.locals.csrfToken);
}

function getHtml(csrfToken) {
    return `
    <h2>Register</h2>
    <form method="post" action="/register">
        <input type="hidden" name="_csrf" value="${csrfToken}">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control size-medium" name="username" id="username" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control size-medium" name="password" id="password" required minlength="8">
        </div>
        <div class="form-group">
            <label for="submit"></label>
            <input type="submit" class="btn size-auto" value="Register" />
        </div>
    </form>
    <p>Already have an account? <a href="/login">Login here</a></p>
    `;
}

module.exports = { handleRegister };
