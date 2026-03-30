const db = require('./fw/db');

async function deleteTask(req, res) {
    if(req.query.id !== undefined) {
        let taskId = req.query.id;

        await db.knex('tasks')
            .where('ID', taskId)
			.where('UserId', req.session.userId)
			.delete();
        
        res.redirect('/');
    } else {
        res.redirect('/');
    }
}

module.exports = { deleteTask: deleteTask }
