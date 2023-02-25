const util = require('util');
const Http = require('azure-iot-device-http').Http;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;

// Replace this with your IoT Hub connection string
const connectionString = 'HostName=wsiothub.azure-devices.net;DeviceId=MyPi;SharedAccessKey=V91BWiTxsaAsxItFxK3ge5ITcI+OFBwyIv81HdW9YVo=';

// Create a client
const client = Client.fromConnectionString(connectionString, Http);

// Connect to the IoT Hub
client.open((err) => {
  if (err) {
    console.error(`Could not connect: ${err.message}`);
  } else {
    console.log('Client connected to IoT Hub');

    // Create a function to handle incoming messages
    const onMessage = (message) => {
        // Parse the message payload to get the temperature value
        const temperature = JSON.parse(message.getData()).body.temperature;
        // Update the temperature display element with the new value
        document.getElementById('temperature-display').innerHTML = `${temperature}°F`;
      };
      

    // Register the message callback
    client.on('message', onMessage);

    // Subscribe to the temperature telemetry topic
    client.subscribe('temperature');

    // Create a function to handle the water pump status
    const updateWaterPumpStatus = (status) => {
        document.getElementById('water-pump-status').innerHTML = `pump is: ${status}`;
      };
      

    // Send a command to the device to get the initial water pump status
    client.sendEvent({ command: 'getStatus' }, (err) => {
      if (err) {
        console.error(`Error sending command: ${err.message}`);
      } else {
        console.log('Command sent: getStatus');
      }
    });
  }
});

// Add event listeners for the water pump buttons
document.getElementById('water-pump-on').addEventListener('click', () => {
  client.sendEvent({ command: 'on' }, (err) => {
    if (err) {
      console.error(`Error sending command: ${err.message}`);
    } else {
      console.log('Command sent: on');
      updateWaterPumpStatus('on');
    }
  });
});

document.getElementById('water-pump-off').addEventListener('click', () => {
  client.sendEvent({ command: 'off' }, (err) => {
    if (err) {
      console.error(`Error sending command: ${err.message}`);
    } else {
      console.log('Command sent: off');
      updateWaterPumpStatus('off');
    }
  });
});
