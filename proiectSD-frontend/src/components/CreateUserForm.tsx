import { useState } from 'react';
import { Button, TextInput, Group } from '@mantine/core';
import { UserDetails } from '../interfaces/UserDetails';
import { useAuth } from '../context/AuthContext';

interface CreateUserFormProps {
  onCreate: (newUser: UserDetails) => void;
  onCancel: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onCancel }) => {
  const [username, setUsername] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [password, setPassword] = useState<string>(''); 
  const auth = useAuth();

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
  

  try {
    const newUser = {
      username,
      name,
      age: Number(age),
      address,
      password
    }

    await auth.signUp(newUser.username, newUser.name, newUser.address, newUser.age, newUser.password);

    console.log('User created successfully');
  } catch (error) {
    console.log('Failed to create user', error);
  }
};



  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        label="Username"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
        required
      />
      <TextInput
        label="Name"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        required
      />
      <TextInput
        label="Age"
        placeholder="Enter age"
        type="number"
        value={age}
        onChange={(e) => setAge(e.currentTarget.value)}
        required
      />
      <TextInput
        label="Address" 
        placeholder="Enter address"
        value={address}
        onChange={(e) => setAddress(e.currentTarget.value)}
      />
      <TextInput
        label="Password" 
        placeholder="Enter password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        required
      />
      <Group mt="md">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" color="green">
          Create User
        </Button>
      </Group>
    </form>
  );
};

export default CreateUserForm;
