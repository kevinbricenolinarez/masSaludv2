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

// RUTAS ///////////////////////////////////////////////////////////////////////////////

// MAIN /////////////////////////////////////////////////
// DASHBOARD [GET]
app.get('/', function (req, res) {
    res.render('dashboard.hbs');
});

// CLIENTES /////////////////////////////////////////////////
// AGREGAR CLIENTE [GET]
app.get('/clientes/agregarCliente', function (req, res) {
    res.render('personas/clientes/agregarCliente.hbs');
});

// AGREGAR CLIENTES [POST]
app.post('/clientes/agregarCliente', function (req, res) {
    connection.query("insert into PERSONA (RutPer, NomPer) values (" + req.body.rut + ", '" + req.body.nombre + "');", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Agregado el cliente");
        res.redirect('/clientes/listarClientes');
    })
});

// LISTAR CLIENTES [GET]
app.get('/clientes/listarClientes', function (req, res) {
    connection.query('SELECT * FROM Persona', function(error, clientes, fields) {
        if (error) {throw error};
        console.log("The solution is: ", clientes);
        res.render('personas/clientes/listarClientes.hbs', { clientes });
    })
});

// EDITAR CLIENTE [GET]
app.get('/clientes/editar/:RutPer', function(req, res) {
    let rutPersona = req.params.RutPer;
    connection.query('SELECT * FROM Persona WHERE RutPer = ' + rutPersona, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Encontrado el cliente");
        clienteEncontrado = respuesta[0];
        res.render('personas/clientes/actualizarCliente.hbs', { rut: clienteEncontrado.RutPer, nombre: clienteEncontrado.NomPer });
    })
})

// ACTUALIZAR CLIENTE [POST]
app.post('/clientes/editar', function (req, res) {
    connection.query("UPDATE PERSONA SET NomPer = '" + req.body.nombre + "' WHERE RutPer = " + req.body.rut + ";", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Actualizado el cliente");
        res.redirect('/clientes/listarClientes');
    })
});

// ELIMINAR CLIENTE [GET]
app.get('/clientes/eliminar/:RutPer', function(req, res) {
    let rutPersona = req.params.RutPer;
    connection.query('DELETE FROM Persona WHERE RutPer = ' + rutPersona, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Eliminado el cliente");
        res.redirect('/clientes/listarClientes');
    })
})
/////////////////////////////////////////////////////////////

// QUÍMICOS FARMACEUTICOS /////////////////////////////////////////////////
// AGREGAR QUÍMICO FARMACEUTICO [GET]
app.get('/quimicos/agregarQuimicoFarm', function (req, res) {
    res.render('personas/quimicos/agregarQuimicoFarm.hbs');
});

// AGREGAR QUÍMICOS FARMACEUTICOS [POST]
app.post('/quimicos/agregarQuimicoFarm', function (req, res) {
    connection.query("insert into QUIMICOFARMAC (RutQuimic, NomQuimic) values (" + req.body.rut + ", '" + req.body.nombre + "');", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Agregado el químico");
        res.redirect('/quimicos/listarQuimicos');
    })
});

// LISTAR QUÍMICOS FARMACEUTICOS [GET]
app.get('/quimicos/listarQuimicos', function (req, res) {
    connection.query('SELECT * FROM QUIMICOFARMAC', function(error, quimicos, fields) {
        if (error) {throw error};
        console.log("The solution is: ", quimicos);
        res.render('personas/quimicos/listarQuimicos.hbs', { quimicos });
    })
});

// ELIMINAR CLIENTE [GET]
app.get('/quimicos/eliminar/:RutQuimic', function(req, res) {
    let rutQuimico = req.params.RutQuimic;
    connection.query('DELETE FROM QUIMICOFARMAC WHERE RutQuimic = ' + rutQuimico, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Eliminado el químico");
        res.redirect('/quimicos/listarQuimicos');
    })
})
/////////////////////////////////////////////////////////////

// MEDICOS ////////////////////////////////////////////////////////////////
// AGREGAR MEDICO [GET]
app.get('/medicos/agregarMedico', function (req, res) {
    res.render('personas/medicos/agregarMedico.hbs');
});

// LISTAR MEDICOS [GET]
app.get('/medicos/listarMedicos', function (req, res) {
    let medicos = [
        {rut:"26", nombre: "Bottas", especialidad: "Otorrino"},
        {rut:"18", nombre: "Hamilton", especialidad: "Superheroe"},
    ]
    res.render('personas/medicos/listarMedicos.hbs', { medicos });
});

// VENTAS ////////////////////////////////////////////////////////////////
// AGREGAR VENTA [GET]
app.get('/ventas/agregarVenta', async function (req, res) {

    connection.query('SELECT * FROM MEDICAMENTO', async function(error, medicamentos, fields) {
        console.log(medicamentos);

        let formatos = await connection.query('SELECT * FROM FORMATO');
        //formatos = await formatos.
        console.log("FORMATOS: ", formatos);

        res.render('ventas/agregarVenta.hbs', { medicamentos });
    });

});

// LISTAR VENTAS [GET]
app.get('/ventas/listarVentas', async function (req, res) {
    let ventas = await connection.query('SELECT * FROM Venta');
    console.log(ventas)
    res.render('ventas/listarVentas.hbs', { ventas });
});

// MEDICAMENTOS ////////////////////////////////////////////////////////////////
// AGREGAR MEDICAMENTO [GET]
app.get('/medicamentos/agregarMedicamento', function (req, res) {
    res.render('agregarMedicamento.hbs');
});

// LISTAR MEDICAMENTOS [GET]
app.get('/medicamentos/listarMedicamentos', function (req, res) {
    res.render('listarMedicamentos.hbs');
});

// PRECIOS ////////////////////////////////////////////////////////////////
// AGREGAR PRECIO [GET]
app.get('/precios/agregarPrecio', function (req, res) {
    res.render('agregarPrecio.hbs');
});

// LISTAR PRECIOS [GET]
app.get('/precios/listarPrecios', function (req, res) {
    let precios = [ { idMedicamento: "01" } ]
    res.render('listarPrecios.hbs', { precios } );
});