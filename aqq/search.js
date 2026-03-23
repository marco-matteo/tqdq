const searchProvider = require('./search/v2/index');

async function getHtml(req) {
    if (req.body.provider === undefined || req.body.terms === undefined){
        return "Not enough information provided";
    }

    let provider = req.body.provider;
    let terms = req.body.terms;

    if (provider === '/search/v2/') {
        return await searchProvider.search({
            session: req.session,
            query: { terms: terms }
        });
    }

    return "Invalid provider specified";
}

module.exports = { html: getHtml };