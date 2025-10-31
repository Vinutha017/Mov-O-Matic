const http = require('http');

const data = JSON.stringify({
  destination: "Mumbai",
  budget: 5000,
  duration: 2,
  travelers: 2,
  interests: ["culture", "food"],
  travelStyle: "leisure",
  description: "A cultural trip to Mumbai"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/trips/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers:`, res.headers);

  res.on('data', (d) => {
    console.log('Response:', d.toString());
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();