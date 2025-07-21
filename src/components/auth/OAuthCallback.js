import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthCallback = () => {
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const accessToken = urlParams.get('access_token');
        const tokenType = urlParams.get('token_type');
        const error = urlParams.get('error');
        
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!accessToken) {
          throw new Error('Access token not found');
        }

        // Set the authentication token
        localStorage.setItem('authToken', accessToken);
        setToken(accessToken);
        
        // Fetch user data
        const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          
          // Redirect to dashboard or home page
          navigate('/');
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [location, navigate, setUser, setToken]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '20px' }}>
          Completing authentication...
        </div>
        <div style={{ 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #3498db', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '18px', color: '#e74c3c', marginBottom: '20px' }}>
          Authentication failed: {error}
        </div>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return null;
};

export default OAuthCallback; 