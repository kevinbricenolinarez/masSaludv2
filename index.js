// MODULOS
var express = require('express');
var app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser')
const mySQL = require('mysql')
const axios = require('axios')

// MYSQL
const connection = mySQL.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  database: 'farmacia',
  multipleStatements: true,
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

    connection.query(`SELECT COUNT(*) FROM STOCK;SELECT COUNT(*) FROM LISTAPRECIO;SELECT COUNT(*) FROM VENTAS;SELECT COUNT(*) FROM ENROLADO;SELECT * FROM VENTAS LIMIT 3;
    
    SELECT FechaVencimiento, Unidades, IdLote_v, IdProv_v
    FROM VENCIMIENTO WHERE DATEDIFF(FechaVencimiento, CURRENT_TIMESTAMP()) > 0 AND DATEDIFF(FechaVencimiento, CURRENT_TIMESTAMP()) <= 5;
    
    `, function(error, respuesta, fields) {

        console.log("RESP:", respuesta);
        console.log("RESP[0]:", respuesta[0][0]['COUNT(*)']);

        console.log(Object.keys(respuesta[0]))

        let cantidades = {
            stock: respuesta[0][0]['COUNT(*)'],
            listaPrecio: respuesta[1][0]['COUNT(*)'],
            venta: respuesta[2][0]['COUNT(*)'],
            enrolado: respuesta[3][0]['COUNT(*)'],
        }

        let proximosVencimientos = respuesta[5];

        proximosVencimientos.forEach((v) => {
            // FORMATO BONITO
            v.FechaVencimientoBonita =  v.FechaVencimiento.getDate() + "-" + (v.FechaVencimiento.getMonth() + 1) + "-" + v.FechaVencimiento.getFullYear();
            console.log("v.FechaVencimientoBonita =", v.FechaVencimientoBonita);
        })

        console.log(proximosVencimientos);

        let ventas = respuesta[4];

        ventas.forEach((v) => {
            v.FechaVentaBonita =  v.FechaVenta.getDate() + "-" + (v.FechaVenta.getMonth() + 1) + "-" + v.FechaVenta.getFullYear();
            v.FechaVenta =  v.FechaVenta.getFullYear() + "-" + (v.FechaVenta.getMonth() + 1) + "-" + v.FechaVenta.getDate();
            console.log("v.FechaVenta =", v.FechaVenta);
            console.log("v.FechaVentaBonita =", v.FechaVentaBonita);
        })

        res.render('dashboard.hbs', { cantidades, ventas, proximosVencimientos });
    });
});

// CLIENTES /////////////////////////////////////////////////
// AGREGAR CLIENTE [GET]
app.get('/clientes/agregarCliente', function (req, res) {
    res.render('personas/clientes/agregarCliente.hbs');
});

// AGREGAR CLIENTES [POST]
app.post('/clientes/agregarCliente', function (req, res) {
    connection.query("insert into PERSONA (RutPer, NomPer) values (" + req.body.rut + ", '" + req.body.nombre + "');", function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Agregado el cliente");
        res.redirect('/clientes/listarClientes/byList');
    })
});

// LISTAR CLIENTES [GET]
app.get('/clientes/listarClientes/:sort', function (req, res) {
    consulta = '';  
    if (req.params.sort == "byList") {
        consulta = 'SELECT * FROM Persona';
    }
    else if (req.params.sort == "byNomAZ") {
        consulta = 'SELECT * FROM Persona ORDER BY NomPer ASC';
    }
    else if (req.params.sort == "byNomZA") {
        consulta = 'SELECT * FROM Persona ORDER BY NomPer DESC';
    }
    else if (req.params.sort == "byRutAsc") {
        consulta = 'SELECT * FROM Persona ORDER BY RutPer ASC';
    }
    else if (req.params.sort == "byRutDesc") {
        consulta = 'SELECT * FROM Persona ORDER BY RutPer DESC';
    }
    connection.query(consulta, function(error, clientes, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("The solution is: ", clientes);

        
        clientes.forEach((c) => {
            let RutPerString = c.RutPer.toString();
            RutPerString = RutPerString.substring(0, (RutPerString.length-1)) + "-" + RutPerString[RutPerString.length-1];
            c.RutPer_Bonito = RutPerString;
        })
        
        res.render('personas/clientes/listarClientes.hbs', { clientes });
    })
});

// LISTAR CLIENTES [POST]
app.post('/clientes/listarClientes', function (req, res) {
    connection.query('SELECT * FROM Persona WHERE RutPer = "' + req.body.rut + '"', function(error, clientes, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("The solution is: ", clientes);
        res.render('personas/clientes/listarClientes.hbs', { clientes });
    })
});

// EDITAR CLIENTE [GET]
app.get('/clientes/editar/:RutPer', function(req, res) {
    let rutPersona = req.params.RutPer;
    connection.query('SELECT * FROM Persona WHERE RutPer = ' + rutPersona, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Encontrado el cliente");
        clienteEncontrado = respuesta[0];
        res.render('personas/clientes/actualizarCliente.hbs', { rut: clienteEncontrado.RutPer, nombre: clienteEncontrado.NomPer });
    })
})

// ACTUALIZAR CLIENTE [POST]
app.post('/clientes/editar', function (req, res) {
    connection.query("UPDATE PERSONA SET NomPer = '" + req.body.nombre + "' WHERE RutPer = " + req.body.rut + ";", function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Actualizado el cliente");
        res.redirect('/clientes/listarClientes/byList');
    })
});

// ELIMINAR CLIENTE [GET]
app.get('/clientes/eliminar/:RutPer', function(req, res) {
    let rutPersona = req.params.RutPer;
    connection.query('DELETE FROM Persona WHERE RutPer = ' + rutPersona, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado el cliente");
        res.redirect('/clientes/listarClientes/byList');
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
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Agregado el químico");
        res.redirect('/quimicos/listarQuimicos/byList');
    })
});

// LISTAR QUÍMICOS FARMACEUTICOS [GET]
app.get('/quimicos/listarQuimicos/:sort', function (req, res) {

    consulta = '';  
    if (req.params.sort == "byList") {
        consulta = 'SELECT * FROM QUIMICOFARMAC';
    }
    else if (req.params.sort == "byNomAZ") {
        consulta = 'SELECT * FROM QUIMICOFARMAC ORDER BY NomQuimic ASC';
    }
    else if (req.params.sort == "byNomZA") {
        consulta = 'SELECT * FROM QUIMICOFARMAC ORDER BY NomQuimic DESC';
    }
    else if (req.params.sort == "byRutAsc") {
        consulta = 'SELECT * FROM QUIMICOFARMAC ORDER BY RutQuimic ASC';
    }
    else if (req.params.sort == "byRutDesc") {
        consulta = 'SELECT * FROM QUIMICOFARMAC ORDER BY RutQuimic DESC';
    }

    connection.query(consulta, function(error, quimicos, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("QUIMICOS ENCONTRADOS: ", quimicos);

        quimicos.forEach((q) => {
            let rutQuimicString = q.RutQuimic.toString();
            rutQuimicString = rutQuimicString.substring(0, (rutQuimicString.length-1)) + "-" + rutQuimicString[rutQuimicString.length-1];
            q.RutQuimic_Bonito = rutQuimicString;
        })

        res.render('personas/quimicos/listarQuimicos.hbs', { quimicos });
    })
});

// LISTAR QUÍMICOS [POST]
app.post('/quimicos/listarQuimicos', function (req, res) {
    connection.query('SELECT * FROM QUIMICOFARMAC WHERE RutQuimic = ' + req.body.rut + ';', function(error, quimicos, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("The solution is: ", quimicos);
        res.render('personas/quimicos/listarQuimicos.hbs', { quimicos });
    })
});

// EDITAR QUIMICO FARM [GET]
app.get('/quimicos/editar/:RutQuimic', function(req, res) {
    let rutQuimico = req.params.RutQuimic;
    connection.query('SELECT * FROM QUIMICOFARMAC WHERE RutQuimic = ' + rutQuimico, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Encontrado el quimico");
        quimicoEncontrado = respuesta[0];
        res.render('personas/quimicos/actualizarQuimicoFarm.hbs', { RutQuimic: quimicoEncontrado.RutQuimic, NomQuimic: quimicoEncontrado.NomQuimic });
    })
})

// ACTUALIZAR QUIMICOS FARMACEUTICOS [POST]
app.post('/quimicos/editar', function (req, res) {
    connection.query("UPDATE QUIMICOFARMAC SET NomQuimic = '" + req.body.NomQuimic + "' WHERE RutQuimic = " + req.body.RutQuimic + ";", function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Actualizado el quimico");
        res.redirect('/quimicos/listarQuimicos/byList');
    })
});

// ELIMINAR QUIMICO FARMAC [GET]
app.get('/quimicos/eliminar/:RutQuimic', function(req, res) {
    let rutQuimico = req.params.RutQuimic;
    connection.query('DELETE FROM QUIMICOFARMAC WHERE RutQuimic = ' + rutQuimico, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado el químico");
        res.redirect('/quimicos/listarQuimicos/byList');
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
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Agregado el medico");
        res.redirect('/medicos/listarMedicos/byList');
    })
});

// LISTAR MEDICOS [GET]
app.get('/medicos/listarMedicos/:sort', function (req, res) {
    consulta = '';  
    if (req.params.sort == "byList") {
        consulta = 'SELECT * FROM Medico';
    }
    else if (req.params.sort == "byNomAZ") {
        consulta = 'SELECT * FROM Medico ORDER BY NomMed_m ASC';
    }
    else if (req.params.sort == "byNomZA") {
        consulta = 'SELECT * FROM Medico ORDER BY NomMed_m DESC';
    }
    else if (req.params.sort == "byRutAsc") {
        consulta = 'SELECT * FROM Medico ORDER BY RutMed ASC';
    }
    else if (req.params.sort == "byRutDesc") {
        consulta = 'SELECT * FROM Medico ORDER BY RutMed DESC';
    }

    connection.query(consulta, function(error, medicos, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("The solution is: ", medicos);

        medicos.forEach((m) => {
            let rutMedString = m.RutMed.toString();
            rutMedString = rutMedString.substring(0, (rutMedString.length-1)) + "-" + rutMedString[rutMedString.length-1];
            m.RutMed_Bonito = rutMedString;
        })

        res.render('personas/medicos/listarMedicos.hbs', { medicos });
    })
});

// LISTAR MEDICOS [POST]
app.post('/medicos/listarMedicos', function (req, res) {
    connection.query('SELECT * FROM MEDICO WHERE RutMed = "' + req.body.rut + '"', function(error, medicos, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("The solution is: ", medicos);
        res.render('personas/medicos/listarMedicos.hbs', { medicos });
    })
});

// EDITAR MEDICO [GET]
app.get('/medicos/editar/:RutMed', function(req, res) {
    let rutMedico = req.params.RutMed;
    connection.query('SELECT * FROM Medico WHERE RutMed = ' + rutMedico, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Encontrado el medico");
        medicoEncontrado = respuesta[0];
        res.render('personas/medicos/actualizarMedicos.hbs', { RutMed: medicoEncontrado.RutMed, NomMed_m: medicoEncontrado.NomMed_m, EspecMed: medicoEncontrado.EspecMed });
    })
})

// ACTUALIZAR MEDICO [POST]
app.post('/medicos/editar', function (req, res) {
    connection.query("UPDATE MEDICO SET NomMed_m = '" + req.body.NomMed_m + "' , EspecMed= '" + req.body.EspecMed + "' WHERE RutMed = " + req.body.RutMed + ";" , function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Actualizado el medico");
        res.redirect('/medicos/listarMedicos/byList');
    })
});


// ELIMINAR MEDICOS [GET]
app.get('/medicos/eliminar/:RutMed', function(req, res) {
    let rutMedico = req.params.RutMed;
    connection.query('DELETE FROM Medico WHERE RutMed = ' + rutMedico, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado el medico");
        res.redirect('/medicos/listarMedicos/byList');
    })
})

// VENTAS ////////////////////////////////////////////////////////////////
// AGREGAR VENTA [GET]
app.get('/ventas/agregarVenta', async function (req, res) {
    connection.query("SELECT * FROM FORMATO; SELECT * FROM PRESENTACION; SELECT * FROM TIPOMEDIC; SELECT * FROM DESCUENTO; SELECT * FROM MEDICAMENTO;", function(error, respuesta, fields) {  
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Formatos encontrados:", respuesta);
        data = {
            formatos: respuesta[0],
            presentaciones: respuesta[1],
            tipos: respuesta[2],
            descuentos: respuesta[3],
            medicamentos: respuesta[4],
        }
        res.render('ventas/agregarVenta.hbs', { data });
    })
});

app.post('/ventas/agregarVenta', function (req, res) {
    let aplicaSN = "";

    connection.query(`SELECT * FROM ENROLADO WHERE RutPer_e = '${req.body.RutPer_v}';`, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };

        if (respuesta.length > 0) {
            aplicaSN = "Aplica";
        }
        else {
            aplicaSN = "No aplica";
        }

        connection.query(`insert into VENTAS (FechaVenta, HoraVenta, TipoVenta, TipoPresentacion_v, AplicSN_v, IdMed_v, RutPer_v, RutQuim_v, TipoFormato_v) values (curdate(), curtime(),'${req.body.TipoVenta}', '${req.body.TipoPresentacion_v}',  '${aplicaSN}',  '${req.body.IdMed_v}',  '${req.body.RutPer_v}',  '${req.body.RutQuim_v}',  '${req.body.TipoFormato_v}');`, function(error, respuesta, fields) {
            if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
            console.log("RESP:", respuesta);
            console.log("Agregada la venta");
            res.redirect('/ventas/listarVentas/byDateDesc');
        })

    })


});

// LISTAR VENTAS [GET]
app.get('/ventas/listarVentas/:sort', async function (req, res) {

    let fechaActual = new Date();
    console.log(fechaActual.toUTCString());

    let consulta = "";
    if (req.params.sort == "byDateDesc") {
        consulta = "SELECT * FROM VENTAS ORDER BY FechaVenta DESC";
    }
    else if (req.params.sort == "byDateAsc") {
        consulta = "SELECT * FROM VENTAS ORDER BY FechaVenta ASC";
    }
    connection.query(consulta, function(error, ventas, fields) {  
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        ventas.forEach((v) => {
            v.FechaVentaBonita =  v.FechaVenta.getDate() + "-" + (v.FechaVenta.getMonth() + 1) + "-" + v.FechaVenta.getFullYear();
            v.FechaVenta =  v.FechaVenta.getFullYear() + "-" + (v.FechaVenta.getMonth() + 1) + "-" + v.FechaVenta.getDate();
            console.log("v.FechaVenta =", v.FechaVenta);
            console.log("v.FechaVentaBonita =", v.FechaVentaBonita);

            let rutClienteString = v.RutPer_v.toString();
            rutClienteString = rutClienteString.substring(0, (rutClienteString.length - 1)) + "-" + rutClienteString[rutClienteString.length - 1];

            let rutQuimicoString = v.RutQuim_v.toString();
            rutQuimicoString = rutQuimicoString.substring(0, (rutQuimicoString.length - 1)) + "-" + rutQuimicoString[rutQuimicoString.length - 1];
            //console.log("RUT CLIENTE PROCESADO:", rutClienteString);

            v.RutPer_v_Bonito = rutClienteString;
            v.RutQui_v_Bonito = rutQuimicoString;
        })
        res.render('ventas/listarVentas.hbs', { ventas });
    })
});

// LISTAR VENTAS [POST]
app.post('/ventas/listarVentas', function (req, res) {
    connection.query('SELECT * FROM VENTAS WHERE RutPer_v = "' + req.body.rut + '"', function(error, ventas, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        ventas.forEach((v) => {
            v.FechaVentaBonita =  v.FechaVenta.getDate() + "-" + (v.FechaVenta.getMonth() + 1) + "-" + v.FechaVenta.getFullYear();
            v.FechaVenta =  v.FechaVenta.getFullYear() + "-" + (v.FechaVenta.getMonth() + 1) + "-" + v.FechaVenta.getDate();
            console.log("v.FechaVenta =", v.FechaVenta);
            console.log("v.FechaVentaBonita =", v.FechaVentaBonita);
        })
        res.render('ventas/listarVentas.hbs', { ventas });
    })
});

// EDITAR VENTAS [GET]
app.get('/ventas/editar/:RutPer_v/:FechaVenta/:HoraVenta', function(req, res) {
    connection.query(`SELECT * FROM FORMATO; SELECT * FROM PRESENTACION; SELECT * FROM TIPOMEDIC; SELECT * FROM DESCUENTO; SELECT * FROM MEDICAMENTO; 
                    SELECT * FROM VENTAS WHERE RutPer_v = ${req.params.RutPer_v} AND FechaVenta = '${req.params.FechaVenta}' AND HoraVenta = '${req.params.HoraVenta}';`, function(error, respuesta, fields) {
        
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("respuesta[0] =", respuesta[0]);

        data = {
            formatos: respuesta[0],
            presentaciones: respuesta[1],
            tipos: respuesta[2],
            descuentos: respuesta[3],
            medicamentos: respuesta[4],
        }

        let venta = respuesta[5][0];
        venta.FechaVenta =  venta.FechaVenta.getFullYear() + "-" + (venta.FechaVenta.getMonth() + 1) + "-" + venta.FechaVenta.getDate();

        res.render('ventas/actualizarVenta.hbs', { data, venta });
    })
})

// ACTUALIZAR VENTAS [POST]
app.post('/ventas/editar', function (req, res) {
    connection.query(`UPDATE VENTAS SET IdMed_v = ${req.body.IdMed_v}, TipoFormato_v = '${req.body.TipoFormato_v}', TipoPresentacion_v = '${req.body.TipoPresentacion_v}', TipoVenta = '${req.body.TipoVenta}' WHERE RutPer_v = ${req.body.RutPer_v} AND FechaVenta = '${req.body.FechaVenta}' AND HoraVenta = '${req.body.HoraVenta}';`, function(error, respuesta, fields) {
        
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Venta actualizada");
        res.redirect('/ventas/listarVentas/byDateDesc');
    })
});

// ELIMINAR VENTAS [GET]
app.get('/ventas/eliminar/:RutPer_v/:FechaVenta/:HoraVenta', function(req, res) {
    let consulta = 'DELETE FROM Ventas WHERE RutPer_v = "' + req.params.RutPer_v + '" AND HoraVenta = "' + req.params.HoraVenta + '" AND FechaVenta = "' + req.params.FechaVenta + '";';
    console.log(consulta);
    connection.query(consulta, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado la venta");
        res.redirect('/ventas/listarVentas/byDateDesc');
    })
})

// MEDICAMENTOS ////////////////////////////////////////////////////////////////
// AGREGAR MEDICAMENTO [GET]
app.get('/medicamentos/agregarMedicamento', function (req, res) {
    res.render('medicamentos/agregarMedicamento.hbs');
});

// AGREGAR MEDICAMENTO [POST]
app.post('/medicamentos/agregarMedicamento', function (req, res) {
    connection.query("insert into MEDICAMENTO (IdMed, NomMed) values (" + req.body.IdMed + ", '" + req.body.NomMed + "');", function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Agregado el medicamento");
        res.redirect('/medicamentos/listarMedicamentos/byNomAZ');
    })
});

// LISTAR MEDICAMENTOS [GET]
app.get('/medicamentos/listarMedicamentos/:sort', function (req, res) {

    let consulta = "";
    if (req.params.sort == "byNomAZ") {
        consulta = "SELECT * FROM MEDICAMENTO ORDER BY NomMed ASC";
    }
    else if (req.params.sort == "byNomZA") {
        consulta = "SELECT * FROM MEDICAMENTO ORDER BY NomMed DESC";
    }  

    connection.query(consulta, function(error, medicamentos, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("The solution is: ", medicamentos);
        res.render('medicamentos/listarMedicamentos.hbs', { medicamentos });
    })
});


// EDITAR MEDICAMENTOS [GET]
app.get('/medicamentos/editar/:IdMed', function(req, res) {
    let idMedicamento = req.params.IdMed;
    connection.query('SELECT * FROM Medicamento WHERE IdMed = ' + idMedicamento, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Encontrado el cliente");
        medicamentoEncontrado = respuesta[0];
        res.render('medicamentos/actualizarMeds.hbs', { IdMed: medicamentoEncontrado.IdMed, NomMed: medicamentoEncontrado.NomMed });
    })
})

// ACTUALIZAR MEDICAMENTOS [POST]
app.post('/medicamentos/editar', function (req, res) {
    connection.query("UPDATE MEDICAMENTO SET NomMed = '" + req.body.NomMed + "' WHERE IdMed = " + req.body.IdMed + ";", function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Actualizado el medicamentos");
        res.redirect('/medicamentos/listarMedicamentos/byNomAZ');
    })
});

// ELIMINAR MEDS [GET]
app.get('/medicamentos/eliminar/:IdMed', function(req, res) {
    let idMeds = req.params.IdMed;
    connection.query('DELETE FROM Medicamento WHERE IdMed = ' + idMeds, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado el medicamento");
        res.redirect('/medicamentos/listarMedicamentos/byNomAZ');
    })
})

// PROVEEDORES ////////////////////////////////////////////////////////////////
//AGREGAR PROVEEDOR [GET]
app.get('/proveedores/agregarProveedor', function (req, res) {
    res.render('proveedores/agregarProveedor.hbs');
});
//AGREGAR PROVEEDOR [POST]
app.post('/proveedores/agregarProveedor', function(req, res) {
    connection.query("insert into PROVEEDOR (IdProv, NomLab) values ('" + req.body.IdProv + "', '" + req.body.NomLab + "');", function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Agregado el nombre el proveedor:");
        res.redirect('/proveedores/listarProveedores/byNomAZ');
    })
});

// LISTAR PROVEEDORES [GET]
app.get('/proveedores/listarProveedores/:sort', function(req, res) {

    let consulta = "";
    if (req.params.sort == "byNomAZ") {
        consulta = "SELECT * FROM Proveedor ORDER BY NomLab ASC";
    }
    else if (req.params.sort == "byNomZA") {
        consulta = "SELECT * FROM Proveedor ORDER BY NomLab DESC";
    }  

    connection.query(consulta, function(error, proveedores, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("The solution is: ", proveedores);
        res.render('proveedores/listarProveedores.hbs', {proveedores});
    })
});

// EDITAR PROVEEDOR [GET]
app.get('/proveedores/editar/:IdProv', function(req, res) {
    let idprov = req.params.IdProv;
    connection.query('SELECT * FROM Proveedor WHERE IdProv = ' + idprov, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Encontrado el proveedor");
        provEncontrado = respuesta[0];
        res.render('proveedores/actualizarProveedor.hbs', { IdProv: provEncontrado.IdProv, NomLab: provEncontrado.NomLab });
    })
})

// ACTUALIZAR PROVEEDOR [POST]
app.post('/proveedores/editar', function (req, res) {
    connection.query("UPDATE PROVEEDOR SET NomLab = '" + req.body.NomLab + "' WHERE IdProv = " + req.body.IdProv + ";", function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Actualizado el proveedor");
        res.redirect('/proveedores/listarProveedores/byNomAZ');
    })
});

// ELIMINAR PROVEEDOR [GET]
app.get('/proveedores/eliminar/:IdProv', function(req, res) {
    let idProveedor = req.params.IdProv;
    connection.query('DELETE FROM Proveedor WHERE IdProv = ' + idProveedor, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado el proveedor");
        res.redirect('/proveedores/listarProveedores/byNomAZ');
    })
})

///////////////////////// STOCK
//AGREGAR STOCK [GET]
app.get('/stock/agregarStock', function (req, res) {
    connection.query("SELECT * FROM FORMATO; SELECT * FROM PRESENTACION; SELECT * FROM PROVEEDOR; SELECT * FROM MEDICAMENTO; SELECT Cantidad FROM STOCK; SELECT * FROM LOTE", function(error, respuesta, fields) {  
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Formatos encontrados:", respuesta)
        
        dataStock = {
            formatos: respuesta[0],
            presentaciones: respuesta[1],
            proveedores: respuesta[2],
            medicamentos: respuesta[3],
            cantidad: respuesta[4],
            lote: respuesta[5],
        }
        res.render('stock/agregarStock.hbs', { dataStock });  
    })  
});

//CREAR LOTE

//AGREGAR STOCK [POST]
app.post('/stock/agregarStock', function (req, res) {
    connection.query(`insert into LOTE (IdLote,IdProv_l) values('${req.body.IdLote_s}','${req.body.IdProv_s}' ); insert into STOCK (IdProv_s, IdMed_s, TipoPresentacion_s, TipoFormato_s,Cantidad, FechaLlegadaStock, IdLote_s) values ('${req.body.IdProv_s}', '${req.body.IdMed_s}',  '${req.body.TipoPresentacion_s}', '${req.body.TipoFormato_s}','${req.body.Cantidad}','${req.body.FechaLlegadaStock}','${req.body.IdLote_s}');`, function(error, respuesta, fields) {
        if (error) { 
            if (error.code = 'ER_DUP_ENTRY') {
                connection.query(`insert into STOCK (IdProv_s, IdMed_s, TipoPresentacion_s, TipoFormato_s,Cantidad, FechaLlegadaStock, IdLote_s) values ('${req.body.IdProv_s}', '${req.body.IdMed_s}',  '${req.body.TipoPresentacion_s}', '${req.body.TipoFormato_s}','${req.body.Cantidad}','${req.body.FechaLlegadaStock}','${req.body.IdLote_s}');`, function(error, respuesta, fields) {
                    if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
                    console.log("RESP:", respuesta);
                    console.log("Agregado el registro del stock");
                    res.redirect('/stock/listarStock/byDateDesc');
                    return false;
                })
            }
            return false;
        };
        console.log("RESP:", respuesta);
        console.log("Agregado el registro del stock");
        res.redirect('/stock/listarStock/byDateDesc');
    })
});

//LISTAR STOCK [GET]
app.get('/stock/listarStock/:sort', async function (req, res) {

    let consulta = "";
    if (req.params.sort == "byDateDesc") {
        consulta = "SELECT * FROM STOCK ORDER BY FechaLlegadaStock DESC";
    }
    else if (req.params.sort == "byDateAsc") {
        consulta = "SELECT * FROM STOCK ORDER BY FechaLlegadaStock ASC";
    }    

    connection.query(consulta, function(error, stock, fields) { 
        console.log("STOCK ENCONTRADO:", stock);

        stock.forEach((s) => {
            // FORMATO BONITO
            s.FechaLlegadaStockBonita =  s.FechaLlegadaStock.getDate() + "-" + (s.FechaLlegadaStock.getMonth() + 1) + "-" + s.FechaLlegadaStock.getFullYear();
            console.log("s.FechaLlegadaStockBonita =", s.FechaLlegadaStockBonita);
            
            // FORMATO PARA ENVIAR A DB
            s.FechaLlegadaStock =  s.FechaLlegadaStock.getFullYear() + "-" + (s.FechaLlegadaStock.getMonth() + 1) + "-" + s.FechaLlegadaStock.getDate();
            console.log("s.FechaLlegadaStock =", s.FechaLlegadaStock);

        })

        res.render('stock/listarStock.hbs', { stock });
    })
});

//ELIMINAR STOCK [GET]
/*
app.get('/stock/eliminar/:FechaLlegadaStock/:TipoPresentacion_s/:TipoFormato_s/:IdLote_s/:IdMed_s/:IdProv_s', function(req, res) {
    connection.query('DELETE FROM STOCK WHERE FechaLlegadaStock = "' + req.params.FechaLlegadaStock + '" AND TipoPresentacion_s = "' + req.params.TipoPresentacion_s + '" AND TipoFormato_s = "' + req.params.TipoFormato_s + '" AND IdMed_s = ' + req.params.IdMed_s + ' AND IdLote_s = ' + req.params.IdLote_s + ' AND IdProv_s = ' + req.params.IdProv_s, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado el stock");
        res.redirect('/stock/listarStock/byDateDesc');
    })
})
*/

// EDITAR STOCK [GET]
app.get('/stock/editar/:IdProv_s/:IdMed_s/:IdLote_s', function(req, res) {
    connection.query(`SELECT * FROM FORMATO; SELECT * FROM PRESENTACION; SELECT * FROM PROVEEDOR; SELECT * FROM MEDICAMENTO; SELECT Cantidad FROM STOCK; SELECT * FROM LOTE; 
                    SELECT * FROM STOCK WHERE IdProv_s = ${req.params.IdProv_s} AND IdMed_s = '${req.params.IdMed_s}' AND IdLote_s = '${req.params.IdLote_s}';`, function(error, respuesta, fields) {
        
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("respuesta[0] =", respuesta[0]);

        dataStock = {
            formatos: respuesta[0],
            presentaciones: respuesta[1],
            proveedores: respuesta[2],
            medicamentos: respuesta[3],
            cantidad: respuesta[4],
            lote: respuesta[5],
        }

        let stock = respuesta[6][0];
        stock.FechaLlegadaStock =  stock.FechaLlegadaStock.getFullYear() + "-" + (stock.FechaLlegadaStock.getMonth() + 1) + "-" + stock.FechaLlegadaStock.getDate();

        res.render('stock/actualizarstock.hbs', { data: dataStock, stock });
    })
})

// ACTUALIZAR STOCK [POST]
app.post('/stock/editar', function (req, res) {
    connection.query(`UPDATE STOCK SET TipoPresentacion_s = '${req.body.TipoPresentacion_s}', TipoFormato_s = '${req.body.TipoFormato_s}', FechaLlegadaStock = '${req.body.FechaLlegadaStock}', Cantidad = ${req.body.Cantidad} WHERE IdMed_s = ${req.body.IdMed_s} AND IdProv_s= '${req.body.IdProv_s}' AND IdLote_s = '${req.body.IdLote_s}';`, function(error, respuesta, fields) {
        
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Stock actualizado");
        res.redirect('/stock/listarStock/byDateDesc');
    })
});

// ELIMINAR STOCK [GET]
app.get('/stock/eliminar/:IdProv_s/:IdMed_s/:IdLote_s', function(req, res) {
    let consulta = 'DELETE FROM STOCK WHERE IdProv_s = "' + req.params.IdProv_s + '" AND IdMed_s = "' + req.params.IdMed_s + '" AND IdLote_s = "' + req.params.IdLote_s + '";';
    console.log(consulta);
    connection.query(consulta, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado el stock");
        res.redirect('/stock/listarStock/byDateDesc');
    })
})

///////////////////////// VENCIMIENTO
//AGREGAR VENCIMIENTO [GET]
app.get('/vencimiento/agregarVencimiento', function (req, res) {
    connection.query("SELECT * FROM PROVEEDOR;", function(error, respuesta, fields) {  
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Proveedores encontrados:", respuesta)
        
        res.render('vencimiento/agregarVencimiento.hbs', { proveedores: respuesta });  
    })  
});

//AGREGAR VENCIMIENTO [POST]
app.post('/vencimiento/agregarVencimiento', function (req, res) {

    connection.query('SELECT * FROM LOTE WHERE IdLote = ' + req.body.IdLote_v, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("RESP:", respuesta);

        if (respuesta.length < 1) {
            console.log("FALLO:", error); res.redirect("/errorDetalle/" + 'El lote no existe'); return false;
        }

        let lote = respuesta[0];
        let IdProv_l = lote.IdProv_l;

        connection.query(`insert into VENCIMIENTO (FechaVencimiento, Unidades, IdLote_v, IdProv_v) values('${req.body.FechaVencimiento}', ${req.body.Unidades}, ${req.body.IdLote_v}, ${IdProv_l});`, function(error, respuesta, fields) {
            if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
            console.log("RESP:", respuesta);
            console.log("Agregado el registro de vencimiento");
            res.redirect('/vencimiento/listarVencimiento/byDateDesc');
        })

    })
});

//LISTAR VENCIMIENTO [GET]
app.get('/vencimiento/listarVencimiento/:sort', async function (req, res) {

    let consulta = "";
    if (req.params.sort == "byDateDesc") {
        consulta = "SELECT * FROM VENCIMIENTO ORDER BY FechaVencimiento DESC";
    }
    else if (req.params.sort == "byDateAsc") {
        consulta = "SELECT * FROM VENCIMIENTO ORDER BY FechaVencimiento ASC";
    }    

    connection.query(consulta, function(error, vencimiento, fields) { 
        console.log("VENCIMIENTO ENCONTRADO:", vencimiento);

        vencimiento.forEach((v) => {
            // FORMATO BONITO
            v.FechaVencimientoBonita =  v.FechaVencimiento.getDate() + "-" + (v.FechaVencimiento.getMonth() + 1) + "-" + v.FechaVencimiento.getFullYear();
            console.log("v.FechaVencimientoBonita =", v.FechaVencimientoBonita);
            
            // FORMATO PARA ENVIAR A DB
            v.FechaVencimiento =  v.FechaVencimiento.getFullYear() + "-" + (v.FechaVencimiento.getMonth() + 1) + "-" + v.FechaVencimiento.getDate();
            console.log("v.FechaVencimiento =", v.FechaVencimiento);

        })

        res.render('vencimiento/listarVencimiento.hbs', { vencimiento });
    })
});

// EDITAR VENCIMIENTO [GET]
app.get('/vencimiento/editar/:FechaVencimiento/:IdLote_v/:IdProv_v', function(req, res) {
    connection.query(`SELECT * FROM PROVEEDOR;
                    SELECT * FROM VENCIMIENTO WHERE FechaVencimiento = '${req.params.FechaVencimiento}' AND IdLote_v = ${req.params.IdLote_v} AND IdProv_v = ${req.params.IdProv_v};`, function(error, respuesta, fields) {
        
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("respuesta =", respuesta);

        let vencimiento = respuesta[1][0];
        vencimiento.FechaVencimiento =  vencimiento.FechaVencimiento.getFullYear() + "-" + (vencimiento.FechaVencimiento.getMonth() + 1) + "-" + vencimiento.FechaVencimiento.getDate();

        res.render('vencimiento/actualizarVencimiento.hbs', { proveedores: respuesta[0], vencimiento });
    })
})

// ACTUALIZAR VENCIMIENTO [POST]
app.post('/vencimiento/editar', function (req, res) {
    connection.query(`UPDATE VENCIMIENTO SET FechaVencimiento = '${req.body.FechaVencimiento}', IdProv_v = ${req.body.IdProv_v}, Unidades = ${req.body.Unidades} WHERE FechaVencimiento = '${req.body.FechaVencimiento_Old}' AND IdLote_v = ${req.body.IdLote_v} AND IdProv_v = ${req.body.IdProv_v_Old};`, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Vencimiento actualizado");
        res.redirect('/vencimiento/listarVencimiento/byDateDesc');
    })
});

// ELIMINAR VENCIMIENTO [GET]
app.get('/vencimiento/eliminar/:FechaVencimiento/:IdLote_v/:IdProv_v', function(req, res) {
    let consulta = `DELETE FROM VENCIMIENTO WHERE FechaVencimiento = '${req.params.FechaVencimiento}' AND IdLote_v = ${req.params.IdLote_v} AND IdProv_v = ${req.params.IdProv_v};`;
    console.log(consulta);
    connection.query(consulta, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado el vencimiento");
        res.redirect('/vencimiento/listarVencimiento/byDateDesc');
    })
})

////////////////////////////////////
// ERROR
app.get('/error', function (req, res) {
    res.render('error.hbs');
});

app.get('/errorDetalle/:msg', function (req, res) {
    res.render('error.hbs', { msg: req.params.msg } );
});

app.post('/error', function (req, res) {
    res.render('error.hbs', { error: req.body.errorMsg });
});

////////////////////////////////////
// PRECIOS
// AGREGAR PRECIOS [GET]

app.get('/listaPrecios/agregarPrecio', function (req, res) {
    connection.query("SELECT TipoFormato FROM FORMATO; SELECT * FROM PRESENTACION; SELECT * FROM TIPOMEDIC; SELECT * FROM DESCUENTO; select IdMed, NomMed from medicamento left join listaprecio on medicamento.idmed = listaprecio.idmed_l where listaprecio.precio is null;", function(error, respuesta, fields) {  
    // connection.query("SELECT * FROM FORMATO; SELECT * FROM PRESENTACION; SELECT * FROM TIPOMEDIC; SELECT * FROM DESCUENTO; SELECT * FROM MEDICAMENTO;", function(error, respuesta, fields) {  
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Formatos encontrados:", respuesta);
        data = {
            formatos: respuesta[0],
            presentaciones: respuesta[1],
            tipos: respuesta[2],
            descuentos: respuesta[3],
            medicamentos: respuesta[4],
        }
        res.render('listaPrecios/agregarPrecio.hbs', { data });
    })
});

// AGREGAR PRECIOS [POST]
app.post('/listaPrecios/agregadoPrecio', function (req, res) {
    let AplicSN_l = "Aplica" || "No aplica";
    connection.query(`INSERT into listaprecio(precio, TipoFormato_l, AplicSN_l, TipoPresentacion_l, IdMed_l) values ('${req.body.precio}', '${req.body.TipoFormato}',  '${AplicSN_l}',  '${req.body.TipoPresentacion}',  '${req.body.NomMed}');`, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Agregado precio");
        req.body.precio
        res.redirect('/listaPrecios/listarPrecios/byList');
    })
});


//LISTAR PRECIOS [GET]
app.get('/listaPrecios/listarPrecios/:sort', async function (req, res) {

    sortBy = '';  
    if (req.params.sort == "byList") {
        sortBy = '';
    }
    else if (req.params.sort == "byPrecioAsc") {
        sortBy = 'ORDER BY Precio ASC';
    }
    else if (req.params.sort == "byPrecioDesc") {
        sortBy = 'ORDER BY Precio DESC';
    }
    
    connection.query("select * from medicamento, listaprecio where medicamento.idmed = listaprecio.idmed_l" + sortBy, function(error, precios, fields) { 
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("RESP:", precios);
        res.render('listaPrecios/listarPrecios.hbs', { precios });
    })
});

// ELIMINAR PRECIO 
app.get('/listaPrecios/eliminar/:IdMed', function(req, res) {
    let idMeds = req.params.IdMed;
    connection.query('DELETE FROM LISTAPRECIO WHERE IdMed_l = ' + idMeds, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado el precio");
        res.redirect('/listaPrecios/listarPrecios/byList');
    })
})


// EDITAR PRECIO [GET]
app.get('/listaPrecios/editar/:IdMed', function(req, res) {
    let idMedicamento = req.params.IdMed;
    connection.query('SELECT * FROM Listaprecio WHERE IdMed_l = ' + idMedicamento, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Encontrado el precio",respuesta[0]);
        precioEncontrado = respuesta[0];
        res.render('listaPrecios/actualizarPrecio.hbs', { IdMed: precioEncontrado.IdMed_l, Precio: precioEncontrado.Precio });
    })
})


// ACTUALIZAR PRECIO [POST]
app.post('/listaPrecios/editar', function (req, res) {
    connection.query("UPDATE Listaprecio SET Precio = '" + req.body.Precio + "' WHERE IdMed_l = " + req.body.IdMed + ";", function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Actualizado el precio");
        res.redirect('/listaPrecios/listarPrecios/byList');
    })
});

////////////////////////////////////
// SUCURSALES
// AGREGAR SUCURSALES [GET]
app.get('/sucursales/agregarSucur', function (req, res) {
    connection.query("SELECT * FROM MUNICIPIO", function(error, municipios, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Municipios encontrados:", municipios);
        res.render('sucursales/agregarSucur.hbs', { municipios });
    })
});

// AGREGAR SUCURSALES [POST]
app.post('/sucursales/agregarSucur', function (req, res) {
    connection.query(`insert into SUCURSAL (IdSucursal, IdMuni_s, NombreSucursal) values ('${req.body.IdSucursal}', '${req.body.IdMuni_s}',  '${req.body.NombreSucursal}');`, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("RESP:", respuesta);
        console.log("Agregada la sucursal");
        res.redirect('/sucursales/listarSucur');
    })
});

// LISTAR SUCUR [GET]
app.get('/sucursales/listarSucur/:sort', function (req, res) {

    let consulta = "";
    if (req.params.sort == "byNomAZ") {
        consulta = "SELECT * FROM Sucursal ORDER BY NombreSucursal ASC";
    }
    else if (req.params.sort == "byNomZA") {
        consulta = "SELECT * FROM Sucursal ORDER BY NombreSucursal DESC";
    }  

    connection.query(consulta, function(error, sucursales, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("The solution is: ", sucursales);
        res.render('sucursales/listarSucur.hbs', { sucursales });
    })
});

// EDITAR SUCUR [GET]
app.get('/sucursales/editar/:IdSucursal', function(req, res) {
    connection.query('SELECT * FROM MUNICIPIO; SELECT * FROM SUCURSAL WHERE IdSucursal = ' + req.params.IdSucursal, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Encontrada la sucursal", respuesta[1]);

        res.render('sucursales/actualizarSucur.hbs', { municipios: respuesta[0], sucursal: respuesta[1][0] });
    })
})

// ACTUALIZAR SUCUR [POST]
app.post('/sucursales/editar', function (req, res) {
    connection.query("UPDATE SUCURSAL SET NombreSucursal = '" + req.body.NombreSucursal + "', IdMuni_s = '" + req.body.IdMuni_s + "' WHERE IdSucursal = " + req.body.IdSucursal + ";", function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Actualizada la sucursal");

        res.redirect('/sucursales/listarSucur');
    })
});

// ELIMINAR SUCUR [GET]
app.get('/clientes/eliminar/:RutPer', function(req, res) {
    let rutPersona = req.params.RutPer;
    connection.query('DELETE FROM Persona WHERE RutPer = ' + rutPersona, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado el cliente");
        res.redirect('/clientes/listarClientes/byList');
    })
})

// ENROLADOS ////////////////////////////////////////////////////////////////
// AGREGAR ENROLADO [GET]
app.get('/enrolados/agregarEnrolado', async function (req, res) {
    connection.query("SELECT * FROM MUNICIPIO; SELECT * FROM PERSONA;", function(error, respuesta, fields) {  
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Clientes enrolados:", respuesta);

        data = {

            municipios: respuesta[0],

        }

        res.render('enrolados/agregarEnrolado.hbs', { data });
    })
});

app.post('/enrolados/agregarEnrolado', function (req,res){
    connection.query(`insert into ENROLADO (FechaEnrolamiento, RutPer_e, IdMuni_e) values (curdate(), '${req.body.RutPer_e}',  '${req.body.IdMuni_e}');`, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Respuesta: ", respuesta);
        console.log("Cliente enrolado.");
        res.redirect('/enrolados/listarEnrolados/byDateDesc');
    })
});

// LISTAR ENROLADOS
app.get('/enrolados/listarEnrolados/:sort', async function (req, res) {

    let fechaActual = new Date();
    console.log(fechaActual.toUTCString());

    let consulta = "";
    if (req.params.sort == "byDateDesc") {
        consulta = "SELECT * FROM ENROLADO ORDER BY FechaEnrolamiento DESC";
    }
    else if (req.params.sort == "byDateAsc") {
        consulta = "SELECT * FROM ENROLADO ORDER BY FechaEnrolamiento ASC";
    }
    connection.query(consulta, function(error, enrolados, fields) {  
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        enrolados.forEach((e) => {

            e.FechaEnrolamientoBonita = e.FechaEnrolamiento.getDate() + "-" + (e.FechaEnrolamiento.getMonth() + 1) + "-" + e.FechaEnrolamiento.getFullYear();
            e.FechaEnrolamiento = e.FechaEnrolamiento.getFullYear() + "-" + (e.FechaEnrolamiento.getMonth() + 1) + "-" + e.FechaEnrolamiento.getDate();
            console.log("e.fechaEnrolado = ", e.FechaEnrolamiento);
            console.log("e.FechaEnrolamientoBonita = ", e.FechaEnrolamientoBonita);
            
            let rutClienteString = e.RutPer_e.toString();
            rutClienteString = rutClienteString.substring(0, (rutClienteString.length-1)) + "-" + rutClienteString[rutClienteString.length - 1];
            e.RutPer_e_Bonito = rutClienteString;

        })

        res.render('enrolados/listarEnrolados.hbs', { enrolados });

    })
});

app.post('/enrolados/listarEnrolados', function (req, res) {
    connection.query('SELECT * FROM ENROLADO WHERE RutPer_e = ' + req.body.rut, function(error, enrolados, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        enrolados.forEach((e) => {
            e.FechaEnrolamientoBonita = e.FechaEnrolamiento.getDate() + "-" + (e.FechaEnrolamiento.getMonth() + 1) + "-" + e.FechaEnrolamiento.getFullYear();
            e.FechaEnrolamiento = e.FechaEnrolamiento.getFullYear() + "-" + (e.FechaEnrolamiento.getMonth() + 1) + "-" + e.FechaEnrolamiento.getDate();
            console.log("e.FechaEnrolamiento = ", e.FechaEnrolamiento);
            console.log("e.FechaEnrolamientoBonita = ", e.FechaEnrolamientoBonita);

            let rutClienteString = e.RutPer_e.toString();
            rutClienteString = rutClienteString.substring(0, (rutClienteString.length-1)) + "-" + rutClienteString[rutClienteString.length - 1];
            e.RutPer_e_Bonito = rutClienteString;

        })
        res.render('enrolados/listarEnrolados.hbs', { enrolados });
    })
});

// ELIMINAR ENROLADO [GET]
app.get('/enrolados/eliminar/:FechaEnrolamiento/:RutPer_e/:IdMuni_e', function(req, res) {
    connection.query('DELETE FROM ENROLADO WHERE RutPer_e = "' + req.params.RutPer_e + '" AND IdMuni_e = ' + req.params.IdMuni_e + ' AND FechaEnrolamiento = "' + req.params.FechaEnrolamiento + '"', function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminado el enrolamiento");
        res.redirect('/enrolados/listarEnrolados/byDateDesc');
    })
})

// EDITAR ENROLADOS [GET]
app.get('/enrolados/editar/:RutPer_e', function(req, res) {
    connection.query('SELECT * FROM ENROLADO WHERE RutPer_e = ' + req.params.RutPer_e + '; SELECT * FROM MUNICIPIO;', function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("respuesta[0] =", respuesta[0]);
        res.render('enrolados/actualizarEnrolado.hbs', { enrolado: respuesta[0][0], municipios: respuesta[1] });
    })
})

// ACTUALIZAR ENROLADOS [POST]
app.post('/enrolados/editar', function (req, res) {
    connection.query("UPDATE ENROLADO SET NombreMunic = '" + req.body.NombreMunic + "' WHERE RutPer_e = " + req.body.RutPer_e + ";", function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Cliente Actualizado");
        res.redirect('/enrolados/actualizarEnrolados');
    })
});



// RECETAS ////////////////////////////////////////////////////////////////
// AGREGAR RECETA [GET]
app.get('/recetas/agregarReceta', async function (req, res) {
    connection.query("SELECT * FROM MEDICAMENTO", function(error, medicamentos, fields) {  
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Medicamentos encontrados:", medicamentos);
        res.render('recetas/agregarReceta.hbs', { medicamentos });
    })
});

// AGREGAR RECETA [POST]
app.post('/recetas/agregarReceta', function (req, res) {
    connection.query(`insert into RECETA (NumSerie, RutMed_r, RutPer_r, IdMed_r) values ('${req.body.NumSerie}', '${req.body.RutMed_r}',  '${req.body.RutPer_r}',  '${req.body.IdMed_r}');` , function(error, respuesta, fields) {
        if (error) { 
            console.log("FALLO:", error); 
            //res.redirect("/error");

            console.log(Object.keys(error));

            if (error.code == "ER_NO_REFERENCED_ROW_2") {

                if (error.sqlMessage.includes("RutPer")) {
                    var errorMsg = "Se referenció un cliente que no existe";
                    console.log(errorMsg);
                }
                else if (error.sqlMessage.includes("RutMed")) {
                    var errorMsg = "Se referenció un médico que no existe";
                    console.log(errorMsg);
                }
                res.redirect("/errorDetalle/" + errorMsg);
            }
            return false;
        };
        console.log("RESP:", respuesta);
        console.log("Agregada la receta");
        res.redirect('/recetas/listarRecetas');
    })
});


// LISTAR RECETA [GET]
app.get('/recetas/listarRecetas', function(req, res) {
    connection.query('SELECT * FROM Receta', function(error, recetas, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Recetas encontrados: ", recetas);
        res.render('recetas/listarRecetas.hbs', { recetas });
    })
});

// EDITAR RECETAS [GET]
app.get('/recetas/editar/:NumSerie', function(req, res) {
    connection.query('SELECT * FROM RECETA WHERE NumSerie = ' + req.params.NumSerie + '; SELECT * FROM MEDICAMENTO;', function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("respuesta[0] =", respuesta[0]);
        res.render('recetas/actualizarReceta.hbs', { receta: respuesta[0][0], medicamentos: respuesta[1] });
    })
})

// ACTUALIZAR RECETAS [POST]
app.post('/recetas/editar', function (req, res) {
    connection.query("UPDATE RECETA SET RutMed_r = " + req.body.RutMed_r + ", RutPer_r = " + req.body.RutPer_r + ", IdMed_r = " + req.body.IdMed_r + " WHERE NumSerie = " + req.body.NumSerie + ";", function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Receta actualizada");
        res.redirect('/recetas/listarRecetas');
    })
});

// ELIMINAR RECETA [GET]
app.get('/recetas/eliminar/:NumSerie', function(req, res) {
    connection.query('DELETE FROM RECETA WHERE NumSerie = ' + req.params.NumSerie, function(error, respuesta, fields) {
        if (error) { console.log("FALLO:", error); res.redirect("/errorDetalle/" + error.sqlMessage); return false; };
        console.log("Eliminada la receta");
        res.redirect('/recetas/listarRecetas');
    })
})