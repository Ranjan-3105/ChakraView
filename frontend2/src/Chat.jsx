import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global variables provided by the environment
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  // TEMPORARY: Hardcoded Firebase configuration to fix the API key error.
  // **REPLACE THESE VALUES with your actual Firebase project config.**
  const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY", // Replace with your apiKey
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Replace with your authDomain
    projectId: "YOUR_PROJECT_ID", // Replace with your projectId
    storageBucket: "YOUR_PROJECT_ID.appspot.com", // Replace with your storageBucket
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your messagingSenderId
    appId: "YOUR_APP_ID" // Replace with your appId
  };

  // This function simulates an API call to your backend to get a custom Firebase token.
  // This is a placeholder and is not used in this version of the code.
  const getCustomTokenFromBackend = async () => {
    const backendEndpoint = 'https://your-backend.com/api/get-firebase-token';
    try {
      const response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch custom token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error getting custom token from backend:", error);
      return null;
    }
  };

  useEffect(() => {
    // Initialize Firebase and Auth
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setDb(firestore);

    // Sign in the user with the provided token or anonymously
    const authenticateUser = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Error signing in:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Set up a listener for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    authenticateUser();
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!db || !userId) return;

    const publicCollectionPath = `/artifacts/${appId}/public/data/messages`;
    const messagesCollection = collection(db, publicCollectionPath);
    const q = query(messagesCollection, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [db, userId, appId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !userId) return;

    try {
      const publicCollectionPath = `/artifacts/${appId}/public/data/messages`;
      await addDoc(collection(db, publicCollectionPath), {
        text: newMessage,
        userId: userId,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const getChatSectionColor = (messageUserId) => {
    return messageUserId === userId ? 'bg-green-500' : 'bg-green-700';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-black text-green-500">Authenticating...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl text-green-500 font-bold">Chat App</h1>
        <div className="text-sm text-green-500">
          User ID: <span className="font-mono">{userId}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 p-2 bg-gray-900 rounded-lg border-2 border-green-500">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`p-2 rounded-lg max-w-xs ${getChatSectionColor(msg.userId)}`}>
              <div className="text-xs font-bold text-gray-200 mb-1">{msg.userId}</div>
              <p>{msg.text}</p>
              {msg.timestamp && (
                <div className="text-right text-xs text-gray-300 mt-1">
                  {new Date(msg.timestamp.toDate()).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 rounded-lg bg-gray-800 text-white border-2 border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Type your message here..."
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatApp;
