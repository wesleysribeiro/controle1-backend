const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const constants = require('./constants.js');
const fs = require('fs');

class SerialPortApi {
	constructor() {
		this.currentData = {
			signal: constants.DEFAULT_SIGNAL,
			samplingFrequency: constants.DEFAULT_FREQUENCY,
			output: constants.DEFAULT_OUTPUT
		}

		this.port = new SerialPort('COM3', {
			baudRate: 9600
		}, (err) => {
			if (err)
			{
				return console.log('Error: ', err.message);
			}
		});

		this.parser = this.port.pipe(new Readline({delimiter: '\n'}));

		this.parser.on('data', (data) => {

			console.log(1, data);
			// Initializing dataset
			if(this.dataset == undefined)
			{
				this.dataset = [];
			}
			else if(this.dataset.length == constants.BUFFER_SIZE)
			{
				this.dataset.shift();
			}

			data = data.trim().replace('\r', '');
			data = data.split(',');

			this.dataset.push({
				x: data[0],
				y: data[1]
			});

			this.appendToFile(data);
		});
	}

	getData() {
		if(this.dataset == undefined)
		{
			return [];
		}
		return this.dataset;
	}

	appendToFile = (data) => {
		fs.open(constants.FILE_PATH, 'a', (err, fd) => {
			if(err)
			{
				console.log('Error while opening file to append');
				throw err;
			}

			fs.appendFile(fd, data + '\n', 'utf8', err => {
				fs.close(fd, err => {
					if (err) throw err;
				});
				if (err) throw err;
			});
		});
	}

	// Escreve os dados na porta especificada do microcontrolador
	// data: {
	//		signal: signal,
	//		samplingFrequency: freq,
	//		output: value
	// }
	//
	// Formato(em espacos entre si)
	//    --------------------------------------------------------------
	//    | TIPO de sinal,frequencia de amostragem (Hz),valor (em V)   |
	//    --------------------------------------------------------------

	//  TIPO de sinal:
	//   (0) -> Degrau
	//   (1) -> Rampa crescente
	//   (2) -> Rampa descrescente

	// Frequencia de amostragem:
	//   constants.FREQUENCIES[2] -> Maxima
	//   constants.FREQUENCIES[1] -> Media
	//   constants.FREQUENCIES[0] -> Mínima

	writeData = (data) => {
		let {signal, samplingFrequency, output} = data;

		// Keep track of the current submitted data
		// and update the data with current values
		// if not provided

		// TODO: Refactor this
		if(signal != undefined)
		{
			this.currentData.signal = signal;
		}
		else
		{
			signal = this.currentData.signal;
		}
		if(samplingFrequency != undefined)
		{
			this.currentData.samplingFrequency = samplingFrequency;
		}
		else
		{
			samplingFrequency = this.currentData.samplingFrequency;
		}
		if(output != undefined)
		{
			this.currentData.output = output;
		}
		else
		{
			output = this.currentData.output;
		}

		data = `${signal},${samplingFrequency},${output}\n`;

		this.port.write(data, (err) => {
			if(err)
			{
				console.log('An error has ocurred when sending data');
			}
		});
	}
}

module.exports = SerialPortApi;