fetch('http://localhost:5000/api/trips/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    destination: "Mumbai",
    budget: 5000,
    duration: 2,
    travelers: 2,
    interests: ["culture", "food"],
    travelStyle: "leisure",
    description: "A cultural and food exploration trip to Mumbai"
  })
})
.then(response => {
  console.log('Status:', response.status);
  return response.text();
})
.then(data => {
  console.log('Response:', data);
})
.catch(error => {
  console.error('Error:', error);
});

// Keep the script running
setTimeout(() => {}, 10000);