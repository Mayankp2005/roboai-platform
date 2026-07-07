import { useState, useRef, useCallback } from 'react';
import type { ToastType } from '../components/Toast';

// Standard Nordic UART Service UUIDs
const BLE_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const BLE_RX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // RX from ESP32 perspective (Platform writes here)
const BLE_TX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // TX from ESP32 perspective (Platform reads from here)

export function useBluetooth(
  addToast: (message: string, type: ToastType) => void,
  setSerialLogs: React.Dispatch<React.SetStateAction<string[]>>
) {
  const [isBleConnected, setIsBleConnected] = useState(false);
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const serverRef = useRef<BluetoothRemoteGATTServer | null>(null);
  const rxCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const txCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const isBleConnectedRef = useRef(false);

  const handleDisconnect = useCallback(() => {
    if (deviceRef.current && deviceRef.current.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    deviceRef.current = null;
    serverRef.current = null;
    rxCharacteristicRef.current = null;
    txCharacteristicRef.current = null;
    isBleConnectedRef.current = false;
    setIsBleConnected(false);
    setSerialLogs(prev => [...prev, "[SYS] Bluetooth Device Disconnected."]);
    addToast("Bluetooth Disconnected", "info");
  }, [addToast, setSerialLogs]);

  const onDisconnected = useCallback(() => {
    if (isBleConnectedRef.current) {
      handleDisconnect();
    }
  }, [handleDisconnect]);

  const handleCharacteristicValueChanged = useCallback((event: Event) => {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    if (value) {
      const decoder = new TextDecoder('utf-8');
      const incoming = decoder.decode(value).trim();
      if (incoming) {
        setSerialLogs(prev => {
          const newLogs = [...prev, `> ${incoming}`];
          return newLogs.slice(-50);
        });
      }
    }
  }, [setSerialLogs]);

  const handleConnectBluetooth = useCallback(async () => {
    if (isBleConnected) {
      handleDisconnect();
      return;
    }

    try {
      const nav: any = navigator;
      if (!nav.bluetooth) {
        addToast("Web Bluetooth API not supported in this browser. Please use Chrome or Edge.", "error");
        return;
      }

      setSerialLogs(prev => [...prev, '[SYS] Requesting Bluetooth Device... Make sure your ESP32 is powered on and running BLE firmware.']);
      
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: [BLE_SERVICE_UUID] }],
        optionalServices: [BLE_SERVICE_UUID]
      });

      device.addEventListener('gattserverdisconnected', onDisconnected);
      deviceRef.current = device;

      setSerialLogs(prev => [...prev, `[SYS] Connecting to GATT Server on ${device.name || 'ESP32'}...`]);
      const server = await device.gatt!.connect();
      serverRef.current = server;

      setSerialLogs(prev => [...prev, '[SYS] Getting UART Service...']);
      const service = await server.getPrimaryService(BLE_SERVICE_UUID);

      setSerialLogs(prev => [...prev, '[SYS] Getting Characteristics...']);
      // The platform WRITES to the ESP32's RX characteristic
      const rxCharacteristic = await service.getCharacteristic(BLE_RX_UUID);
      rxCharacteristicRef.current = rxCharacteristic;

      // The platform READS/NOTIFIES from the ESP32's TX characteristic
      const txCharacteristic = await service.getCharacteristic(BLE_TX_UUID);
      txCharacteristicRef.current = txCharacteristic;

      await txCharacteristic.startNotifications();
      txCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

      isBleConnectedRef.current = true;
      setIsBleConnected(true);
      
      setSerialLogs(prev => [...prev, `[SYS] ✅ Connected via Bluetooth to ${device.name || 'RoboAI Core'}.`]);
      addToast(`Connected to ${device.name || 'Device'} via BLE`, "success");

    } catch (err: any) {
      console.error('Error connecting to Bluetooth', err);
      let userMessage = '';
      let logMessage = '';

      if (err.name === 'NotFoundError') {
        userMessage = 'Bluetooth connection cancelled or device not found.';
        logMessage = '[ERROR] Bluetooth selection cancelled.';
      } else if (err.name === 'NotSupportedError') {
        userMessage = 'Web Bluetooth is not supported on this browser/OS.';
        logMessage = `[ERROR] ${err.message}`;
      } else {
        userMessage = `Bluetooth error: ${err.message}`;
        logMessage = `[ERROR] ${err.message}`;
      }

      setSerialLogs(prev => [...prev, logMessage]);
      addToast(userMessage, "error");
      handleDisconnect();
    }
  }, [isBleConnected, addToast, setSerialLogs, handleDisconnect, onDisconnected, handleCharacteristicValueChanged]);

  const writeBluetooth = useCallback(async (dataStr: string) => {
    if (!isBleConnectedRef.current || !rxCharacteristicRef.current) return;
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(dataStr);
      await rxCharacteristicRef.current.writeValue(data);
    } catch (err) {
      console.error("Bluetooth write error", err);
    }
  }, []);

  return {
    isBleConnected,
    isBleConnectedRef,
    handleConnectBluetooth,
    writeBluetooth,
    handleDisconnect,
  };
}
