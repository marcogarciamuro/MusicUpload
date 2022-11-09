import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
      console.log('You are logged out')
      console.log(user)
    } catch(e) {
      console.log(e.message)
    }

  }
  return (
    <div>
      <div>Home</div>
      {user && <p>{user.email}</p>}
      {user && <button onClick={handleLogout} className="btn-btn-primary">Logout</button>}
    </div>
  )
}

export default Home