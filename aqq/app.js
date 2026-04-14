require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { csrfSync } = require('csrf-sync');
const path = require('path');
const header = require('./fw/header');
const footer = require('./fw/footer');
const login = require('./login');
const register = require('./register');
const index = require('./index');
const adminUser = require('./admin/users');
const editTask = require('./edit');
const deleteTask = require("./delete");
const saveTask = require('./savetask');
const search = require('./search');
const searchProvider = require('./search/v2/index');

const app = express();
const PORT = 3000;

app.use(session({
    secret: process.env.SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 3600000 // 1 Stunde
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// CSRF Protection
const {
    invalidCsrfTokenError,
    generateToken,
    csrfSynchronisedProtection,
} = csrfSync({
    getTokenFromRequest: (req) => req.body._csrf,
});

app.use(csrfSynchronisedProtection);

app.use((req, res, next) => {
    res.locals.csrfToken = generateToken(req);
    next();
});

function requireAuth(req, res, next) {
    if (req.session?.loggedin === true && req.session?.userId !== undefined) {
        next();
    } else {
        res.redirect('/login');
    }
}

function requireAdmin(req, res, next) {
    if (req.session?.loggedin === true && req.session?.role === 'Admin') {
        next();
    } else {
        res.status(403).send("Forbidden: You do not have administrator privileges.");
    }
}

// Routen
app.get('/', requireAuth, async (req, res) => {
    let html = await wrapContent(await index.html(req, res), req)
    res.send(html);
});

app.post('/', requireAuth, async (req, res) => {
    let html = await wrapContent(await index.html(req, res), req)
    res.send(html);
})

// edit task
app.get('/admin/users', requireAdmin, async (req, res) => {
    let html = await wrapContent(await adminUser.html(), req);
    res.send(html);
});

// edit task
app.get('/edit', requireAuth, async (req, res) => {
    let html = await wrapContent(await editTask.html(req, res), req);
    res.send(html);
});

// Registrierung
app.get('/register', requireAuth, async (req, res) => {
    let content = await register.handleRegister(req, res);
    if (!content.redirect) {
        let html = await wrapContent(content.html, req);
        res.send(html);
    }
});

app.post('/register', requireAuth, async (req, res) => {
    let content = await register.handleRegister(req, res);
    if (!content.redirect) {
        let html = await wrapContent(content.html, req);
        res.send(html);
    }
});

app.get("/delete", requireAuth, async (req, res) => {
    await deleteTask.deleteTask(req, res);
})

// Login-Seite anzeigen
app.get('/login', async (req, res) => {
    let content = await login.handleLogin(req, res);

    if(content.user.userId !== 0) {
        // login was successful... set cookies and redirect to /
        login.startUserSession(req, res, content.user);
    } else {
        // login unsuccessful or not made jet... display login form
        let html = await wrapContent(content.html, req);
        res.send(html);
    }
});

app.post('/login', async (req, res) => {
    let content = await login.handleLogin(req, res);

    if(content.user.userId !== 0) {
        // login was successful... set session and redirect to /
        login.startUserSession(req, res, content.user);
    } else {
        // login unsuccessful... display login form
        let html = await wrapContent(content.html, req);
        res.send(html);
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.cookie('username','');
    res.cookie('userId','');
    res.redirect('/login');
});

// Profilseite anzeigen
app.get('/profile', (req, res) => {
    if (req.session.loggedin) {
        res.send(`Welcome, ${req.session.username}! <a href="/logout">Logout</a>`);
    } else {
        res.send('Please login to view this page');
    }
});

// save task
app.post('/savetask', requireAuth, async (req, res) => {
    let html = await wrapContent(await saveTask.html(req), req);
    res.send(html);
});

// search
app.post('/search', requireAuth, async (req, res) => {
    let html = await search.html(req);
    res.send(html);
});

// search provider
app.get('/search/v2/', requireAuth, async (req, res) => {
    let result = await searchProvider.search(req);
    res.send(result);
});


// Fehlerbehandlung
app.use((err, req, res, next) => {
    if (err === invalidCsrfTokenError) {
        res.status(403).send("CSRF token validation failed.");
    } else {
        next(err);
    }
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function wrapContent(content, req) {
    let headerHtml = await header(req);
    return headerHtml+content+footer;
}