import { useState } from "react";
import { DeviceDetails } from "../interfaces/DeviceWithId";
import { Button, Group, TextInput } from "@mantine/core";

interface CreateDeviceFormProps {
    onCreate: (newDevice: Omit<DeviceDetails, "userId">) => void; 
    onCancel: () => void;
  }
  
  const CreateDeviceForm: React.FC<CreateDeviceFormProps> = ({ onCreate, onCancel }) => {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [hourlyConsumption, setHourlyConsumption] = useState<string>('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onCreate({
        name,
        description,
        hourlyConsumption: Number(hourlyConsumption),
      });
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Device Name"
          placeholder="Enter Device Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Device Description"
          placeholder="Enter Device Description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Device Hourly Consumption"
          placeholder="Enter Device Hourly Consumption"
          value={hourlyConsumption}
          onChange={(e) => setHourlyConsumption(e.currentTarget.value)}
          required
        />
        <Group mt="md">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" color="green">
            Create Device
          </Button>
        </Group>
      </form>
    );
  };
  
  export default CreateDeviceForm;
  