// MODULOS
var express = require('express');
var app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser')

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }))

// MOTOR
// PLANTILLAS
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

app.set('port', process.env.PORT || 3005);
// ESCUCHAMOS
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
})

// RUTAS ///////////////////////////////
app.get('/', function (req, res) {
    res.render('dashboard.hbs');
});

app.get('/medicos/agregarMedico', function (req, res) {
    res.render('agregarMedico.hbs');
});

app.get('/clientes/agregarCliente', function (req, res) {
    res.render('agregarCliente.hbs');
});

app.get('/medicos/listarMedicos', function (req, res) {

    let medicos = [
        {rut:"26", nombre: "Kevin"},
        {rut:"18", nombre: "Marselo"},
    ]

    res.render('listarMedicos.hbs', { medicos });
});