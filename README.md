# 🚀 Speed Test Website

A modern, lightweight website for testing internet connection speed including download speed, upload speed, ping, and jitter.

![Speed Test Demo](https://speedtestpro.vercel.app/favicon.png)

## ✨ Features

- **Clean, Intuitive UI**: Easy-to-read gauges and metrics
- **Comprehensive Testing**: Measures download speed, upload speed, ping, and jitter
- **Responsive Design**: Works on desktop and mobile devices
- **Result History**: Save and compare previous test results
- **Server Selection**: Choose from multiple test servers for more accurate results
- **Lightweight**: Minimal impact on the connection being tested

## 🛠️ Technologies Used

- HTML5, CSS3, JavaScript
- WebRTC for network diagnostics
- Canvas for real-time graphical representation
- LocalStorage for saving test history
- Geolocation API for server selection

## 📋 Requirements

- Modern web browser with JavaScript enabled
- Active internet connection

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/devrohanshah/speedtest.git
   ```

2. Navigate to the project directory:
   ```bash
   cd speedtest
   ```

3. Open `index.html` in your browser or set up a local server:
   ```bash
   # Using Python's built-in HTTP server
   python -m http.server 5000
   ```

4. Access the website at `http://localhost:5000`

### Using the Hosted Version

You can also access the hosted version of this tool at: [https://speedtestokla.vercel.app](https://speedtestokla.vercel.app)

## 📊 How It Works

1. **Server Selection**: The app automatically selects the closest server or allows manual selection
2. **Ping Test**: Measures the response time between your device and the server
3. **Download Test**: Measures how quickly data can be downloaded from the server
4. **Upload Test**: Measures how quickly data can be uploaded to the server
5. **Results**: All metrics are displayed with an option to save history

## 📝 How to Use

1. Open the website in your browser
2. Click on "Start Test" button
3. Wait for all tests to complete
4. View your results
5. Optionally save or share your results

## ⚙️ Configuration

You can modify `config.js` to adjust the following settings:

- Test duration
- Data packet sizes
- Server endpoints
- UI preferences

## 📱 Mobile Support

The interface automatically adapts to smaller screens with:
- Touch-friendly controls
- Simplified UI on smaller devices
- Portrait and landscape orientations supported

## 🔄 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Project Link: [https://github.com/devrohanshah/speedtest](https://github.com/devrohanshah/speedtest)

## 🙏 Acknowledgements

- [WebRTC Project](https://webrtc.org/)
- [LibreSpeed](https://librespeed.org/) - Open Source Speedtest
- [Network.js](https://networkjs.org/) - Network testing library
