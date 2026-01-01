import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { Send, Trash2, Download } from 'lucide-react';
import { scanCOMPorts } from '../lib/api';
import { COMPort, SerialMonitorMessage } from '../types';

interface SerialMonitorProps {
  onClose: () => void;
}

const BAUD_RATES = ['9600', '19200', '38400', '57600', '115200'];

export function SerialMonitor({ onClose }: SerialMonitorProps) {
  const [ports, setPorts] = useState<COMPort[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [baudRate, setBaudRate] = useState<string>('115200');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<SerialMonitorMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPorts();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadPorts = async () => {
    try {
      const availablePorts = await scanCOMPorts();
      setPorts(availablePorts);
      if (availablePorts.length > 0) {
        setSelectedPort(availablePorts[0].path);
      }
    } catch (error) {
      console.error('Failed to load ports:', error);
    }
  };

  const handleConnect = () => {
    if (!selectedPort) return;

    // TODO: Replace with actual WebSocket connection to your backend
    // const ws = await openSerialMonitor(selectedPort, parseInt(baudRate));
    
    setConnected(true);
    addMessage('System', `Connected to ${selectedPort} at ${baudRate} baud`);

    // Mock incoming messages for demonstration
    const mockInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        addMessage('output', `Sensor reading: ${Math.floor(Math.random() * 1000)}`);
      }
    }, 2000);

    return () => clearInterval(mockInterval);
  };

  const handleDisconnect = () => {
    setConnected(false);
    addMessage('System', 'Disconnected');
  };

  const handleSend = () => {
    if (!input.trim() || !connected) return;

    addMessage('input', input);
    // TODO: Send message via WebSocket to device
    setInput('');
  };

  const addMessage = (type: string, message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        message,
        type: type as 'input' | 'output' | 'error',
      },
    ]);
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleExport = () => {
    const text = messages
      .map((m) => `[${m.timestamp}] ${m.type.toUpperCase()}: ${m.message}`)
      .join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial-monitor-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Serial Monitor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          {/* Connection Settings */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-white">Port</Label>
              <Select value={selectedPort} onValueChange={setSelectedPort} disabled={connected}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select port" />
                </SelectTrigger>
                <SelectContent>
                  {ports.map((port) => (
                    <SelectItem key={port.path} value={port.path}>
                      {port.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-white">Baud Rate</Label>
              <Select value={baudRate} onValueChange={setBaudRate} disabled={connected}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BAUD_RATES.map((rate) => (
                    <SelectItem key={rate} value={rate}>
                      {rate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-white">&nbsp;</Label>
              <Button
                onClick={connected ? handleDisconnect : handleConnect}
                variant={connected ? 'destructive' : 'default'}
                className="w-full h-9"
                disabled={!selectedPort}
              >
                {connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </div>

          {/* Messages Display */}
          <div className="flex-1 border rounded-lg bg-gray-900 text-gray-100 p-3 overflow-hidden flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">
                {connected && <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />}
                {connected ? 'Connected' : 'Disconnected'}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClear}
                  className="h-6 px-2 text-gray-400 hover:text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleExport}
                  className="h-6 px-2 text-gray-400 hover:text-white"
                  disabled={messages.length === 0}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto font-mono text-sm space-y-1">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {connected ? 'Waiting for data...' : 'Connect to start monitoring'}
                </p>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${
                      msg.type === 'input'
                        ? 'text-blue-400'
                        : msg.type === 'error'
                        ? 'text-red-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">[{msg.timestamp}]</span> {msg.message}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Type message to send..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={!connected}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!connected || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {!connected && (
            <Alert>
              <AlertDescription className="text-xs">
                Connect to a device to send and receive serial data
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
