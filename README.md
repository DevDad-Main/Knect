# Knect (Frontend)

Knect is a modern social networking platform that enables users to connect, share posts, like & comment, and chat in real-time. This repository contains the **frontend** of the application, built with **React**, **TailwindCSS**, and **Socket.IO** for real-time updates.

---

## ✨ Features

- 🔐 **Authentication** – Secure user login and registration
- 📝 **Posts** – Create, like, and comment(Reply to other users comments as well) on posts
- 💬 **Real-Time Chat** – One-to-one messaging powered by Socket.IO
- 🔔 **Notifications** – Get notified instantly when you receive messages, likes, or comments powered by Socket.IO
- 📱 **Responsive Design** – Works seamlessly on desktop and mobile devices
- ⚡ **Modern UI** – Built with TailwindCSS and Lucide icons for a clean, modern feel

---

## 🛠️ Tech Stack

- **Frontend:** React, React Router, TailwindCSS
- **State & Data:** React Hooks, Custom handler for API requests
- **Real-Time:** Socket.IO client
- **Icons:** Lucide React
- **Date Formatting:** Moment.js

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn package manager

### Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/DevDad-Main/Knect.git
   cd Knect
   ```

2. Install dependencies:

```bash
npm install
  # or
yarn install
```

3. Create .env file to the root directory and add your environment variables:

```bash
VITE_BASEURL=http://localhost:5000
```

4. Start development server:

```bash
npm run dev
 # or
yarn dev
```

## 📂 Project Structure

```bash
src/
│── components/ # Reusable UI components (Sidebar, Notifications, etc.)
│── pages/ # Main pages (Feed, Messages, Notifications, Profile, etc.)
│── utils/ # Helper functions (API calls, auth helpers, etc.)
│── App.jsx # React entry point
│── main.jsx # App entry with routes

```

---

## 🔮 Roadmap

- [ ] Dark mode support
- [ ] Group chats
- [x] Improved notification center

---

🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the project

2. Create your feature branch (git checkout -b feature/NewFeature)

3. Commit your changes (git commit -m "Add NewFeature")

4. Push to the branch (git push origin feature/NewFeature)

5. Open a Pull Request

---

## 🧑‍💻 Author

**Olly** - Aspiring _Backend Developer_  
📨 [softwaredevdad@gmail.com]

---

## 🪪 License

This project is open-source and available under the [MIT License](LICENSE).

---
