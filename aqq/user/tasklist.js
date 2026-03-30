const db = require('../fw/db');
const security = require('../fw/security');

async function getHtml(req) {
    let html = `
    <section id="list">
        <a href="edit">Create Task</a>
        <table>
            <tr>
                <th>ID</th>
                <th>Description</th>
                <th>State</th>
                <th>Priority</th>
                <th></th>
            </tr>
    `;

    let result = await db.knex('tasks')
        .where('userID', req.session.userId)
        .select('ID', 'title', 'state', 'priority');
    console.log(result);
    result.forEach(function(row) {
        html += `
            <tr>
                <td>`+row.ID+`</td>
                <td class="wide">`+security.escapeHTML(row.title)+`</td>
                <td>`+security.escapeHTML(ucfirst(row.state))+`</td>
                <td>`+security.escapeHTML(ucfirst(row.priority || 'medium'))+`</td>
                <td>
                    <a href="edit?id=`+row.ID+`">edit</a> | <a href="delete?id=`+row.ID+`">delete</a>
                </td>
            </tr>`;
    });

    html += `
        </table>
    </section>`;

    return html;
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    html: getHtml
}