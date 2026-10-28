import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import AuthProvider from '../../src/Context/AuthProvider';
import PrivateRoute from '../../src/Context/PrivateRoute';
import FocusStudyMood from '../../src/Components/FocusStudyMood/FocusStudyMood';
createRoot(document.getElementById('root')).render(<React.StrictMode><AuthProvider><MemoryRouter initialEntries={['/focus-study-mood']}><PrivateRoute><FocusStudyMood /></PrivateRoute></MemoryRouter></AuthProvider></React.StrictMode>);
