const db = require('./fw/db');

async function getHtml(req) {
    let html = '';
    let taskId = '';
    let userid = req.session.userid;

    // see if the id exists in the database and belongs to the user
    if (req.body.id !== undefined && req.body.id.length !== 0) {
        taskId = req.body.id;
        let stmt = await db.executeStatement('select ID from tasks where ID = ? and UserID = ?', [taskId, userid]);
        if (stmt.length === 0) {
            return "<span class='info info-error'>Task not found or permission denied.</span>";
        }
    }

    if (req.body.title !== undefined && req.body.state !== undefined){
        let state = req.body.state;
        let title = req.body.title;

        if (taskId === ''){
            await db.executeStatement("insert into tasks (title, state, userID) values (?, ?, ?)", [title, state, userid]);
        } else {
            await db.executeStatement("update tasks set title = ?, state = ? where ID = ? and UserID = ?", [title, state, taskId, userid]);
        }

        html += "<span class='info info-success'>Update successful</span>";
    } else {
        html += "<span class='info info-error'>No update was made</span>";
    }

    return html;
}

module.exports = { html: getHtml }