import React, { useEffect, useState } from 'react';
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client';
import '../custom.css';

// --- GraphQL ---
const FETCH_REGISTRATIONS = gql`
  query fetchRegistrations($studentID: String!) {
    registrationsByStudent(studentID: $studentID) {
      id
      studentID
      courseID
      status
      enrolledAt
      updatedAt
    }
  }
`;

const DROP_COURSE = gql`
  mutation DropCourse($studentID: String!, $courseID: String!) {
    dropCourse(studentID: $studentID, courseID: $courseID) {
      id
      courseID
      status
    }
  }
`;

const REGISTRATION_ADDED = gql`
  subscription onRegistrationAdded {
    registrationAdded {
      id
      studentID
      courseID
      status
      enrolledAt
      updatedAt
    }
  }
`;

const EnrollmentPage = () => {
  const studentID = '12345';
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // --- Apollo Hooks ---
  const { data, loading, error } = useQuery(FETCH_REGISTRATIONS, {
    variables: { studentID },
    fetchPolicy: 'network-only',
  });

  const [dropCourse] = useMutation(DROP_COURSE);

  useSubscription(REGISTRATION_ADDED, {
    onData: ({ data: { data } }) => {
      const newReg = data.registrationAdded;
      // Only add if it belongs to the same student and isn't already in the list
      if (newReg.studentID === studentID && !registrations.some(r => r.id === newReg.id)) {
        setRegistrations(prev => [...prev, newReg]);
      }
    },
  });

  // Sync query result into state
  useEffect(() => {
    if (data?.registrationsByStudent) {
      setRegistrations(data.registrationsByStudent);
    }
  }, [data]);

  const handleDropCourse = async (courseID) => {
    if (!window.confirm('Are you sure you want to drop this course?')) return;

    try {
      const response = await dropCourse({
        variables: { studentID, courseID },
      });

      const updated = response.data.dropCourse;

      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.courseID === courseID ? { ...reg, status: updated.status } : reg
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to drop course.');
      console.error('Error dropping course:', err);
    }
  };

  // Filtering and Pagination
  const filteredRegistrations = registrations.filter((registration) => {
    const matchesSearch = registration.courseID
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? registration.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRegistrations.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRegistrations.length / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (error) return <p className="text-danger text-center mt-5">Error loading data.</p>;

  return (
    <div className="container mt-4 text-center">
      <h1>Enrollment Details</h1>

      {/* Filter/Search Controls */}
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

      {/* Registrations Table */}
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
              <td>{registration.status.toUpperCase()}</td>
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

      {/* Pagination */}
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
};

export default EnrollmentPage;
