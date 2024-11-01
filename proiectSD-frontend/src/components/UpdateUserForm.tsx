import React from 'react';
import { TextInput, Button, Group, Stack, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { UserDetails } from '../interfaces/UserDetails';

interface UpdateUserFormProps {
  user: UserDetails;
  onUpdate: (updatedUser: UserDetails) => void; 
  onCancel: () => void;
}

const UpdateUserForm: React.FC<UpdateUserFormProps> = ({ user, onUpdate, onCancel }) => {
  const form = useForm({
    initialValues: {
      name: user.name,
      username: user.username,
      address: user.address,
      age: user.age,
      password: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    onUpdate({ ...user, ...values });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label="Name" {...form.getInputProps('name')} withAsterisk />
        <TextInput label="Username" {...form.getInputProps('username')} withAsterisk />
        <TextInput label="Address" {...form.getInputProps('address')} withAsterisk />
        <NumberInput label="Age" {...form.getInputProps('age')} withAsterisk min={0} />
        <TextInput label="New Password" {...form.getInputProps('password')} withAsterisk type="password" />

        <Group mt="md">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Update</Button>
        </Group>
      </Stack>
    </form>
  );
};

export default UpdateUserForm;
