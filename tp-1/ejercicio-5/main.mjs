//Base de esto robado del codigo sabana de practicas, reutilizando el seteo del server sencillo
//solo para poder simplificar el armado del html de la factura y no morir de infeliz en el proceso

/*
                    this.datos = document.createElement(p);
                    this.datos.textContent = '\n ${datitos}';
                    this.appendChild(this.datos);

*/

import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';


function default_config() 
{
    const config = 
    {
        server: 
        {
            ip: '127.0.0.1',
            port: 5000,
            default_path: 'ejercicio-5.html'
        },
    };

    return config;
}

let config = default_config();


//handlers
function default_handler(request, response)
{
	try 
	{
        const html = readFileSync(config.server.default_path, 'utf-8');
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html);
    } 
    catch (error) 
    {
        response.writeHead(500);
        response.end('Error interno: No se pudo cargar la vista principal.');
    }
}

async function invoice_handler(request, response)
{
    if ( request.method == "POST")
    {
        const body = await new Promise((resolve, reject) => {
            let data = '';
            request.on('data', chunk => {
                data += chunk;
            });
            request.on('end', () => {
                resolve(data);
            });
            request.on('error', reject);
        });

        const input = Object.fromEntries(new URLSearchParams(body));

        console.log(input);
        /*{
        "periodostart": "01/05/2026",
        "periodofin": "17/05/2026",
        "cuit": "30522763922",
        "apellidoynombre": "INSSJP",
        "condicionIVA": "IVA Sujeto Exento",
        "domicilio": "Peru 169 - Capital Federal, CABA",
        "condicionventa": "Cuenta Corriente",
        "products": "[{\"producto\":\"haha\",\"cantidad\":\"5\",\"unidad\":\"m\",\"precio\":\"100\",\"bonificacion\":\"10\",\"subtotal\":450}]"
        }*/

        const output = await invoicer(input);

        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(output);
    }
	
}

async function invoicer(input)
{
    const periodostart    = input.periodostart;
    const periodofin      = input.periodofin;
    const cuit            = input.cuit;
    const apellidoynombre = input.apellidoynombre;
    const condicionIVA    = input.condicionIVA;
    const domicilio       = input.domicilio;
    const condicionventa  = input.condicionventa;

    const products = JSON.parse(input.products);

    const datitos = `
        \nRazon Social: Sopita SCS
        \n \n Domicilio Comercial: Av. Siempre Viva 1234
        \n \n Condición: IVA Resposable Inscripto 
        \n \n CUIT: 27-12345678-4
        \n \n Ingresos Brutos: 
        \n \nFecha de inicio de Actividades: 01/01/1980
        \n \n Punto de Venta: 0002 
        \nComp Nro: 00000641`

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><title>Factura</title></head>
        <body></body>
        <script>
            class Factura extends HTMLElement 
            {
                constructor() 
                {
                    super();

                    this.titulo = document.createElement('h1');
                    this.titulo.textContent = 'Factura  B';

                    this.razon = document.createElement('p');
                    this.razon.textContent = "Razon Social: Sopita SCS";
                    this.domicilio = document.createElement('p');
                    this.domicilio.textContent = "Domicilio Comercial: Av. Siempre Viva 1234";
                    this.condicion = document.createElement('p');
                    this.condicion.textContent = "Condicion frente al IVA: IVA Resposable Inscripto";
                    this.cuit = document.createElement('p');
                    this.cuit.textContent = "CUIT: 27-12345678-4";
                    this.ingbrutos = document.createElement('p');
                    this.ingbrutos.textContent = "Ingresos Brutos: ";
                    this.inicioact = document.createElement('p');
                    this.inicioact.textContent = "";
                    this.puntoventa = document.createElement('p');
                    this.puntoventa.textContent = "Fecha de inicio de Actividades: 01/01/1980";
                    this.compnro = document.createElement('p');
                    this.compnro.textContent = "Comp Nro: 00000641";

                    this.periodo = document.createElement('p');
                    this.periodo.textContent = 'Periodo: ${periodostart} hasta ${periodofin}';

                    this.cuitp = document.createElement('p');
                    this.cuitp.textContent = 'CUIT: ${cuit}';

                    this.apyno = document.createElement('p');
                    this.apyno.textContent = 'Apellido y Nombre / Razón Social: ${apellidoynombre}';

                    this.iva = document.createElement('p');
                    this.iva.textContent = 'Condición IVA: ${condicionIVA}';

                    this.domiciliop = document.createElement('p');
                    this.domiciliop.textContent = 'Domicilio: ${domicilio}';

                    this.venta = document.createElement('p');
                    this.venta.textContent = 'Condición de venta: ${condicionventa}';

                    this.tabla = document.createElement('table');
                    this.tabla.border = '1';

                    const thead = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    ['Producto','Cantidad','Unidad','Precio Unit.','% Bonif.','Subtotal'].forEach(col => {
                        const th = document.createElement('th');
                        th.textContent = col;
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);

                    const tbody = document.createElement('tbody');
                    this.sumatotal = 0;
                    const products = ${JSON.stringify(products)};
                    products.forEach(item => {
                        this.sumatotal += item.subtotal;
                        const tr = document.createElement('tr');
                        [item.producto, item.cantidad, item.unidad, item.precio, item.bonificacion, item.subtotal].forEach(val => {
                            const td = document.createElement('td');
                            td.textContent = val;
                            tr.appendChild(td);

                        });
                        tbody.appendChild(tr);
                    });

                    this.totalfactura = document.createElement('h3');
                    this.totalfactura.textContent = 'Total Factura: $' + this.sumatotal;

                    this.tabla.appendChild(thead);
                    this.tabla.appendChild(tbody);

                    this.appendChild(this.titulo);
                    this.appendChild(this.razon);
                    this.appendChild(this.domicilio);
                    this.appendChild(this.condicion);
                    this.appendChild(this.cuit);
                    this.appendChild(this.ingbrutos);
                    this.appendChild(this.inicioact);
                    this.appendChild(this.puntoventa);
                    this.appendChild(this.compnro);
                    this.appendChild(this.periodo);
                    this.appendChild(this.cuitp);
                    this.appendChild(this.apyno);
                    this.appendChild(this.iva);
                    this.appendChild(this.domiciliop);
                    this.appendChild(this.venta);
                    this.appendChild(this.tabla);
                    this.appendChild(this.totalfactura);
                }
            }

            customElements.define('x-factura', Factura);

            function main()
            {
                let miFactura = new Factura;
                document.body.appendChild(miFactura);
            }

            window.onload = main;
        <\/script>
        </html>
    `;
    return html;
}

//router
let router = new Map();

router.set('/', default_handler)
router.set('/invoice', invoice_handler)

//Despachador principal
async function request_dispatcher(request, response)
{
	const url = new URL(request.url, 'http://' + config.server.ip);
    const path = url.pathname;

    const handler = router.get(path);

    if (handler)
    {
        return await handler(request, response);
    }
    else
    {
        response.writeHead(404);
        response.end('Método no encontrado');
    }
}

function start()
{
	console.log('Servidor ejecutándose...');
}

let server = createServer(request_dispatcher);

server.listen(config.server.port, config.server.ip, start);