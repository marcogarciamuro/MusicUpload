import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { createUser } = useAuth();
  const navigate = useNavigate();


  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await createUser(email, password);
      navigate('/')
    } catch (e) {
      setError(e.message)
      console.log(e.message)
    }
  }
  return (
    <div className="row d-flex flex-grow-1 align-items-center justify-content-center"
      style={{ minheight: "100vh" }}>
      <main
        className="w-100 col-12"
        style={{ maxWidth: "400px" }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
            <input type="email" className="form-control" onChange={(e) => setEmail(e.target.value)} id="exampleInputEmail1" aria-describedby="emailHelp" />
          </div>
          <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
            <input type="password" className="form-control" onChange={(e) => setPassword(e.target.value)} id="exampleInputPassword1" />
          </div>
          <button className="btn btn-primary w-100">Sign Up</button>
        </form>
        <div className="pt-3">Already registered? <Link to='/login'>Log In</Link></div>
      </main>
    </div>
  );
}
