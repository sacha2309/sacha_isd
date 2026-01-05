// client/src/components/LogoutButton.js
import React from 'react';

// useNavigate is a React Router hook that allows navigation 
// between pages without reloading or refreshing the browser
import { useNavigate } from 'react-router-dom';
// hook is a special function that lets a component “use” React features.

// useAuth is a custom React hook that gives a component access to the app’s authentication system.
// useAuth = a function that lets any component know who is logged in and allows login/logout
import { useAuth } from '../contexts/UserContext'; 

// Define the LogoutButton functional component
const LogoutButton = () => {

    // “From everything that useAuth() gives me, I only want logout.”
    const { logout } = useAuth();

    // Get the navigate function so this component can send the user to another page
const navigate = useNavigate();

    // This function runs when the user clicks the Logout button
    const handleLogout = () => {

        // 🔑 Call the global logout function
        // This removes the user's login session from the app
        logout(); 

        // After logging out, redirect the user to the login page
        navigate('/login'); 
    };

    // JSX returned by the component (what appears on the screen)
    return (
        // A simple button that triggers handleLogout when clicked
        <button 
            onClick={handleLogout} 
            style={{ marginLeft: '10px' }} // Inline styling to add spacing
        >
            Logout
        </button>
    );
};

// The LogoutButton is a React component that shows a Logout button on the screen.
//  When clicked, it uses the global logout function from useAuth() to log the user out of the app.
//  After logging out, it uses useNavigate() to redirect the user to the login page without reloading the browser. 
//  Essentially, this component combines React User Interface (JSX) java script xml, 
// authentication logic, and page navigation into one reusable button.
// Export the component so it can be used in other files
export default LogoutButton;
