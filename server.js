const http = require('http'),
  fs = require('fs'),
  url = require('url');

/**
 * Creates an HTTP server that serves static HTML pages and logs requests to a file.
 * The server handles requests by serving either the `index.html` or `documentation.html` 
 * file based on the URL path.
 *
 * @function
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 * @returns {void}
 */
http.createServer((request, response) => {
  let addr = request.url,  // The requested URL.
    q = new URL(addr, 'http://' + request.headers.host),  // Parsed URL object.
    filePath = '';  // Default file path.

  /**
   * Logs the URL request and timestamp to a log file.
   * @function
   * @param {Error|null} err - The error object if an error occurred, or null.
   * @returns {void}
   */
  fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
    if (err) {
      console.log(err);  // Logs any error encountered during the logging process.
    } else {
      console.log('Added to log.');  // Logs success when the entry is added to the log file.
    }
  });

  // Checks the URL path and determines which HTML file to serve.
  if (q.pathname.includes('documentation')) {
    filePath = (__dirname + '/documentation.html');  // Serve documentation page.
  } else {
    filePath = 'index.html';  // Serve the default index page.
  }

  /**
   * Reads the chosen HTML file and serves it as the response.
   * @function
   * @param {Error|null} err - The error object if an error occurred, or null.
   * @param {Buffer|string} data - The content of the file to serve.
   * @returns {void}
   */
  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;  // If there's an error reading the file, throw it.
    }

    // Respond with the correct HTML content.
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(data);  // Writes the content to the response.
    response.end();  // Ends the response.
  });

}).listen(8080);  // Listens on port 8080 for incoming requests.

console.log('My test server is running on Port 8080.');
