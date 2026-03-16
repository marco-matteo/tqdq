const db = require('./fw/db');

async function handle(req) {
    if (req.query.id === undefined) {
        return "No task specified";
    }

    const taskId = req.query.id;
    const userId = req.session.userid;

    // Check ownership before deleting (IDOR fix)
    const stmt = await db.executeStatement('delete from tasks where ID = ? and UserID = ?', [taskId, userId]);

    if (stmt.affectedRows > 0) {
        return "<span class='info info-success'>Task deleted successfully</span><br><a href='/' class='btn'>Back to list</a>";
    } else {
        return "<span class='info info-error'>Task not found or unauthorized</span><br><a href='/' class='btn'>Back to list</a>";
    }
}

module.exports = { handle };
