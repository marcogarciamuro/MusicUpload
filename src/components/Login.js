import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { logIn } = useAuth();
  const navigate = useNavigate();


  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await logIn(email, password)
      navigate('/')
      console.log('You are logged in')
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
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
            <input type="email" className="form-control" onChange={(e) => setEmail(e.target.value)} id="exampleInputEmail1" aria-describedby="emailHelp" />
          </div>
          <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
            <input type="password" className="form-control" onChange={(e) => setPassword(e.target.value)} id="exampleInputPassword1" />
          </div>
          <button className="btn btn-primary w-100">Login</button>
        </form>
      </main>
    </div>
  );
}
