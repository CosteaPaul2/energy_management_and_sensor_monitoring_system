import { Table, Group, Text, ActionIcon, Anchor, rem, Button, TextInput, Modal, Select } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext';
import { DeviceWithId } from '../interfaces/DeviceWithId';
import { CITY_URL, DEVICE_URL } from '../data/urls';

interface DeviceTableProps {
  element: JSX.Element;
}

const DeviceTable: React.FC<DeviceTableProps> = () => {
  const [devices, setDevices] = useState<DeviceWithId[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newDeviceName, setNewDeviceName] = useState<string>('');                                                             
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [userDeviceId, setUserDeviceID] = useState(null);
  const [refresh, setRefresh] = useState<boolean>(false);

  const { user } = useAuth();

  const fetchDevices = async () => {
    if (!user || !user.id) {
        console.error("User or user ID is not defined.");
        return;
    }

    try {
        const token = Cookies.get('jwtToken');
        if (!token) {
            console.error("JWT token is missing.");
            return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        let fetchedUserDeviceId = userDeviceId;
        if (!fetchedUserDeviceId && user?.username && !user.roles?.includes('ADMIN')) {
            console.log('Fetching device ID for user');
            fetchedUserDeviceId = await fetchDeviceUserId(user.username);
        }

        const url = user.roles?.includes('ADMIN')
            ? `${DEVICE_URL}/device`
            : `${DEVICE_URL}/device/user/${fetchedUserDeviceId}`;

        console.log("Fetching devices from URL:", url);
        const response = await axios.get(url, config);
        setDevices(response.data);
    } catch (error) {
        console.error('Error fetching devices:', error);
    } finally {
        setIsLoading(false);
    }
};

const fetchDeviceUserId = async (username : String) => {
    try {
        const token = Cookies.get('jwtToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${DEVICE_URL}/device/user/username/${username}`, config);
        console.log("Fetched user device ID:", response.data);
        setUserDeviceID(response.data); 
        return response.data;
    } catch (error) {
        console.error("Error fetching device user ID:", error);
        throw error;
    }
};



  const fetchUsers = async () => {
    try {
      const token = Cookies.get('jwtToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${CITY_URL}/person`, config);
      setUsers(response.data.map((user: { id: string; username: string }) => ({
        value: user.id,
        label: user.username,
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const addDevice = async () => {
    if (!newDeviceName || !user || !user.id) return; 
    try {
        const token = Cookies.get('jwtToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const newDevice = { name: newDeviceName };
        const response = await axios.post(`${DEVICE_URL}/device/createDevice`, newDevice, config);
    
        const createdDevice = response.data;
        setRefresh(true);
        
        setDevices([...devices, { id: createdDevice.id, name: createdDevice.name, userId: 'None' }]); 
        setNewDeviceName(''); 
        setRefresh(true);
    } catch (error) {
        console.error('Error adding new device:', error);
    }
};


  const deleteDevice = async (id: string) => {
    try {
      const token = Cookies.get('jwtToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if(user?.roles?.includes('ADMIN')){
        await axios.delete(`${DEVICE_URL}/device/${id}`, config);
        setDevices(devices.filter(device => device.id !== id));
        setRefresh(true);
      } else {
        alert('Nu poti da delete la un device!!')
      }
 
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUser || !selectedDevice) return;

    const selectedUsername = users.find(user => user.value === selectedUser)?.label;

    if (!selectedUsername) {
        console.error('Username not found for the selected user ID');
        return;
    }

    try {
        const token = Cookies.get('jwtToken');
        const config = { 
            headers: { Authorization: `Bearer ${token}` },
            params: { deviceId: selectedDevice, userId: selectedUser, username: selectedUsername }
        };
        
        console.log("Assigning Device:", selectedDevice, "to User:", selectedUser, "with Username:", selectedUsername);

        const response = await axios.post(`${CITY_URL}/person/assignDevice`, {}, config);
        
        console.log(response);
        if (response.status === 200) {
            setDevices(devices.map(device => 
                (device.id === selectedDevice ? { ...device, userId: selectedUser } : device)
            ));
            setAssignModalOpen(false);
            setSelectedDevice(null);
            setSelectedUser(null);
            setRefresh(true);
        }
    } catch (error) {
        console.error('Error assigning user to device:', error);
    }
};

const unassignDevice = async (deviceId : String) => {
  try {
      const token = Cookies.get('jwtToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${DEVICE_URL}/device/unassign/${deviceId}`, config);
      setRefresh(true);

  } catch (error) {
      console.error('Error unassigning device:', error);
  }
};


  const openAssignModal = (deviceId: string) => {
    setSelectedDevice(deviceId);
    fetchUsers();
    setAssignModalOpen(true);
  };

  useEffect(() => {
    fetchDevices();
  }, [user, refresh]);

  if (isLoading) {
    return <div>Loading devices...</div>;
  }

  const rows = devices.map((device) => (
    <Table.Tr key={device.id}>
      <Table.Td>
        <Group gap="sm">
          <Text fz="sm" fw={550}>
            {device.name}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Anchor component="button" size="sm">
          {device.id}
        </Anchor>
      </Table.Td>
      <Table.Td>
    {user?.roles?.includes('ADMIN') && (
        !device.userId ? (
            <Button onClick={() => openAssignModal(device.id)}>
                Assign to User
            </Button>
        ) : (
            <Button onClick={() => unassignDevice(device.id)}>
                Unassign User
            </Button>
        )
    )}
</Table.Td>

      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray">
            <IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => deleteDevice(device.id)}>
            <IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Device Name</Table.Th>
              <Table.Th>Device ID</Table.Th>
              <Table.Th>Assign to User</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {user?.roles?.includes('ADMIN') && (
        <Group mt="md">
          <TextInput
            placeholder="Enter new device name"
            value={newDeviceName}
            onChange={(e) => setNewDeviceName(e.target.value)}
          />
          <Button onClick={addDevice}>Add Device</Button>
        </Group>
      )}
      <Modal opened={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Device to User">
        <Select
          label="Select User"
          placeholder="Choose a user"
          data={users}
          value={selectedUser}
          onChange={setSelectedUser}
        />
        <Button mt="sm" onClick={handleAssignUser}>
          Assign
        </Button>
      </Modal>
    </>
  );
};

export default DeviceTable;
