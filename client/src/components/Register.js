import React, { useState, useEffect } from 'react';
import styles from '../styles/Register.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode

const Register = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    otp: '',
    file: null,
  });

  useEffect(() => {
    // Check if the user exists in localStorage when the component mounts
    const user = localStorage.getItem('user');
    if (user) {
      const decodedToken = jwtDecode(user);

      // Check if the token has expired
      const currentTime = Date.now() / 1000; // Convert to seconds
      console.log(decodedToken.exp, currentTime);
      if (decodedToken.exp < currentTime) {
        // Token has expired, remove it from localStorage
        localStorage.removeItem('user');
        setIsVerified(false); // Ensure isVerified is set to false
      } else {
        // Token is still valid, update formData and isVerified state
        if (decodedToken.isVerified) {
          setFormData({
            ...formData,
            email: decodedToken.email
          });
          setIsVerified(true);
        }
      }
    }
  }, []);

  // This will run only when the component mounts

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const selectedFile = files[0];

      // Generate preview URL
      setPreview(URL.createObjectURL(selectedFile));

      setFormData((prev) => ({
        ...prev,
        file: selectedFile, // Store the actual file
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }


    // setData((prevData) => ({
    //   ...prevData,
    //   name: `${formData.firstName} ${formData.lastName}`, // Combining names
    //   email: formData.email,
    //   mobileNumber: formData.mobileNumber,
    //   profilePhoto: formData.file, // Store file
    // }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log(formData)

    if (isVerified) {
      // User is verified, proceed with registration
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/register`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log(response.data);

        if (response.data) {
          const res = response.data;
          localStorage.setItem('token', res.token);
          localStorage.removeItem('user');
          localStorage.setItem('user', res.user);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (error) {
        console.error('Error registering user:', error);
      }
    } else if (verifying) {
      // Verify OTP step
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/verify-otp`, {
          email: formData.email,
          otp: formData.otp,
        });

        console.log(response.data);

        if (response.data) {
          // Decode the isVerified JWT token
          const decoded = jwtDecode(response.data.user);
          if (decoded.isVerified) {
            setIsVerified(true); // Set isVerified to true if verified
            setVerifying(false);

            // Store the isVerified token in localStorage
            localStorage.setItem('user', response.data.user);
          }
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
      }
    } else {
      // Send OTP step
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/register-email`, {
          email: formData.email,
        });

        console.log(response);

        if (response.data) {
          setVerifying(true); // Set verifying to true after sending OTP
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
      }
    }
  };

  return (
    <div className={`${styles.registerForm} container mt-5`}>
      <div className={`${styles.image}`}>
        <img src="/formImage.jpg" alt="formImage" />
      </div>
      <div className={`${styles.form}`}>
        <form onSubmit={handleRegister}>
          <h2>Create an account</h2>
          <p>
            Already have an account? <Link to={'/login'}>Login</Link>
          </p>

          {isVerified && (
            <>
              <div className={`${styles.fileInput}`}>
                <input type="file" id="file" name="file" onChange={handleChange} />
                <label htmlFor="file">
                  {preview ? (
                    <img src={preview} alt="Profile Preview" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
                  ) : (
                    <img src="/add-image.png" alt="add" />
                  )}
                </label>
                <p>Profile Picture</p>
              </div>
              <div className={`${styles.inputName}`}>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                />
              </div>
              <div className={`${styles.input}`}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />
              </div>
              <div className={`${styles.input}`}>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Mobile Number"
                  required
                />
              </div>
              <div className={`${styles.checkBox}`}>
                <label className={`${styles.customCheckbox}`}>
                  <input type="checkbox" id="terms" />
                  <span className={`${styles.checkMark}`}></span>
                  Accept terms and conditions
                </label>
              </div>
              <div className={`${styles.btn}`}>
                <button type="submit">Create account</button>
              </div>
            </>
          )}

          {!isVerified && (
            <>
              <div className={`${styles.input}`}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />
              </div>
              {verifying && (
                <div className={`${styles.input}`}>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="OTP"
                    required
                  />
                </div>
              )}
              <div className={`${styles.btn}`}>
                <button type="submit">{verifying ? 'Verify Otp' : 'Send Otp'}</button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
