//Base de esto robado del codigo sabana de practicas, reutilizando el seteo del server sencillo
//solo para poder simplificar el armado del html de la factura y no morir de infeliz en el proceso

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
        const output = await invoicer(input);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    }
	
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