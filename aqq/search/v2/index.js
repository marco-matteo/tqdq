const db = require('../../fw/db');
const security = require('../../fw/security');

async function search(req) {
    if (req.session.userId === undefined || req.query.terms === undefined){
        return "Not enough information to search";
    }

    let userId = req.session.userId;
    let terms = req.query.terms;
    let result = '';

    let stmt = await db.knex('tasks')
        .where('userID', userId)
        .where('title', 'like', '%'+terms+'%')
        .select('ID', 'title', 'state');
    if (stmt.length > 0) {
        stmt.forEach(function(row) {
            result += security.escapeHTML(row.title)+' ('+security.escapeHTML(row.state)+')<br />';
        });
    }

    return result;
}

module.exports = {
    search: search
};