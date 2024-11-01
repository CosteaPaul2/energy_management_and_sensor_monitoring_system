import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    element: JSX.Element;
    requiredRole?: 'ADMIN' | 'USER';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requiredRole }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>; 
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (requiredRole && !user.roles?.includes(requiredRole)) {
        return <div>You do not have permission to view this page.</div>;
    }

    return element;
};

export default ProtectedRoute;
