import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import paymentClient from '../apollo/apolloClient-Payment';
import '../css/FullCoursePage.css';
import { Modal, Button } from 'react-bootstrap';

const GET_COURSE_BY_ID = gql`
  query GetCourseById($courseId: ID!) {
    course(courseId: $courseId) {
      id
      name
      price
      duration
      description
      status
      difficulty
      instructor
      createdAt
      updatedAt
    }
  }
`;

const GET_CART = gql`
  query GetCart($studentId: String!) {
    getCart(studentId: $studentId) {
      courseId
    }
  }
`;

const GET_PAYMENT_HISTORY = gql`
  query GetPaymentHistory($studentId: String!) {
    listPaymentHistory(studentId: $studentId) {
      courseId
    }
  }
`;

export default function FullCoursePage() {
  const studentId = localStorage.getItem('studentId') || '';
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_COURSE_BY_ID, {
    variables: { courseId: id },
    fetchPolicy: 'network-only',
  });
  const { data: paymentHistoryData } = useQuery(GET_PAYMENT_HISTORY, {
    client: paymentClient,
    variables: { studentId },
    skip: !studentId,
    fetchPolicy: 'network-only',
  });
  const [modal, setModal] = useState({ show: false, message: '', title: '' });
  const [inCart, setInCart] = useState(false);
  const isPaid = paymentHistoryData?.listPaymentHistory?.some(
    item => String(item.courseId).replace(/^COURSE-/, '') === String(id)
  );

  // Manual check for cart status
  const checkInCart = async (studentId, courseId) => {
    try {
      const { data } = await paymentClient.query({
        query: GET_CART,
        variables: { studentId },
        fetchPolicy: 'network-only',
      });
      let found = false;
      let paid = false;
      data.getCart.forEach(item => {
        const normalizedCourseId = String(item.courseId).replace(/^COURSE-/, '');
        if (normalizedCourseId === String(courseId)) {
          found = true;
          if (item.status === "paid") paid = true;
          console.log(item.status);
        }
      });
      setInCart(found);
    } catch (err) {
      setInCart(false);
    }
  };

  // Check cart status on mount and when id changes
  useEffect(() => {
    if (!studentId) return;
    checkInCart(studentId, id);
    // eslint-disable-next-line
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const response = await fetch("http://localhost:8082/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: studentId,
          courseId: data.course.id,
          courseName: data.course.name,
          price: data.course.price,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      setModal({ show: true, message: "Added to cart!", title: "Success" });

      // Wait a moment before re-checking cart status
      setTimeout(() => checkInCart(studentId, id), 500);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setModal({ show: true, message: "Something went wrong", title: "Error" });
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      const response = await fetch("http://localhost:8082/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: studentId,
          courseId: data.course.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from cart");
      }

      setModal({ show: true, message: "Removed from cart!", title: "Success" });

      // Wait a moment before re-checking cart status
      setTimeout(() => checkInCart(studentId, id), 500);
    } catch (err) {
      console.error("Error removing from cart:", err);
      setModal({ show: true, message: "Something went wrong", title: "Error" });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const course = data.course;

  return (
    <div className="course-page">
      <div className="course-details">
        <div className="fix-alignment">
          <h2>Course Details</h2>
          <button
            className="btn primary-btn"
            id="atc_btn"
            onClick={inCart && !isPaid ? handleRemoveFromCart : handleAddToCart}
            disabled={isPaid}
          >
            {isPaid
              ? "Already Paid"
              : inCart
                ? "Remove from Cart"
                : "Add to Cart"}
          </button>
        </div>
        <ul>
          <li><strong>Duration:</strong> {course.duration}</li>
          <li><strong>Difficulty:</strong> {course.difficulty}</li>
          <li><strong>Status:</strong> {course.status}</li>
          <li><strong>Instructor:</strong> {course.instructor}</li>
          <li><strong>Price:</strong> ₱{course.price}</li>
        </ul>
      </div>

      <div className="course-description">
        <h2>Course Description</h2>
        <p>{course.description}</p>
      </div>

      <div className="course-materials">
        <h2>Course Materials</h2>
        <ul>
          <li>Key concepts and skills related to {course.name}</li>
          <li>Practical applications of the course material</li>
          <li>Insights from industry experts</li>
        </ul>
      </div>
      <Modal
        show={modal.show}
        onHide={() => setModal({ ...modal, show: false })}
        // centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{modal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{modal.message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setModal({ ...modal, show: false })}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
