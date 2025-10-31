// Test API endpoint
const testData = {
  destination: "Mumbai",
  budget: 5000,
  duration: 2,
  travelers: 2,
  interests: ["culture", "food"],
  travelStyle: "leisure",
  description: "A cultural and food exploration trip to Mumbai"
};

fetch('http://localhost:5000/api/trips/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Success:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error);
});