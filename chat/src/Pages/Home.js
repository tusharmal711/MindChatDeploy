import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";


const Home = () => {
    return (
        <div className="home-container">
          <motion.img 
            src="./Images/app.png" 
            alt="MindChat Logo" 
            className="home-logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
          <motion.h1 
            className="home-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome to MindChat
          </motion.h1>
          <motion.p 
            className="home-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Connect with your friends and chat seamlessly with MindChat, your secure and fast messaging app.
          </motion.p>
          <motion.div 
            className="home-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <Link to="/login">
              <button className="login-button">Login</button>
            </Link>
            <Link to="/signup">
              <button className="signup-button">Signup</button>
            </Link>
          </motion.div>
        </div>
      );
    };

export default Home;