/* NodeJS dependancies */

const CRYPTO = require("node:crypto"),
      FS = require("node:fs"),
      HTTPS = require("node:https");

/* global dependancies */

const EXPRESS = require("express"),
      WS = require("ws");


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
            "headers": {"content-type": "application/html"},
            "body": "",
            "end": ""
            
        }
        
    },
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