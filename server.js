/* NodeJS dependancies */

const CRYPTO = require("node:crypto"),
      FS = require("node:fs"),
      HTTPS = require("node:https"),
      VM = require("node:vm");

/* NPM dependancies */

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
        shell_process = child_process.spawn(command.split(" ")[0], command_arguments, {detached: true, shell: true, windowsHide: true}),
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
        
        shell_process.kill();
        
    });
    
    commands_results.push(command_result);
    
};


/* configuration datas */

class https_server_configuration = {

    constructor() {};

    this.https = {
        
        "certificate": fs.readFileSync(`${__dirname}/certificate.pem`),
        "private_key": fs.readFileSync(`${__dirname}/private_key.pem`)
        
    };
    this.pages = {
        
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
            "end": function(request_data) {

                let request_response = {"error": false, ""};
                
                if (request_data["end_point"] === "game" && request_data["data"]["game_name"]) {
                    
                    
                    
                };
                if (request_data["end_point"] === "game_list") {
                    
                    let games_list = [];
                    
                    for (let game in this.games) {
                        
                        if (this.games[(game)]["public"] === true) {
                            
                            games_list.push({"game_name": game, "game_description": this.games[(game)]["description"], "game_player_count": thi.games[(game)]["player_count"]});
                            
                        };
                        
                    };
                    
                };
                
            }
            
        }
        
    };
    this.payment_procession = {
        
        "token": ""
        
    };
    this.payment_processor = "none";
    this.payment_processors = {

        "skrill": {
            
            "default_headers": {
                
                method: "POST",
                hostname: "www.skrill.com",
                path: "/v1/checkout/sessions",
                port: 443
                
            },
            "default_body": {
                
                
                
            }
            
        },
        "stripe": {
            
            "default_headers": {
                
                method: "POST",
                hostname: "api.stripe.com",
                path: "/app/payment.pl",
                port: 443
                
            },
            "default_body": {
                
                
                
            }
            
        }
        
    };
    this.ws = {
        
        
        
    };
    
};


/* HTTPS Server */

const express_http_requests_app = express();
express_http_requests_app.use(function(req, res) {
    
    let request_url = new URL(req.url),
        request_method = String(req.method).toString();

    let configuration = new https_server_configuration();
    
    if (configuration["pages"][`${request_url.pathname}`] && configuration["pages"][`${request_url.pathname}`]["public"] && configuration["pages"][`${request_url.pathname}`]["access_methods"][`${request_method}`]) {
       
        res.writeHead(configuration["pages"][`${request_url.path}`]["headers"]);
        res.write(configuration["pages"][`${request_url.path}`]["body"]);
        res.end(configuration["pages"][`${request_url.path}`]["end"]);
        
    };
    if (!configuration["pages"][`${request_url.pathname}`]) {
        
        res.writeHead(configuration["pages"]["page_doesnt_exist"]["headers"]);
        res.write(configuration["pages"]["page_doesnt_exist"]["body"]);
        res.end(configuration["pages"]["page_doesnt_exist"]["end"]);
        
    };
    if (configuration["pages"][`${request_url.pathname}`] && !configuration["pages"][`${request_url.pathname}`]["public"]) {
        
        res.writeHead(configuration["pages"]["not_public"]["headers"]);
        res.write(configuration["pages"]["not_public"]["body"]);
        res.writeHead(configuration["pages"]["not_public"]["end"]);
        
    };
    if (configuration["pages"][`${request_url.pathname}`] && configuration["pages"][`${request_url.pathname}`]["public"] &&!configuration["pages"][`${request_url.pathname}`]["access_methods"][`${request_method}`]) {
        
        res.writeHead(configuration["pages"]["wrong_method"]["headers"]);
        res.write(configuration["pages"]["wrong_method"]["body"]);
        res.end(configuration["pages"]["wrong_method"]["end"]);
        
    };
    
});

const HTTPSS = HTTPS.createServer(configuration["https"], express_https_requests_app); /* HTTPSS = HTTPS Server */

/* Payment functions */

class payment {
    
    constructor() {
        
        this.errors = [];
        this.headers = configuration["payment_processors"][(configuration["payment_processor"])]["default_headers"];
        this.body = configuration["payment_processors"][(configuration["payment_processor"])]["default_body"];
        
    };

    /*
     * @param {string[]} items
     * @param {string[]} arguments
    */
    generate_checkout_session(items, arguments) { /* permits to generate the checkout session url and return it to the client */

        if (configuration["payment_processor"] === "skrill") {
            
            for (let argument in arguments) {
                
                if (!this.body[`${argument}`]) { /* if the argument isn't already in the body of the request */
                    
                    this.body[`${argument}`] = arguments[`${argument}`];
                    
                };
                
            };
            
        };
        if (configuration["payment_processor"] === "stripe") {
            
            this.body[mode] = "payment";
            
            for (let argument in arguments) {
                
                if (!this.body[`${argument}`]) {
                    
                    this.body[`${argument}`] = arguments[`${argument}`];
                    
                };
                
            };
            
        };
        
        this.api_client = new HTTPS.request(this.headers, function(response) {

            this.request_response = "";
            
            response.on("error", function(error) {
                
                this.errors.push(`An error has happened when sending the HTTPS request to the Payment Processor API !\n${error}`);
                
            });
            response.on("data", function(data) {
                
                this.request_response += data;
                
            });
            response.on("end", function() {
                
                try {
                    
                    this.parsed_request_response = JSON.parse(this.request_response);
                    
                } catch(error) {
                    
                    this.errors.push(`An error has happened when trying to parse the datas received from the Payment Processor API !\n${error}`);
                    
                };
                
            });
            
        });
        this.api_client.on("error", function(error) {
            
            this.errors.push(`An error has heppened when trying to send the datas to the Payment Processor API !\n${error}`);
            
        });
        this.api_client.write(JSON.parse(this.body));
        
        if (!this.parsed_request_response) {
                
            return {"error": true, "errors": this.errors, "data": this.request_response};
                
        };
        if (this.parsed_request_response) {
                
            return {"error": false, "data": this.parsed_request_response};
                
        };
        
    };
    
};

const secure_websocket_server = new WS.Server({server: HTTPSS, port: 443});

HTTPSS.on("upgrade", function(request, socket, headers) {
    
    secure_websocket_server.handleUpgrade(request, socket, headers, function(callback) {
        
        secure_websocket_server.emit("connection", callback, request);
        
    });
    
});
