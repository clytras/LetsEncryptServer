// Dependencies
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');

// domain
const domain = 'my-domain.com';
const acmeChallengeDir = __dirname+'/acme-challenge';

// http app used for acme challenge, redirecting everything else to https
const challengeApp = express();
// serve files for acme challenge
challengeApp.use(express.static(acmeChallengeDir, { dotfiles: 'allow' } ));
// redirecting everything else to https
challengeApp.use(function (req, res) {		
    //~ res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });		// permanent redirection => will update search engines
    res.writeHead(302, { "Location": "https://" + domain + req.url });		// temporary redirection for tests
    res.end();
});
// create the http server
const httpServer = http.createServer(challengeApp);
httpServer.listen(80, () => {
				console.log('HTTP Server running on port 80 :');
				console.log('   serving acme-challenge files and redirecting everything to https');
			}
		);


// Certificate for https
let certificate=null;
try {
	certificate = {
				key: fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`, 'utf8'),
				cert: fs.readFileSync(`/etc/letsencrypt/live/${domain}/cert.pem`, 'utf8'),
				ca: fs.readFileSync(`/etc/letsencrypt/live/${domain}/chain.pem`, 'utf8')
			};
}
catch(err) {
	certificate=null;
	console.log('cannot read certificate files (normal at first launch)');
	//~ console.log(err);
}


// now do your stuff with https app
const app = express();
app.use(express.static(__dirname+'/static'));	// here, just serve what is in static

// starting https server
if(certificate===null)
	console.log('cannot start httpsServer without certificate');
else {
	const httpsServer = https.createServer(certificate, app);
	httpsServer.listen(443, () => {
		console.log('HTTPS Server running on port 443');
	});
}
