const tasklist = require('./user/tasklist');
const bgSearch = require('./user/backgroundsearch');
const security = require('./fw/security');

async function getHtml(req, res) {
    let taskListHtml = await tasklist.html(req);
    let username = security.escapeHTML(req.session.username);
    let lastLogin = req.session.lastLogin ? `<p style="font-size: 0.8em; color: #666;">Your last login was on: ${new Date(req.session.lastLogin).toLocaleString()}</p>` : '<p style="font-size: 0.8em; color: #666;">Welcome! This is your first login.</p>';
    return `<h2>Welcome, `+username+`!</h2>` + lastLogin + taskListHtml + '<hr />' + bgSearch.html(req, res);
}

module.exports = {
    html: getHtml
}