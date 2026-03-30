const db = require('./fw/db');

async function getHtml(req) {
    let html = '';
    let taskId = '';
    let userId = req.session.userId;

    // see if the id exists in the database and belongs to the user
    if (req.body.id !== undefined && req.body.id.length !== 0) {
        taskId = req.body.id;
        let stmt = await db.knex('tasks')
            .where('ID', taskId)
            .where('userID', userId)
            .select('ID');
        if (stmt.length === 0) {
            return "<span class='info info-error'>Task not found or permission denied.</span>";
        }
    }

    if (req.body.title !== undefined && req.body.state !== undefined){
        let state = req.body.state;
        let title = req.body.title;
        let validPriorities = ['low', 'medium', 'high'];
        let priority = validPriorities.includes(req.body.priority) ? req.body.priority : 'medium';

        if (taskId === ''){
            await db.knex('tasks').insert({
                title: title,
                state: state,
                priority: priority,
                userID: userId
            });
        } else {
            await db.knex('tasks')
                .where('ID', taskId)
                .where('userID', userId)
                .update({
                    title: title,
                    state: state,
                    priority: priority
                });
        }

        html += "<span class='info info-success'>Update successful</span>";
    } else {
        html += "<span class='info info-error'>No update was made</span>";
    }

    return html;
}

module.exports = { html: getHtml }