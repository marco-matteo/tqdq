const db = require('../fw/db');
const security = require('../fw/security');

async function getHtml() {
    let conn = await db.connectDB();
    let html = '';
    // Do not select passwords here!
    let [result,fields] = await conn.execute("SELECT users.ID, users.username, roles.title FROM users inner join permissions on users.ID = permissions.userID inner join roles on permissions.roleID = roles.ID order by username");

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