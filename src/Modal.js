"use client";
import { useState } from "react";
import styles from "./styles/modal.module.css"; // Corrected import
import toast, { Toaster } from "react-hot-toast"; // Import Toaster


export default function Modal({ isOpen, onClose }) {
  if (!isOpen) return null; // Don't render if not open

  const [student, setStudent] = useState({
    name: "",
    email: "",
    country: "",
    age: "",
    phone: "",
    cnic: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();


    const toastOptions = {
      position: "top-right", // Change position (top-right, top-center, bottom-left, etc.)
      autoClose: 3000, // Auto close after 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: "✅", // Add an icon
    };
  
    try {
      const res = await fetch("/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
  
      const text = await res.text(); // Read response as text first
  
      try {
        const data = JSON.parse(text); // Try to parse JSON
        if (res.ok) {
          toast.success("Student added successfully!",toastOptions);
          setStudent({ name: "", email: "", country: "", age: "", phone: "", cnic: "" });
          onClose();
        } else {
          toast.error(`Failed to add student: ${data.message || "Unknown error"}`);
          // alert(`Failed to add student: ${data.message || "Unknown error"}`);
        }
      } catch (jsonError) {
        console.error("Invalid JSON response:", text);
        alert("Server returned an invalid response.");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };
  

  return (
    <div className={styles.overlay}>
      <Toaster /> {/* Ensure Toaster is included in your UI */}
      <div className={styles.modal}>
        <h2 className={styles.heading}>Add New Student</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={student.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={student.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={student.country}
            onChange={handleChange}
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={student.age}
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={student.phone}
            onChange={handleChange}
          />
          <input
            type="text"
            name="cnic"
            placeholder="CNIC No"
            value={student.cnic}
            onChange={handleChange}
          />

          {/* Buttons Row */}
          <div className={styles.buttonRow}>
            <button type="submit" className={styles.submitBtn}>Submit</button>
            <button type="button" className={styles.closeBtn} onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
}
