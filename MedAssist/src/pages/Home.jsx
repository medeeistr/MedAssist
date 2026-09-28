import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div>
      <main className="hero">
        <h1>Bine ați venit!</h1>
        <p>Intrați în cont pentru a începe.</p>

         <button onClick={() => navigate('/login')}>
          Log in
        </button>
      </main>
    </div>
  )
}

export default Home