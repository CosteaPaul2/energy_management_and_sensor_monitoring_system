import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, LoadingOverlay } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { DeviceData } from "../interfaces/DeviceData";
import "@mantine/dates/styles.css";
import { MONITORING_URL } from "../data/urls";
import { BarChart } from "@mantine/charts";
import WebSocketNotifications from "./WebSocketNotifications";

const DeviceDetails: React.FC = () => {
  const location = useLocation();
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const deviceId = location.state?.deviceId;

  if (!deviceId) {
    return <div>Error: No Device ID provided!</div>;
  }

  useEffect(() => {
    const fetchDeviceData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${MONITORING_URL}/device-data/${deviceId}`
        );
        setDeviceData(response.data);
        console.log(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching device data:", err);
        setError("Failed to fetch device data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeviceData();
  }, [deviceId]);

  const filteredData: DeviceData[] = deviceData.filter((entry) => {
    if (!selectedDate) return false;
    const entryDate = dayjs(entry.time);
    return entryDate.isSame(selectedDate, "day");
  });


  const chartData = filteredData.map((entry) => ({
    timestamp: entry.time.split(" ")[1], 
    deviceData: parseFloat(entry.deviceData),
  }));

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (error) {
    return <div>{error}</div>;
  }


  return (
    <div>
      <h1>Device Details</h1>
      <DatePicker allowDeselect value={selectedDate} onChange={setSelectedDate} />

      {filteredData.length > 0 ? (
        <>

          <h2>Data Visualization</h2>
          <BarChart
            h={500}
            data={chartData}
            dataKey="timestamp" 
            series={[{ name: "deviceData", color: "blue" }]}
          />
        </>
      ) : (
        <div>No data available for the selected date.</div>
      )}

      <Button variant="light" onClick={() => window.history.back()}>
        Go Back
      </Button>
        <WebSocketNotifications />
    </div>
  );
};

export default DeviceDetails;
