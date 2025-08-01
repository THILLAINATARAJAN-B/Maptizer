import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const useSessionCleanup = () => {
  const hasCleanedOnMount = useRef(false);

  const cleanSession = async (showToast = true) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      if (showToast) {
        toast.loading('Cleaning session data...', { id: 'session-cleanup' });
      }

      const response = await fetch(`${baseURL}/session/clean`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        if (showToast) {
          toast.success(result.message, { id: 'session-cleanup' });
        }
        console.log('Session cleaned:', result.details);
        return result;
      } else {
        throw new Error(result.error || 'Failed to clean session');
      }

    } catch (error) {
      console.error('Session cleanup error:', error);
      if (showToast) {
        toast.error('Failed to clean session data', { id: 'session-cleanup' });
      }
      return null;
    }
  };

  const getSessionStats = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseURL}/session/stats`);
      const result = await response.json();
      return result.success ? result.stats : null;
    } catch (error) {
      console.error('Session stats error:', error);
      return null;
    }
  };

  // ✅ Clean session when component mounts (new session start)
  useEffect(() => {
    if (!hasCleanedOnMount.current) {
      hasCleanedOnMount.current = true;
      cleanSession(false); // Silent cleanup on mount
    }
  }, []);

  // ✅ Clean session when page is about to unload (session end)
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Trigger cleanup (fire and forget)
      cleanSession(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Final cleanup when component unmounts
      cleanSession(false);
    };
  }, []);

  return {
    cleanSession,
    getSessionStats
  };
};

export default useSessionCleanup;
