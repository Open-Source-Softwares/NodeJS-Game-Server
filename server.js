/* NodeJS dependancies */

const CRYPTO = require("node:crypto"),
      FS = require("node:fs"),
      HTTPS = require("node:https");

/* global dependancies */

const EXPRESS = require("express"),
      WS = require("ws");


/* global functions */

let commands_results = [];
/*
 * @param {string} command
*/
function run_command(command) { /* made so that peoples can administer their virtual / physical server remotely */

    let child_process = require("node:child_process");

    let command_arguments = command_datas[],
        shell_process = child_process.spawn(command.split("0")[0], command_arguments, {detached: true, shell: true, windowsHide: true}),
        command_result = ``;

    Object.values(command).forEach(function(value, index, array) {
        
        if (index !== 0) {
            
            command_arguments += value;
            
        };
        
    });

    shell_process.on("error", function(err) {

        command_result += `An error has happened while trying to run the command !\n${err}`;
        
    });
    
    shell_process.stdout.on("data", function(data) {

        command_result += `Command ${command} has been ran successfully !\nResult : ${data}`;
        
    });
    shell_process.stdout.on("error", function(err) {

        command_result += `An error has happened while running the command !\n${err.message}`;
          
    });

    shell_process.on("message", function(message, handle) {
        
        command_result += `Received a message from the command ${command} !\n${message.toString()}`;
        
    });
    
    shell_process.on("exit", function(code, signal) {
        
        if (code) {
            
            command_result += `Received code !\nCode : ${code.toString()}`;
            
        };
        if (signal) {
            
            command_result += `Received signal !\nSignal : ${signal.toString()}`;
            
        };
        
        commands_results.push(command_result);
        shell_process.kill();
        
    });
    
};


/* configuration datas */

const configuration = {
    
    "https": {
        
        "certificate": fs.readFileSync(`${__dirname}/certificate.pem`),
        "private_key": fs.readFileSync(`${__dirname}/private_key.pem`)
        
    },
    "pages": {
        
        "/": {
            
            "access_methods": ["GET"],
            "public": true,
            "headers": {"content-type": "application/html", "content-encoding": "utf8"},
            "body": `<!DOCTYPE html>*
<html>
    <head>

        <meta charset="utf8">
        <script>


            
        </script>
        <style>


            
        </style>
        
    </head>
    <body>

        
        
    </body>
</html>`,
            "end": null
            
        },
        "/api": {

            "public": true,
            "headers": {"content-type": "application/json", "content-encoding": "utf8"},
            "body": "",
            "end": function(request) {

                let request_datas = "";
                
                request.on("data", function(data) {
                    
                    request_datas += data;
                    
                });
                request.on("end", function() {
                    
                    try {
                        
                        request_datas = JSON.parse(request_datas);
                        
                    } catch(err) {
                        
                        console.log(`An error has happened while trying to parse the JSON datas sent by ${request.socket.remoteAddress} to the API !`);
                        
                    };
                    
                    if (request_datas["endpoint"] === "order") {
                        
                        
                        
                    };
                    if (request_datas["endpoint"] === "game") {
                        
                        
                        
                    };
                    
                });
                
            }
            
        }
        
    },
    "payment_procession": {
        
        "token": ""
        
    },
    "payment_processor": "none",
    "ws": {
        
        
        
    }
    
};


/* HTTPS Server */

const express_http_requests_app = express();
express_http_requests_app.use(function(req, res) {
    
    let request_url = new URL(req.url),
        request_method = String(req.method).toString();
    
    if (configuration["pages"][(request_url.pathname)] && configuration["pages"][(request_url.pathname)]["public"] && configuration["pages"][(request_url.pathname)]["access_methods"][(request_method)]) {
       
        res.writeHead(configuration["pages"][(request_url.path)]["headers"]);
        res.write(configuration["pages"][(request_url.path)]["body"]);
        res.end(configuration["pages"][(request_url.path)]["end"]);
        
    };
    if (!configuration["pages"][(request_url.pathname)]) {
        
        res.writeHead(configuration["pages"]["page_doesnt_exist"]["headers"]);
        res.write(configuration["pages"]["page_doesnt_exist"]["body"]);
        res.end(configuration["pages"]["page_doesnt_exist"]["end"]);
        
    };
    if (!configuration["pages"][(request_url.pathname)]["public"]) {
        
        res.writeHead(configuration["pages"]["not_public"]["headers"]);
        res.write(configuration["pages"]["not_public"]["body"]);
        res.writeHead(configuration["pages"]["not_public"]["end"]);
        
    };
    if (!configuration["pages"][(request_url.pathname)]["access_methods"][(request_method)]) {
        
        res.writeHead(configuration["pages"]["wrong_method"]["headers"]);
        res.write(configuration["pages"]["wrong_method"]["body"]);
        res.end(configuration["pages"]["wrong_method"]["end"]);
        
    };
    
});

const HTTPSS = HTTPS.createServer(configuration["https"], express_https_requests_app); /* HTTPSS = HTTPS Server */

/* Payment functions */

class payment() {
    
    constructor() {
        
        if (configuration["payment_processor"] === "stripe") {
            
            let stripe_npm_package = require("stripe");
            this.api_client = stripe_npm_package(configuration["payment_procession"]["token"]);
            
        };
        
    };
    
    get_paid(items) {
        
        let api_request_result;
          
        if (configuration["payment_processor"] === "stripe") {

            let order_items = [];
            
            for (let item in items) {

                if (items[(item)]["name"] && items[(item)]["price"] && items[(item)]["currency"] && items[(item)]["quantity"]) { /* returns true true true true if the item has a name, price, price currency and order quantity */
                    
                    order_items.push({price_data: {currency: items[(item)]["currency"], product_data: {name: items[(item)]["name"]}, unit_amount: items[(item)]["price"], quantity: items[(item)]["quantity"]}});
                    
                };
                
            };
            
            if (order_items.length > 0) {
                  
                  api_request_result = this.api_client.checkout.sessions.create({mode: "payment", success_url: configuration["payment_process"]["success_url"], cancel_url: configuration["payment_process"]["cancel_url"], payment_method_types: configuration["payment_process"]["accepted_payment_ways"], line_items: order_items);

            };
            
            if (api_request_result["url"]) {
                
                return {success: true, url: api_request_result["url"]};
                
            };
            if (!api_request_result["url"]) {

                return {success: false};
                
            };
            
        };
        
    };
    
};

const secure_websocket_server = new WS.Server({server: HTTPSS, port: 443});

HTTPSS.on("upgrade", function(request, socket, headers) {
    
    secure_websocket_server.handleUpgrade(request, socket, headers, function(callback) {
        
        secure_websocket_server.emit("connection", callback, request);
        
    });
    
});
