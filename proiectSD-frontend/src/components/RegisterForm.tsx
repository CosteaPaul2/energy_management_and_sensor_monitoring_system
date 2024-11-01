import {
  TextInput,
  PasswordInput,
  NumberInput,
  Paper,
  Title,
  Container,
  Button,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function RegisterForm() {
  const auth = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      username: '',
      name: '',
      address: '',
      age: 18,
      password: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      console.log("Form values being submitted:", values);
      await auth.signUp(values.username, values.name, values.address, values.age, values.password);
      navigate('/login')
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Create an Account</Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            {...form.getInputProps('username')}
          />
          <TextInput
            label="Full Name"
            placeholder="Your full name"
            required
            {...form.getInputProps('name')}
            mt="md"
          />
          <TextInput
            label="Address"
            placeholder="Your address"
            required
            {...form.getInputProps('address')}
            mt="md"
          />
          <NumberInput
            label="Age"
            placeholder="Your age"
            required
            value={form.values.age} 
            onChange={(value) => form.setFieldValue('age', value ? Number(value) : 0)}
            min={18}
            mt="md"
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            {...form.getInputProps('password')}
            mt="md"
          />
          <Group  mt="lg"></Group>
          <Button fullWidth mt="xl" type="submit">
            Register
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
