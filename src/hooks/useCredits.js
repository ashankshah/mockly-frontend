import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useCredits = () => {
  const { token } = useAuth();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCredits();
    }
  }, [token]);

  const fetchCredits = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/credits/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits || 0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  };

  return { credits, loading };
};
