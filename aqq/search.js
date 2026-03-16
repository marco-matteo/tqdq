const axios = require('axios');
const querystring = require('querystring');
const searchProvider = require('./search/v2/index');

async function getHtml(req) {
    if (req.body.provider === undefined || req.body.terms === undefined){
        return "Not enough information provided";
    }

    let provider = req.body.provider;
    let terms = req.body.terms;

    // Direct call instead of HTTP to prevent SSRF and simplify session handling
    if (provider === '/search/v2/') {
        await sleep(1000);
        // Mocking req object for the search provider
        return await searchProvider.search({
            session: req.session,
            query: { terms: terms }
        });
    }

    return "Invalid provider specified";
}

async function callAPI(method, url, data){
    let noResults = 'No results found!';
    let result;

    switch (method){
        case "POST":
            if (data) {
                result = await axios.post(url, data)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            } else {
                result = await axios.post(url)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            }
            break;
        case "PUT":
            if (data) {
                result = await axios.put(url, data)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            } else {
                result = await axios.put(url)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            }
            break;
        default:
            if (data)
                url = url+'?'+querystring.stringify(data);

            result = await axios.get(url)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    return noResults;
                });
    }

    return result ? result : noResults;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = { html: getHtml };