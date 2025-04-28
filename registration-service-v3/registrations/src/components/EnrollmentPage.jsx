import React, { useEffect, useState } from 'react';

export default function EnrollmentPage() {
    const [registrations, setRegistrations] = useState([]);

    // Fetch data from the API
    useEffect(() => {
        fetch('http://localhost:8080/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query {
                        registrations {
                            studentID
                            courseID
                            status
                        }
                    }
                `,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then((data) => {
                console.log('API Response:', data); // Log the API response
                setRegistrations(data.data.registrations);
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    return (
        <div className="container mt-4">
            <h1>Enrollment Details</h1>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Course ID</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {registrations.map((registration, index) => (
                        <tr key={index}>
                            <td>{registration.courseID}</td>
                            <td>{registration.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}