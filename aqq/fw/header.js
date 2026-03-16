const login = require('../login');
const db = require('../fw/db');

async function getHtml(req) {
    let content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TBZ 'Secure' App</title>
    <link rel="stylesheet" href="/style.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.1/jquery.validate.min.js"></script>
</head>
<body>
    <header>
        <div>This is the secure m183 test app</div>`;

    let userId = 0;
    let roleId = 0;
    if(req.session && req.session.userId) {
        userId = req.session.userId;
        let stmt = await db.knex('users')
            .leftJoin('permissions', 'users.ID', 'permissions.userID')
            .leftJoin('roles', 'permissions.roleID', 'roles.ID')
            .where('users.ID', userId)
            .select('users.ID as userId', 'roles.ID as roleId', 'roles.title as roleName');
        console.log(stmt);

        // load role from db
        if(stmt.length > 0) {
            roleId = stmt[0].roleId;
        }

        content += `
        <nav>
            <ul>
                <li><a href="/">Tasks</a></li>`;
        if(roleId === 1) {
            content += `
                <li><a href="/admin/users">User List</a></li>`;
        }
        content += `
                <li><a href="/logout">Logout</a></li>
            </ul>
        </nav>`;
    } else {
        content += `
        <nav>
            <ul>
                <li><a href="/login">Login</a></li>
            </ul>
        </nav>`;
    }

    content += `
    </header>
    <main>`;

    return content;
}

module.exports = getHtml;