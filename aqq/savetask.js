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
        let deadlineRaw = req.body.deadline;
        let deadline = (deadlineRaw && /^\d{4}-\d{2}-\d{2}$/.test(deadlineRaw)) ? deadlineRaw : null;

        if (taskId === ''){
            await db.knex('tasks').insert({
                title: title,
                state: state,
                priority: priority,
                deadline: deadline,
                userID: userId
            });
        } else {
            await db.knex('tasks')
                .where('ID', taskId)
                .where('userID', userId)
                .update({
                    title: title,
                    state: state,
                    priority: priority,
                    deadline: deadline
                });
        }

        html += `<div style="text-align:center;padding:40px 20px;">
            <div class="success" style="display:inline-block;padding:14px 28px;border-radius:8px;margin-bottom:24px;">
                Task saved successfully.
            </div>
            <br>
            <a href="/" class="create-btn" style="margin-top:8px;">&#8592; Back to Tasks</a>
        </div>`;
    } else {
        html += `<div style="text-align:center;padding:40px 20px;">
            <div class="error" style="display:inline-block;padding:14px 28px;border-radius:8px;margin-bottom:24px;">
                No update was made.
            </div>
            <br>
            <a href="/" class="create-btn" style="margin-top:8px;">&#8592; Back to Tasks</a>
        </div>`;
    }

    return html;
}

module.exports = { html: getHtml }