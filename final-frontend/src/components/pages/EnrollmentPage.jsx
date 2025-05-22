import React, { useEffect, useState } from 'react';
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client';
import '../css/custom.css';
import ModalMessage from '../ModalMessage'; // adjust path as needed
import { Modal, Button } from 'react-bootstrap';

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

const COMPLETE_COURSE = gql`
  mutation CompleteCourse($studentID: String!, $courseID: String!) {
    completeCourse(studentID: $studentID, courseID: $courseID) {
      id
      courseID
      status
    }
  }
`;

const REGISTRATION_ADDED = gql`
  subscription RegistrationAdded {
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
  const studentID = localStorage.getItem('studentId') || '';
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [modal, setModal] = useState({ show: false, message: '', title: '' });
  const [showDropModal, setShowDropModal] = useState(false);
  const [pendingDropCourseID, setPendingDropCourseID] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [pendingCompleteCourseID, setPendingCompleteCourseID] = useState(null);

  // --- Apollo Hooks ---
  const { data, loading, error } = useQuery(FETCH_REGISTRATIONS, {
    variables: { studentID },
    fetchPolicy: 'network-only',
  });

  const [dropCourse] = useMutation(DROP_COURSE);
  const [completeCourse] = useMutation(COMPLETE_COURSE);

  const { data: subscriptionData } = useSubscription(REGISTRATION_ADDED);

  useEffect(() => {
    if (subscriptionData && subscriptionData.registrationAdded) {
      setRegistrations(prev => {
        // Replace if exists, otherwise add
        const exists = prev.some(r => r.id === subscriptionData.registrationAdded.id);
        if (exists) {
          return prev.map(r =>
            r.id === subscriptionData.registrationAdded.id
              ? subscriptionData.registrationAdded
              : r
          );
        } else {
          return [...prev, subscriptionData.registrationAdded];
        }
      });
    }
  }, [subscriptionData]);

  // Sync query result into state
  useEffect(() => {
    if (data?.registrationsByStudent) {
      setRegistrations(data.registrationsByStudent);
    }
  }, [data]);

  const handleDropCourse = async () => {
    const courseID = pendingDropCourseID;
    setShowDropModal(false);
    if (!courseID) return;

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
      setModal({ show: true, message: "Course dropped successfully!", title: "Success" });
    } catch (err) {
      setModal({ show: true, message: err.message || 'Failed to drop course.', title: "Error" });
      console.error('Error dropping course:', err);
    } finally {
      setPendingDropCourseID(null);
    }
  };

  const handleMarkAsCompleted = async (courseID) => {
    // if (!window.confirm('Are you sure you want to mark this course as completed?')) return;
    try {
      const response = await completeCourse({
        variables: { studentID, courseID },
      });
      const updated = response.data.completeCourse;
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.courseID === courseID ? { ...reg, status: updated.status } : reg
        )
      );
      setModal({ show: true, message: "Course marked as completed!", title: "Success" });
    } catch (err) {
      setModal({ show: true, message: err.message || 'Failed to complete course.', title: "Error" });
      console.error('Error completing course:', err);
    }
  };

  const handleConfirmComplete = async () => {
    const courseID = pendingCompleteCourseID;
    setShowCompleteModal(false);
    if (!courseID) return;
    await handleMarkAsCompleted(courseID);
    setPendingCompleteCourseID(null);
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
          {/*<option value="pending">Pending</option>*/}
          <option value="enrolled">Enrolled</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Registrations Table */}
      <table className="table">
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
                  <>
                    <button
                      className="btn btn-success me-2"
                      onClick={() => {
                        setPendingCompleteCourseID(registration.courseID);
                        setShowCompleteModal(true);
                      }}
                    >
                      Mark as Completed
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setPendingDropCourseID(registration.courseID);
                        setShowDropModal(true);
                      }}
                    >
                      Drop
                    </button>
                  </>
                ) : (
                  <button
                    className="btn"
                    onClick={() => {
                      const id = registration.courseID.replace(/^COURSE-/, '');
                      window.location.href = `/courses/${id}`;
                    }}
                  >
                    View
                  </button>
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

      <ModalMessage
        show={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        title={modal.title}
        message={modal.message}
      />

      <Modal show={showDropModal} onHide={() => setShowDropModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Drop</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to drop this course?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleDropCourse}>
            Drop
          </Button>
          <Button onClick={() => setShowDropModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Mark as Completed Modal */}
      <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mark as Completed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to mark this course as completed?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleConfirmComplete}>
            Yes, Mark as Completed
          </Button>
          <Button onClick={() => setShowCompleteModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EnrollmentPage;
