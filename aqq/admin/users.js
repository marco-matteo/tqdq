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

    <table style="max-width:640px;">
        <tr>
            <th style="width:60px;">ID</th>
            <th>Username</th>
            <th>Role</th>
        </tr>`;

    result.map(function (record) {
        const roleClass = record.title === 'Admin' ? 'state-open' : 'priority-low';
        html += `<tr>
            <td style="color:var(--text-muted);font-size:13px;">#${record.ID}</td>
            <td>${security.escapeHTML(record.username)}</td>
            <td><span class="badge ${roleClass}">${security.escapeHTML(record.title)}</span></td>
        </tr>`;
    });

    html += `
    </table>`;

    return html;
}

module.exports = { html: getHtml };