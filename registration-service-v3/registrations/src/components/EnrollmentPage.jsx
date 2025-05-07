import React, { useEffect, useState } from 'react';

export default function EnrollmentPage() {
    const [registrations, setRegistrations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    // Fetch data from the API
    useEffect(() => {
        fetch('http://localhost:8080/query', {
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
                setRegistrations(data.data.registrations);
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    // Filter registrations based on the search term and status filter
    const filteredRegistrations = registrations.filter((registration) => {
        const matchesSearch = registration.courseID.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? registration.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredRegistrations.slice(indexOfFirstRow, indexOfLastRow);

    const totalPages = Math.ceil(filteredRegistrations.length / rowsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Handle the "Drop" button click
    const handleDropCourse = (courseID) => {
        if (window.confirm('Are you sure you want to drop this course?')) {
            fetch('http://localhost:8080/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        mutation {
                            dropCourse(studentID: "12345", courseID: "${courseID}") {
                                id
                                courseID
                                status
                            }
                        }
                    `,
                }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to drop course');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Mutation response:', data); // Log the response
                    if (!data.data || !data.data.dropCourse) {
                        throw new Error('DropCourse mutation failed or returned null');
                    }
                    // Update the registrations list after dropping the course
                    setRegistrations((prev) =>
                        prev.map((registration) =>
                            registration.courseID === courseID
                                ? { ...registration, status: data.data.dropCourse.status }
                                : registration
                        )
                    );
                })
                .catch((error) => console.error('Error dropping course:', error));
        }
    };

    return (
        <div className="container mt-4 text-center">
            <h1>Enrollment Details</h1>
            <div className="d-flex justify-content-center mb-3">
                <input
                    type="text"
                    placeholder="Search by Course ID"
                    className="form-control me-2"
                    style={{ maxWidth: '300px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="form-select"
                    style={{ maxWidth: '200px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                    <option value="failed">Failed</option>
                </select>
            </div>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Course ID</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRows.map((registration, index) => (
                        <tr key={index}>
                            <td>{registration.courseID}</td>
                            <td>{registration.status}</td>
                            <td>
                                {registration.status === 'enrolled' ? (
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDropCourse(registration.courseID)}
                                    >
                                        Drop
                                    </button>
                                ) : (
                                    <button className="btn btn-info">View</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="d-flex justify-content-center">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-secondary'} mx-1`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}