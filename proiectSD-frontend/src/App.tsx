import './App.css'
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { RegisterForm } from './components/RegisterForm';
import { Route, Routes} from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { UsersTable } from './components/UserTable';
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from './components/ProtectedRoute';
import DeviceTable from './components/DeviceTable'; 
import HomePage from './components/HomePage';
import DeviceDetails from './components/DeviceDetails';
import ChatApp from './components/ChatWebSocket';

function App() {
    return (
        <MantineProvider>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/register" element={<RegisterForm />} />
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/persons" element={<ProtectedRoute element={<UsersTable />} requiredRole="ADMIN" />} />
                        <Route path="/myDevices" element={<ProtectedRoute element={<DeviceTable element={<div />} />} requiredRole="USER" />} />
                        <Route path="/device-details" element={<DeviceDetails />} />
                        <Route path="/chat" element={<ChatApp/>}/>
                    </Routes>
                </AuthProvider>
        </MantineProvider>
    );
}


export default App;
