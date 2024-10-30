
import express from 'express';

const app = express();

app.use(express.json()); // trabalhando com apis
app.use(express.urlencoded({
    extended: false
})); // Server side rendering e sistemas web em geral

app.set('view engine', 'ejs');  // seta a template engine
app.set('views', 'src/views');  // seta a pasta de views

app.get('/healthcheck', (req, res) => {
    res.send('OK');
});

app.get('/', (req, res) => res.redirect('/home'));

app.get('/home', (req, res) => {
    res.render('home');
});

import usersRouter from './routes/users-routes.js';
app.use('/users', usersRouter);

app.listen(3001, () => console.log("Server iniciou na porta 3002"));
