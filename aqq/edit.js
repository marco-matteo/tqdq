const db = require('./fw/db');
const security = require('./fw/security');

async function getHtml(req, res) {
    let title = '';
    let state = '';
    let taskId = '';
    let html = '';
    let options = ["Open", "In Progress", "Done"];
    let csrfToken = res.locals.csrfToken;

    if(req.query.id !== undefined) {
        console.log('req.query: ')
        console.log(req.query);
        console.log(req.query.id);
        taskId = req.query.id;
        let result = await db.knex('tasks')
            .where('ID', taskId)
            .where('userID', req.session.userId)
            .select('ID', 'title', 'state');
        if(result.length > 0) {
            title = result[0].title;
            state = result[0].state;
        } else {
            // Task not found or not belonging to the user
            return "Task not found or you don't have permission to edit it.";
        }

        html += `<h1>Edit Task</h1>`;
    } else {
        html += `<h1>Create Task</h1>`;
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
            <label for="submit" ></label>
            <input id="submit" type="submit" class="btn size-auto" value="Submit" />
        </div>
    </form>
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