// Minimal list of Indian cities exported as a TS module to avoid runtime fetch problems.
export const indianCities = [
  { name: "Mumbai", state: "Maharashtra" },
  { name: "New Delhi", state: "Delhi" },
  { name: "Bengaluru", state: "Karnataka" },
  { name: "Hyderabad", state: "Telangana" },
  { name: "Chennai", state: "Tamil Nadu" },
  { name: "Kolkata", state: "West Bengal" },
  { name: "Pune", state: "Maharashtra" },
  { name: "Ahmedabad", state: "Gujarat" },
  { name: "Jaipur", state: "Rajasthan" },
  { name: "Surat", state: "Gujarat" },
  { name: "Lucknow", state: "Uttar Pradesh" },
  { name: "Kanpur", state: "Uttar Pradesh" },
  { name: "Nagpur", state: "Maharashtra" },
  { name: "Indore", state: "Madhya Pradesh" },
  { name: "Thane", state: "Maharashtra" },
  { name: "Bhopal", state: "Madhya Pradesh" },
  { name: "Visakhapatnam", state: "Andhra Pradesh" },
  { name: "Patna", state: "Bihar" },
  { name: "Vadodara", state: "Gujarat" },
  { name: "Ghaziabad", state: "Uttar Pradesh" }
];

export type City = typeof indianCities[number];
