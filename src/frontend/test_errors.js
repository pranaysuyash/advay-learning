const http = require('http');

console.log("Listening for backend request spam on port 8000 (we'll proxy to 8001 to see them)");
// We can just watch the backend logs instead, or use a simple curl script.
