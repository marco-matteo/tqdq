const db = require('./fw/db');

async function deleteTask(req, res) {
    if(req.query.id !== undefined) {
        let taskId = req.query.id;

        await db.executeStatement('delete from tasks where ID = ? and UserID = ?', [taskId, req.session.userid]);
        
        res.redirect('/');
    } else {
        res.redirect('/');
    }
}

module.exports = { deleteTask: deleteTask }
