"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [student, setStudent] = useState({
    name: "",
    email: "",
    country: "",
    age: "",
    phone: "",
    cnic: "",
    password: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response = await fetch("http://172.29.0.1:3000/api/student");
        let data = await response.json();
        if (data.success) setStudents(data.students);
        else console.error("Failed to fetch students:", data.error);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        alert("Student added successfully!");
        setStudent({ name: "", email: "", country: "", age: "", phone: "", cnic: "", password: "" });
      } else {
        alert(`Failed to add student: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      

      {/* Content */}
      <main className="flex-1 bg-gray-50 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Students ({students.length})
          </h1>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-success">
            + Add Student
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-auto">
            <table className="table table-striped table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Country</th>
                  <th>Age</th>
                  <th>Phone</th>
                  <th>CNIC</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((item) => (
                    <tr key={item._id}>
                      <td>{item._id}</td>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.country}</td>
                      <td>{item.age}</td>
                      <td>{item.phone}</td>
                      <td>{item.cnic}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">No data found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      <Modal
        size="lg"
        centered
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
      >
        <Modal.Header closeButton style={{ backgroundColor: "#007bff", color: "#fff" }}>
          <Modal.Title>Add New Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {["name", "email", "password", "country", "age", "phone", "cnic"].map((field) => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label className="text-capitalize">{field}</Form.Label>
                <Form.Control
                  type={field === "age" ? "number" : field === "password" ? "password" : "text"}
                  name={field}
                  value={student[field]}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            ))}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
