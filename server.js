const httpsLocalhost = require("https-localhost")()
const https = require("https");
const fs = require("fs");
const path = require("path");

(async function() {
    const certs = await httpsLocalhost.getCerts();

    https
        .createServer(certs, initApp)
        .listen(443, () => {
            console.log("Server started on 443");
        });
    
    function initApp(req, res) {
        console.error('initApp');

        const url = new URL(`https://${req.headers.host}${req.url}`);
    
        if (url.pathname === '/stream') {
            SSEController(req, res)
            return;
        }

        if (url.pathname === '/service-worker.js') {
            res.setHeader('Content-Type', 'application/javascript');
            const fileStream = fs.createReadStream(path.join(__dirname, "service-worker.js"));
            fileStream.pipe(res);
            return;
        }

        const fileStream = fs.createReadStream(path.join(__dirname, "index.html"));
        fileStream.pipe(res);
    }

    const getRandomInt = max => Math.floor(Math.random()*max);
    
    let id = 0;

    function SSEController(req, res) {
        console.warn('SSE CONTROLLER START');

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const timerId = setInterval(() => {
            if (id === 10) {
                clearInterval(timerId);
                res.write('event: close\ndata: this is the end\n\n');
                res.end("Ok");
                return;
            }

            const data = getRandomInt(100);
            const eventData = JSON.stringify({
                id,
                message: `!!!MESSAGE FROM SERVER!!! #${data}`,
            });
            
            console.log('SSE: senging message', eventData);
            res.write(`event: message\ndata: ${eventData}\n\n`);
            id++;
        }, 5000);
    }
})()