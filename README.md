# 🚀 FastTrack Delivery Dashboard

A modern, high-performance dashboard for managing delivery fleets, tracking drivers in real-time, and analyzing logistics performance. Built with **React**, **Vite**, and **Mapbox GL JS**, featuring a stunning **Glassmorphism** UI.

just to precise this is not a production ready app, it is just a proof of concept but it could work with the addition of RFID and gps trackers to the delivery vehicles and noting that legaly cannot track independant drivers but it should work on owned trucks,cars... but the idea could be shifted towards keeping driver deliverys 

## ✨ Key Features

- **📊 Interactive Dashboard**: Real-time overview of active drivers, deliveries, and efficiency stats.
- **🗺️ Live Map Tracking**: Real-time driver location tracking with route visualization and custom markers.
- **📈 Advanced Analytics**: Interactive charts with tooltips, time period toggles (Week/Month), and summary metrics.
- **⚙️ Customizable Settings**: Personalize the experience with dynamic accent colors (Red, Blue, Green, Purple) and notification preferences.
- **👤 User Profile**: Editable user profile with local persistence.
- **💬 Driver Chat**: Mock chat interface for communicating with drivers.
- **📥 Data Export**: Export delivery data to CSV for external analysis.
- **🎨 Glassmorphism UI**: A premium, modern dark-themed design with blurred backgrounds and neon accents.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router DOM
- **Styling**: Vanilla CSS (Glassmorphism Design System)
- **Maps**: Mapbox GL JS
- **Real-time**: Socket.io-client
- **Notifications**: React Hot Toast
- **Backend**: Node.js, Express, Socket.io (Mock Server)

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fasttrack-dashboard.git
cd fasttrack-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Backend Server
The backend simulates driver movements and handles API requests.
```bash
node server.js
```
*Server runs on http://localhost:3000*

### 4. Start the Frontend Development Server
Open a new terminal window:
```bash
npm run dev
```
*App runs on http://localhost:5173*

## 🖥️ Usage

1.  **Dashboard**: View the fleet overview. Use the search bar to find specific drivers or sacs.
2.  **Add Driver**: Enter a name or ID (e.g., "Driver X") in the "Add Name/ID" field and click **+ Add**.
3.  **Assign Sac**: Click "Assign" on a driver row to link a Sac ID.
4.  **Live Map**: Navigate to the "Live Map" tab to see drivers moving in real-time. Click a marker to see details.
5.  **Analytics**: Check the "Delivery Volume" chart. Hover over bars for details and toggle between Week/Month views.
6.  **Settings**: Go to Settings to change the accent color or edit your profile.
7.  **Export**: Click "Export CSV" on the dashboard to download your data.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
