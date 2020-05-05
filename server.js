const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const serialPortApi = require('./SerialPortApi.js');
const constants = require('./constants.js');

const serial = new serialPortApi();

app.use(cors());
app.use(bodyParser.json());

app.get('/exportCsv', function (req, res) {
  res.download(constants.FILE_PATH, 'output.csv');
});

app.get('/data', (req, res) => {
	res.json(serial.getData());
});

app.post('/samplingFrequency', (req, res) => {
	serial.writeData({
		samplingFrequency: constants.FREQUENCIES[req.body.value]
	});
	res.sendStatus(202);
});

app.post('/outputSignal', (req, res) => {
	const {inputValue, signal} = req.body;
	serial.writeData({
		signal,
		output: inputValue
	});
	res.sendStatus(202);
});

app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
});