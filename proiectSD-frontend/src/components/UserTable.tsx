import { Badge, Table, Group, Text, ActionIcon, Anchor, rem, Modal } from '@mantine/core';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserWithId } from '../interfaces/UserWithId'; 
import { UserDetails } from '../interfaces/UserDetails';
import UpdateUserForm from './UpdateUserForm';
import CreateUserForm from './CreateUserForm';
import { DeviceWithId } from '../interfaces/DeviceWithId';
import { CITY_URL, DEVICE_URL } from '../data/urls';

const jobColors: Record<string, string> = {
  admin: 'red',
  user: 'cyan',
};

export function UsersTable() {
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingUser, setEditingUser] = useState<UserDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const fetchUsers = async () => {
    console.log('M-am apelat');
    try {
      const token = Cookies.get('jwtToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`${CITY_URL}/person`, config);
      console.log(response)
      setUsers(response.data); 
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserById = async (id: string) => {
    try {
      const token = Cookies.get('jwtToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`${CITY_URL}/person/${id}`, config);
      setEditingUser(response.data); 
      setEditingUserId(id);
      setIsModalOpen(true); 
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
    }
  };

  useEffect(() => {
    console.log('M-am apelat inca odata')
    fetchUsers();
  }, []);

  if (isLoading) {
    return <div>Loading users...</div>;
  }
  
  const handleCreateUser = async (newUser: UserDetails) => { 
    try { 
      const token = Cookies.get('jwtToken'); 
      const config = { headers: { Authorization: `Bearer ${token}` } }; 
      
      const response = await axios.post(`${CITY_URL}/person`, newUser, config); 
      setUsers([...users, response.data]); 
      setIsCreateModalOpen(false); 
    } catch (error) { 
      console.error('Error creating user:', error); 
    } 
  }; 

  const getUserRole = (roles: string[]): string => {
    if (roles.includes('ADMIN')) return 'admin';
    if (roles.includes('USER')) return 'user';
    return 'UNKNOWN';
  };

  const updateUser = async (updatedUser: UserDetails) => {
    if (!editingUserId) return; 
    try {
      const token = Cookies.get('jwtToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${CITY_URL}/person/${editingUserId}`, updatedUser, config);
  
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUserId
            ? { ...user, ...updatedUser }
            : user
        )
      );
      
      setIsModalOpen(false); 
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };
  

    const deleteUser = async (id: string) => {
      try {
        const token = Cookies.get('jwtToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${CITY_URL}/person/${id}`, config);
        setUsers(users.filter(user => user.id !== id));

        const response = await axios.get(`${DEVICE_URL}/device/user/${id}`, config);
        const devices = response.data as DeviceWithId[];
        console.log(devices);
        devices.forEach( async (device) => {
          await axios.delete(`${DEVICE_URL}/device/${device.id}`, config);
        });

      } catch (error) {
        console.error('Error deleting user:', error);
      }
    };

  const handleEdit = (id: string) => {
    fetchUserById(id); 
  };

  const rows = users.map((user) => {
    const role = getUserRole(user.roles ?? []);
    return (
      <Table.Tr key={user.username}>
        <Table.Td>
          <Group gap="sm">
            <Text fz="sm" fw={550}>
              {user.name}
            </Text>
          </Group>
        </Table.Td>

        <Table.Td>
          <Badge color={jobColors[role] || 'gray'} variant="light">
            {role}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Anchor component="button" size="sm">
            {user.username}
          </Anchor>
        </Table.Td>
        <Table.Td>
          <Group gap={0} justify="flex-end">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => handleEdit(user.id)} 
            >
              <IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => deleteUser(user.id)}
            >
              <IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <>
      <ActionIcon
        variant="subtle"
        color="blue"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <IconPlus style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
      </ActionIcon>
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="lg">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Person</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Username</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update User">
        {editingUser && (
          <UpdateUserForm
            user={editingUser}
            onUpdate={updateUser} 
            onCancel={() => setIsModalOpen(false)}
          />
        )}
      </Modal>

      <Modal opened={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create User"> 
        <CreateUserForm 
          onCreate={handleCreateUser} 
          onCancel={() => setIsCreateModalOpen(false)} 
        /> 
      </Modal> 
    </>
  );
}
