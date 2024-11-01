import { Button, Container, Group, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  
  const user = auth.user;

  const handleNavigateToDevices = () => {
    navigate('/myDevices');
  };

  const handleNavigateToPersons = () => {
    navigate('/persons');
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  const renderRoleButtons = () => {
    if (user?.roles?.includes('ADMIN') && user?.roles.includes('USER')) {
      return (
        <Group>
          <Button onClick={handleNavigateToDevices}>Access Devices</Button>
          <Button onClick={handleNavigateToPersons}>Access Persons</Button>
          <Button onClick={auth.logout}>Logout</Button>
        </Group>
      );
    } else if (user?.roles?.includes('ADMIN')) {
      return(
      <Group>
        <Button onClick={handleNavigateToPersons}>Access Persons</Button>
        <Button onClick={auth.logout}> Logout </Button>
      </Group>

    );
    } else if (user?.roles?.includes('USER')) {
      return( 
        <Group>
          <Button onClick={auth.logout}> Logout </Button>
          <Button onClick={handleNavigateToDevices}>Access Devices</Button>
        </Group>
      );
    } else {
      return (
        <Group>
          <Button onClick={handleNavigateToLogin}>Log In</Button>
          <Button onClick={handleNavigateToRegister}>Create an Account</Button>
        </Group>
      );
    }
  };

  return (
    <Container>
      <Title mt={50}>
        HomePage
      </Title>
      <Group mt="lg">
        {renderRoleButtons()}
      </Group>
    </Container>
  );
};

export default HomePage;
