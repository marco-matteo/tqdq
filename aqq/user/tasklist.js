const db = require('../fw/db');
const security = require('../fw/security');

const VALID_STATES = ['open', 'in progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_SORT_COLS = ['ID', 'state', 'priority', 'deadline'];
const VALID_ORDERS = ['asc', 'desc'];

async function getHtml(req) {
    const filterState    = VALID_STATES.includes(req.query.filter_state)    ? req.query.filter_state    : '';
    const filterPriority = VALID_PRIORITIES.includes(req.query.filter_priority) ? req.query.filter_priority : '';
    const sortCol        = VALID_SORT_COLS.includes(req.query.sort)          ? req.query.sort            : 'ID';
    const sortOrder      = VALID_ORDERS.includes(req.query.order)            ? req.query.order           : 'asc';

    let query = db.knex('tasks')
        .where('userID', req.session.userId)
        .select('ID', 'title', 'state', 'priority', 'deadline');

    if (filterState)    query = query.where('state', filterState);
    if (filterPriority) query = query.where('priority', filterPriority);

    query = query.orderBy(sortCol, sortOrder);

    const result = await query;

    const stateOptions = [
        { value: '', label: 'All States' },
        { value: 'open', label: 'Open' },
        { value: 'in progress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
    ];

    const priorityOptions = [
        { value: '', label: 'All Priorities' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
    ];

    const sortOptions = [
        { value: 'ID',       label: 'ID' },
        { value: 'state',    label: 'State' },
        { value: 'priority', label: 'Priority' },
        { value: 'deadline', label: 'Deadline' },
    ];

    function select(name, options, current) {
        let html = `<select name="${name}" class="size-auto" onchange="this.form.submit()">`;
        for (const opt of options) {
            const selected = opt.value === current ? ' selected' : '';
            html += `<option value="${security.escapeHTML(opt.value)}"${selected}>${security.escapeHTML(opt.label)}</option>`;
        }
        html += `</select>`;
        return html;
    }

    let html = `
    <section id="list">
        <div class="section-header">
            <h2>My Tasks</h2>
            <a href="edit" class="create-btn">New Task</a>
        </div>

        <form method="get" action="/" id="filter-form">
            <div class="filter-bar">
                ${select('filter_state', stateOptions, filterState)}
                ${select('filter_priority', priorityOptions, filterPriority)}
                <label>Sort by:</label>
                ${select('sort', sortOptions, sortCol)}
                ${select('order', [{ value: 'asc', label: 'Asc' }, { value: 'desc', label: 'Desc' }], sortOrder)}
                <a href="/" class="reset-link">Reset</a>
            </div>
        </form>

        <table>
            <tr>
                <th>ID</th>
                <th>Description</th>
                <th>State</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th></th>
            </tr>
    `;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (result.length === 0) {
        html += `<tr><td colspan="6">No tasks found.</td></tr>`;
    } else {
        result.forEach(function(row) {
            let deadlineDisplay = '';
            let rowClass = '';
            if (row.deadline) {
                const dl = new Date(row.deadline);
                dl.setHours(0, 0, 0, 0);
                deadlineDisplay = dl.toISOString().split('T')[0];
                if (row.state !== 'done' && dl < today) {
                    rowClass = ' class="overdue"';
                }
            }
            const stateClass = 'state-' + row.state.replace(' ', '-');
            const priorityVal = row.priority || 'medium';
            html += `
            <tr${rowClass}>
                <td style="color:var(--text-muted);font-size:13px;">#${row.ID}</td>
                <td class="wide">${security.escapeHTML(row.title)}</td>
                <td><span class="badge ${stateClass}">${security.escapeHTML(ucfirst(row.state))}</span></td>
                <td><span class="badge priority-${priorityVal}">${security.escapeHTML(ucfirst(priorityVal))}</span></td>
                <td style="font-size:13px;color:var(--text-secondary);">${security.escapeHTML(deadlineDisplay)}</td>
                <td>
                    <div class="action-links">
                        <a href="edit?id=${row.ID}">Edit</a>
                        <a href="delete?id=${row.ID}" class="delete-link">Delete</a>
                    </div>
                </td>
            </tr>`;
        });
    }

    html += `
        </table>
    </section>`;

    return html;
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    html: getHtml
}
