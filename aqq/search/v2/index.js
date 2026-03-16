const db = require('../../fw/db');
const security = require('../../fw/security');

async function search(req) {
    if (req.session.userid === undefined || req.query.terms === undefined){
        return "Not enough information to search";
    }

    let userid = req.session.userid;
    let terms = req.query.terms;
    let result = '';

    let stmt = await db.executeStatement("select ID, title, state from tasks where userID = ? and title like ?", [userid, '%'+terms+'%']);
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