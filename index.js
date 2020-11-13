// MODULOS
var express = require('express');
var app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser')
const mySQL = require('mysql')

// MYSQL
const connection = mySQL.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  database: 'farmacia'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected");
});



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

// CLIENTES
app.get('/clientes/agregarCliente', function (req, res) {
    res.render('personas/clientes/agregarCliente.hbs');
});

app.post('/clientes/agregarCliente', function (req, res) {

    connection.query("insert into PERSONA (RutPer, NomPer) values (" + req.body.rut + ", '" + req.body.nombre + "');", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Agregado el cliente");

        res.redirect('/clientes/listarClientes');
    })

});

app.get('/clientes/listarClientes', function (req, res) {

    connection.query('SELECT * FROM Persona', function(error, clientes, fields) {
        if (error) {throw error};
        console.log("The solution is: ", clientes);

        res.render('personas/clientes/listarClientes.hbs', { clientes });
    })

});

app.get('/clientes/editar/:RutPer', function(req, res) {

    let rutPersona = req.params.RutPer;

    connection.query('SELECT * FROM Persona WHERE RutPer = ' + rutPersona, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Encontrado el cliente");

        clienteEncontrado = respuesta[0];

        res.render('personas/clientes/agregarCliente.hbs', { rut: clienteEncontrado.RutPer, nombre: clienteEncontrado.NomPer });
    })
})

app.get('/clientes/eliminar/:RutPer', function(req, res) {

    let rutPersona = req.params.RutPer;

    // CRUD - CREATE - READ - UPDATE - DELETE

    connection.query('DELETE FROM Persona WHERE RutPer = ' + rutPersona, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Eliminado el cliente");

        res.redirect('/clientes/listarClientes');
    })
})

// QUÍMICO FARMACEUTICO
app.get('/quimicos/agregarQuimicoFarm', function (req, res) {
    res.render('personas/quimicos/agregarQuimicoFarm.hbs');
});

app.get('/quimicos/listarQuimicos', function (req, res) {

    let quimicos = [
        {rut:"26", nombre: "Vettel"},
        {rut:"18", nombre: "Albon"},
    ]
    
    res.render('personas/quimicos/listarQuimicos.hbs', { quimicos });
});

// MEDICOS
app.get('/medicos/listarMedicos', function (req, res) {

    let medicos = [
        {rut:"26", nombre: "Bottas", especialidad: "Otorrino"},
        {rut:"18", nombre: "Hamilton", especialidad: "Superheroe"},
    ]

<<<<<<< HEAD
    res.render('listarMedicos.hbs', { medico1:medicos[0] });
});

app.get('/proveedores/agregarProveedor', function(req, res) {
    res.render('agregarProveedor.hbs');
});

app.get('/proveedores/listarProveedores', function(req, res) {

    let proveedores = [
        {id:"01", nombre:"Cofar"},
        {id:"02", nombre:"Bago"}

    ]
    res.render('listarProveedores.hbs', {proveedores});
});

app.get('/proveedores/stock', function(req, res) {
    res.render('stock.hbs');
})




=======
    res.render('personas/medicos/listarMedicos.hbs', { medicos });
});

app.get('/medicos/agregarMedico', function (req, res) {
    res.render('personas/medicos/agregarMedico.hbs');
});

// VENTAS
app.get('/ventas/agregarVenta', async function (req, res) {

    let medicamentos = await connection.query('SELECT * FROM Medicamento');
    console.log(medicamentos)

    res.render('ventas/agregarVenta.hbs', { medicamentos });
});

// MEDICAMENTOS
app.get('/ventas/agregarMedicamento', function (req, res) {
    res.render('agregarMedicamento.hbs');
});

app.get('/ventas/listarMedicamentos', function (req, res) {
    res.render('listarMedicamentos.hbs');
});

// PRECIOS
app.get('/precios/agregarPrecio', function (req, res) {
    res.render('agregarPrecio.hbs');
});

app.get('/precios/listarPrecios', function (req, res) {

    let precios = [ { idMedicamento: "01" } ]

    res.render('listarPrecios.hbs', { precios } );
    
});
>>>>>>> main
