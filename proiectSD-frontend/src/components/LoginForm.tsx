import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const auth = useAuth(); 
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm({
      initialValues: {
          username: '',
          password: '',
      },
  });

  const handleSubmit = async (values: typeof form.values) => {
      try {
          await auth.signIn(values.username, values.password);
          navigate("/");
      } catch (err) {
          setError('Invalid username or password'); 
      }
  };

  return (
      <Container size={420} my={40}>
          <Title ta="center">Welcome back!</Title>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
              <form onSubmit={form.onSubmit(handleSubmit)}> {}
                  <TextInput
                      label="Username"
                      placeholder="Your username"
                      required
                      {...form.getInputProps('username')} 
                  />
                  <PasswordInput
                      label="Password"
                      placeholder="Your password"
                      required
                      mt="md"
                      {...form.getInputProps('password')} 
                  />
                  {error && <Text color="red" mt="md">{error}</Text>} {}

                  <Group justify="space-between" mt="lg">
                      <Button fullWidth mt="xl" type="submit">
                          Sign in
                      </Button>
                  </Group>
              </form>
          </Paper>
      </Container>
  );
}
