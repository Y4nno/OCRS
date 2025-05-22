import '../css/custom.css';
import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyCart() {
    return (
        <table className="table" style={{ marginTop: '20px' }}>
            <thead>
            <tr>
                <th>Course ID</th>
                <th>Course Description</th>
                <th className="text-end">Price</th>
            </tr>
            </thead>
            <tbody>
                <tr>
                    <td colSpan="3" className="text-center">
                        <img src={require('../css/openbook.png')} alt="openbook" width="175px" style={{ marginBottom: '40px', marginTop: '50px' }} />
                        <br />Looks like your cart is empty. <br />
                        <Link to="/courses" style={{ color: '#7B3538', fontWeight: 600, textDecoration: 'none' }}>Enroll here</Link>
                        <br />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}