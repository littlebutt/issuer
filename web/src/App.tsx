import React, { useState } from 'react';

import type { User } from './types'
import './app.css'

const App = () => {
  const [currentUser, setCurrentUser] = useState<User|null>(null)


  return (
    <div className="app">

    </div>
  );
}

export default App;
