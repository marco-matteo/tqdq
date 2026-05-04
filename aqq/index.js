const tasklist = require('./user/tasklist');
const bgSearch = require('./user/backgroundsearch');
const security = require('./fw/security');

async function getHtml(req, res) {
    let taskListHtml = await tasklist.html(req);
    let username = security.escapeHTML(req.session.username);
    return taskListHtml + '<hr />' + bgSearch.html(req, res);
}

module.exports = {
    html: getHtml
}