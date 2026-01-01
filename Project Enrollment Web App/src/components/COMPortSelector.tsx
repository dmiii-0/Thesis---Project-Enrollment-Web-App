import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { Loader2, RefreshCw, Usb } from 'lucide-react';
import { scanCOMPorts, deployToDevice } from '../lib/api';
import { COMPort, Project } from '../types';

interface COMPortSelectorProps {
  project: Project;
  onClose: () => void;
  onDeploySuccess: (message: string) => void;
  onDeployError: (message: string) => void;
}

export function COMPortSelector({ project, onClose, onDeploySuccess, onDeployError }: COMPortSelectorProps) {
  const [ports, setPorts] = useState<COMPort[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    handleScan();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      const availablePorts = await scanCOMPorts();
      setPorts(availablePorts);
      if (availablePorts.length > 0 && !selectedPort) {
        setSelectedPort(availablePorts[0].path);
      }
    } catch (error) {
      console.error('Failed to scan COM ports:', error);
    } finally {
      setScanning(false);
    }
  };

  const handleDeploy = async () => {
    if (!selectedPort) {
      onDeployError('Please select a COM port');
      return;
    }

    setDeploying(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await deployToDevice(project.id, selectedPort, project.deviceType);
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success) {
        onDeploySuccess(result.message);
        setTimeout(onClose, 1500);
      } else {
        onDeployError(result.message);
      }
    } catch (error) {
      clearInterval(progressInterval);
      onDeployError('Deployment failed. Please check your device connection and try again.');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Select COM Port</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Usb className="w-4 h-4" />
            <AlertDescription>
              Connect your {project.deviceType.replace('-', ' ')} device and select the appropriate COM port
            </AlertDescription>
          </Alert>

          {scanning ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" />
              <p className="text-sm text-gray-300">Scanning for devices...</p>
            </div>
          ) : ports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-300 mb-4">No devices found</p>
              <Button variant="outline" onClick={handleScan}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan Again
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Available Ports</Label>
                  <Button variant="ghost" size="sm" onClick={handleScan} disabled={scanning || deploying}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>

                <RadioGroup value={selectedPort} onValueChange={setSelectedPort}>
                  {ports.map((port) => (
                    <div
                      key={port.path}
                      className="flex items-center space-x-2 border border-gray-600 rounded-lg p-3 hover:bg-gray-700"
                    >
                      <RadioGroupItem value={port.path} id={port.path} />
                      <Label htmlFor={port.path} className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium text-white">{port.path}</p>
                          {port.manufacturer && (
                            <p className="text-xs text-gray-400">{port.manufacturer}</p>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {deploying && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Deploying to {selectedPort}...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={deploying} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleDeploy} disabled={!selectedPort || deploying} className="flex-1">
                  {deploying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    'Deploy'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
