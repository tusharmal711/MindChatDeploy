// ScrollContext.js
import { createContext, useState, useContext } from 'react';

const ScrollContext = createContext();

export const ScrollProvider = ({ children }) => {
  const [showNavbar, setShowNavbar] = useState(true);

  return (
    <ScrollContext.Provider value={{ showNavbar, setShowNavbar }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScrollContext = () => useContext(ScrollContext);
