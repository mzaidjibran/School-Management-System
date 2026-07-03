import fetch from "node-fetch";

async function run() {
  const payload = {
    fullName: "API Test Teacher",
    email: `api_test_${Date.now()}@teacher.com`,
    phone: "03001234567",
    gender: "male",
    dateOfBirth: "1990-01-01",
    employeeId: `EMP-${Date.now()}`,
    joiningDate: "2026-03-01",
    employmentStatus: "Permanent",
    schoolSection: "boys",
    experience: "5",
    subject: "Maths",
    qualification: "MCS"
  };

  const response = await fetch("http://localhost:5000/api/teachers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.argv[2] || ""}` // Pass token as arg if needed
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  console.log("Status:", response.status);
  console.log("Result:", result);
}

run().catch(console.error);
