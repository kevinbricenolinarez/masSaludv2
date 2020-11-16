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
    connection.query("insert into QUIMICOFARMAC (RutQuimic, NomQuimic) values (" + req.body.RutQuimic + ", '" + req.body.NomQuimic + "');", function(error, respuesta, fields) {
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


// EDITAR QUIMICO FARM [GET]
app.get('/quimicos/editar/:RutQuimic', function(req, res) {
    let rutQuimico = req.params.RutQuimic;
    connection.query('SELECT * FROM QUIMICOFARMAC WHERE RutQuimic = ' + rutQuimico, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Encontrado el quimico");
        quimicoEncontrado = respuesta[0];
        res.render('personas/quimicos/actualizarQuimicoFarm.hbs', { RutQuimic: quimicoEncontrado.RutQuimic, NomQuimic: quimicoEncontrado.NomQuimic });
    })
})

// ACTUALIZAR QUIMICOS FARMACEUTICOS [POST]
app.post('/quimicos/editar', function (req, res) {
    connection.query("UPDATE QUIMICOFARMAC SET NomQuimic = '" + req.body.NomQuimic + "' WHERE RutQuimic = " + req.body.RutQuimic + ";", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Actualizado el quimico");
        res.redirect('/quimicos/listarQuimicos');
    })
});

// ELIMINAR QUIMICO FARMAC [GET]
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

//AGREGAR MEDICO [POST]
app.post('/medicos/agregarMedico', function (req, res) {
    connection.query("insert into MEDICO (RutMed, NomMed_m, EspecMed) values (" + req.body.RutMed + ", '" + req.body.NomMed_m + "', '" + req.body.EspecMed + "');", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Agregado el medico");
        res.redirect('/medicos/listarMedicos');
    })
});

// LISTAR MEDICOS [GET]
app.get('/medicos/listarMedicos', function (req, res) {
    connection.query('SELECT * FROM Medico', function(error, medicos, fields) {
        if (error) {throw error};
        console.log("The solution is: ", medicos);
        res.render('personas/medicos/listarMedicos.hbs', { medicos });
    })
});

// EDITAR MEDICO [GET]
app.get('/medicos/editar/:RutMed', function(req, res) {
    let rutMedico = req.params.RutMed;
    connection.query('SELECT * FROM Medico WHERE RutMed = ' + rutMedico, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Encontrado el medico");
        medicoEncontrado = respuesta[0];
        res.render('personas/medicos/actualizarMedicos.hbs', { RutMed: medicoEncontrado.RutMed, NomMed_m: medicoEncontrado.NomMed_m, EspecMed: medicoEncontrado.EspecMed });
    })
})

// ACTUALIZAR MEDICO [POST]
app.post('/medicos/editar', function (req, res) {
    connection.query("UPDATE MEDICO SET NomMed_m = '" + req.body.NomMed_m + "' , EspecMed= '" + req.body.EspecMed + "' WHERE RutMed = " + req.body.RutMed + ";" , function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Actualizado el medico");
        res.redirect('/medicos/listarMedicos');
    })
});


// ELIMINAR MEDICOS [GET]
app.get('/medicos/eliminar/:RutMed', function(req, res) {
    let rutMedico = req.params.RutMed;
    connection.query('DELETE FROM Medico WHERE RutMed = ' + rutMedico, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Eliminado el medico");
        res.redirect('/medicos/listarMedicos');
    })
})

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
    res.render('medicamentos/agregarMedicamento.hbs');
});

// AGREGAR MEDICAMENTO [POST]
app.post('/medicamentos/agregarMedicamento', function (req, res) {
    connection.query("insert into MEDICAMENTO (IdMed, NomMed) values (" + req.body.IdMed + ", '" + req.body.NomMed + "');", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Agregado el medicamento");
        res.redirect('/medicamentos/listarMedicamentos');
    })
});

// LISTAR MEDICAMENTOS [GET]
app.get('/medicamentos/listarMedicamentos', function (req, res) {
    connection.query('SELECT * FROM Medicamento', function(error, medicamentos, fields) {
        if (error) {throw error};
        console.log("The solution is: ", medicamentos);
        res.render('medicamentos/listarMedicamentos.hbs', { medicamentos });
    })
});


// EDITAR MEDICAMENTOS [GET]
app.get('/medicamentos/editar/:IdMed', function(req, res) {
    let idMedicamento = req.params.IdMed;
    connection.query('SELECT * FROM Medicamento WHERE IdMed = ' + idMedicamento, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Encontrado el cliente");
        medicamentoEncontrado = respuesta[0];
        res.render('medicamentos/actualizarMeds.hbs', { IdMed: medicamentoEncontrado.IdMed, NomMed: medicamentoEncontrado.NomMed });
    })
})


// ACTUALIZAR MEDICAMENTOS [POST]
app.post('/medicamentos/editar', function (req, res) {
    connection.query("UPDATE MEDICAMENTO SET NomMed = '" + req.body.NomMed + "' WHERE IdMed = " + req.body.IdMed + ";", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Actualizado el medicamentos");
        res.redirect('/medicamentos/listarMedicamentos');
    })
});

// ELIMINAR MEDS [GET]
app.get('/medicamentos/eliminar/:IdMed', function(req, res) {
    let idMeds = req.params.IdMed;
    connection.query('DELETE FROM Medicamento WHERE IdMed = ' + idMeds, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Eliminado el medicamento");
        res.redirect('/medicamentos/listarMedicamentos');
    })
})


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

//////////////////////////////////
//PROVEEDORES
//AGREGAR PROVEEDOR [GET]
app.get('/proveedores/agregarProveedor', function (req, res) {
    res.render('proveedores/agregarProveedor.hbs');
});
//AGREGAR PROVEEDOR [POST]
app.post('/proveedores/agregarProveedor', function(req, res) {
    connection.query("insert into PROVEEDOR (IdProv, NomLab) values ('" + req.body.IdProv + "', '" + req.body.NomLab + "');", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Agregado el nombre el proveedor:");
        res.redirect('/proveedores/listarProveedores');
    })
    //res.render('/proveedores/agregarProveedor.hbs')
});

// LISTAR PROVEEDORES [GET]
app.get('/proveedores/listarProveedores', function(req, res) {
    connection.query('SELECT * FROM Proveedor', function(error, proveedores, fields) {
        if (error) {throw error};
        console.log("The solution is: ", proveedores);
        res.render('proveedores/listarProveedores.hbs', {proveedores});
    })
});

// EDITAR PROVEEDOR [GET]
app.get('/proveedores/editar/:IdProv', function(req, res) {
    let idprov = req.params.IdProv;
    connection.query('SELECT * FROM Proveedor WHERE IdProv = ' + idprov, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Encontrado el proveedor");
        provEncontrado = respuesta[0];
        res.render('proveedores/actualizarProveedor.hbs', { IdProv: provEncontrado.IdProv, NomLab: provEncontrado.NomLab });
    })
})

// ACTUALIZAR PROVEEDOR [POST]
app.post('/proveedores/editar', function (req, res) {
    connection.query("UPDATE PROVEEDOR SET NomLab = '" + req.body.NomLab + "' WHERE IdProv = " + req.body.IdProv + ";", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Actualizado el proveedor");
        res.redirect('/proveedores/listarProveedores');
    })
});

// ELIMINAR PROVEEDOR [GET]
app.get('/proveedores/eliminar/:IdProv', function(req, res) {
    let idProveedor = req.params.IdProv;
    connection.query('DELETE FROM Proveedor WHERE IdProv = ' + idProveedor, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Eliminado el proveedor");
        res.redirect('/proveedores/listarProveedores');
    })
})

// STOCK
app.get('/proveedores/stock', function(req, res) {
    res.render('stock.hbs');
})

////////////////////////////////////
//SUCURSALES
// AGREGAR SUCURSALES [GET]
app.get('/sucursales/agregarSucur', function (req, res) {
    res.render('sucursales/agregarSucur.hbs');
});

// AGREGAR SUCURSALES [POST]
app.post('/sucursales/agregarSucur', function (req, res) {
    connection.query("insert into SUCURSAL (IdSucursal', IdMuni_s, NombreSucursal) values ('" + req.body.IdSucursal + "', '" + req.body.IdMuni_s + "',  '" + req.body.NombreSucursal + "');", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Agregada la sucursal");
        res.redirect('/sucursales/listarSucur');
    })
    
});

// LISTAR SUCUR [GET]
app.get('/sucursales/listarSucur', function (req, res) {
    connection.query('SELECT * FROM Sucursal', function(error, sucursales, fields) {
        if (error) {throw error};
        console.log("The solution is: ", sucursales);
        res.render('sucursales/listarSucur.hbs', { sucursales });
    })
});

// EDITAR SUCUR [GET]
app.get('/clientes/editar/:RutPer', function(req, res) {
    let rutPersona = req.params.RutPer;
    connection.query('SELECT * FROM Persona WHERE RutPer = ' + rutPersona, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Encontrado el cliente");
        clienteEncontrado = respuesta[0];
        res.render('personas/clientes/actualizarCliente.hbs', { rut: clienteEncontrado.RutPer, nombre: clienteEncontrado.NomPer });
    })
})

// ACTUALIZAR SUCUR [POST]
app.post('/clientes/editar', function (req, res) {
    connection.query("UPDATE PERSONA SET NomPer = '" + req.body.nombre + "' WHERE RutPer = " + req.body.rut + ";", function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Actualizado el cliente");
        res.redirect('/clientes/listarClientes');
    })
});

// ELIMINAR SUCUR[GET]
app.get('/clientes/eliminar/:RutPer', function(req, res) {
    let rutPersona = req.params.RutPer;
    connection.query('DELETE FROM Persona WHERE RutPer = ' + rutPersona, function(error, respuesta, fields) {
        if (error) {throw error};
        console.log("Eliminado el cliente");
        res.redirect('/clientes/listarClientes');
    })
})


