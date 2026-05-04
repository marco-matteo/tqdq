const db = require('./fw/db');
const security = require('./fw/security');

async function getHtml(req, res) {
    let title = '';
    let state = '';
    let priority = 'medium';
    let deadline = '';
    let taskId = '';
    let html = '';
    let options = ["Open", "In Progress", "Done"];
    let priorities = ["Low", "Medium", "High"];
    let csrfToken = res.locals.csrfToken;

    if(req.query.id !== undefined) {
        console.log('req.query: ')
        console.log(req.query);
        console.log(req.query.id);
        taskId = req.query.id;
        let result = await db.knex('tasks')
            .where('ID', taskId)
            .where('userID', req.session.userId)
            .select('ID', 'title', 'state', 'priority', 'deadline');
        if(result.length > 0) {
            title = result[0].title;
            state = result[0].state;
            priority = result[0].priority || 'medium';
            deadline = result[0].deadline ? result[0].deadline.toISOString().split('T')[0] : '';
        } else {
            // Task not found or not belonging to the user
            return "Task not found or you don't have permission to edit it.";
        }

        html += `<div class="card" style="max-width:560px;"><h1>Edit Task</h1>`;
    } else {
        html += `<div class="card" style="max-width:560px;"><h1>Create Task</h1>`;
    }

    html += `
    <form id="form" method="post" action="savetask">
        <input type="hidden" name="_csrf" value="`+csrfToken+`" />
        <input type="hidden" name="id" value="`+security.escapeHTML(taskId)+`" />
        <div class="form-group">
            <label for="title">Description</label>
            <input type="text" class="form-control size-medium" name="title" id="title" value="`+security.escapeHTML(title)+`">
        </div>
        <div class="form-group">
            <label for="state">State</label>
            <select name="state" id="state" class="size-auto">`;

    for(let i = 0; i < options.length; i++) {
        let selected = state === options[i].toLowerCase() ? 'selected' : '';
        html += `<option value='`+security.escapeHTML(options[i].toLowerCase())+`' `+selected+`>`+security.escapeHTML(options[i])+`</option>`;
    }

    html += `
            </select>
        </div>
        <div class="form-group">
            <label for="priority">Priority</label>
            <select name="priority" id="priority" class="size-auto">`;

    for(let i = 0; i < priorities.length; i++) {
        let selected = priority === priorities[i].toLowerCase() ? 'selected' : '';
        html += `<option value='`+security.escapeHTML(priorities[i].toLowerCase())+`' `+selected+`>`+security.escapeHTML(priorities[i])+`</option>`;
    }

    html += `
            </select>
        </div>
        <div class="form-group">
            <label for="deadline">Deadline</label>
            <input type="date" class="form-control size-auto" name="deadline" id="deadline" value="`+security.escapeHTML(deadline)+`">
        </div>
        <div class="form-group" style="display:flex;gap:12px;align-items:center;margin-top:8px;">
            <input id="submit" type="submit" class="btn" value="Save Task" />
            <a href="/" style="font-size:14px;font-weight:500;color:var(--text-secondary);text-decoration:none;padding:0 4px;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-secondary)'">&#8592; Back to Tasks</a>
        </div>
    </form>
    </div>
    <script>
        $(document).ready(function () {
        $('#form').validate({
            rules: {
                title: {
                    required: true
                }
            },
            messages: {
                title: 'Please enter a description.',
            },
            submitHandler: function (form) {
                form.submit();
            }
        });
    });
    </script>`;

    return html;
}

module.exports = { html: getHtml }