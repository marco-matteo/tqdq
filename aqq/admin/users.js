const db = require('../fw/db');
const security = require('../fw/security');

async function getHtml() {
    let html = '';
    // Do not select passwords here!
    let result = await db.knex('users')
        .innerJoin('permissions', 'users.ID', 'permissions.userID')
        .innerJoin('roles', 'permissions.roleID', 'roles.ID')
        .select('users.ID', 'users.username', 'roles.title')
        .orderBy('username');

    html += `
    <h2>User List</h2>

    <table>
        <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
        </tr>`;

    result.map(function (record) {
        html += `<tr><td>`+record.ID+`</td><td>`+security.escapeHTML(record.username)+`</td><td>`+security.escapeHTML(record.title)+`</td></tr>`;
    });

    html += `
    </table>`;

    return html;
}

module.exports = { html: getHtml };