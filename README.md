Bipolar Mood Pattern Analyzer
A compassionate AI-powered web application that helps individuals track and understand their mood patterns through daily logging and intelligent analysis.

📋 Table of Contents
About

Features

Tech Stack

Live Demo

Getting Started

Usage Guide

API Endpoints

Screenshots

Contributing

License

Contact

🎯 About
The Problem: Bipolar disorder affects millions worldwide, but early detection of mood episodes is difficult because patterns emerge slowly over time and subtle signs are easy to miss.

Our Solution: A secure web app that transforms 30 seconds of daily tracking into AI-powered insights. Users log mood, sleep, energy, and behaviors, and our system analyzes 30 days of data to detect potential patterns—without making medical diagnoses.

We don't replace doctors. We empower you with awareness.

✨ Features
📝 30-Second Daily Tracking – Log mood (-5 to +5), sleep, energy, irritability, and behaviors

🤖 AI Pattern Detection – Spots manic (3+ days) & depressive (5+ days) episodes using Cerebras AI

📊 Interactive Visualizations – Beautiful charts showing mood trends, sleep patterns & energy distribution

🚨 24/7 Crisis Support – Emergency hotlines always accessible

🔒 Privacy First – Encrypted data, HTTP-only cookies, complete user control

🎯 Personalized Insights – AI-generated summaries & gentle recommendations

🔔 Smart Alerts – Daily reminders & streak celebrations

🌓 Dark Mode – Easy on the eyes

📱 Fully Responsive – Works on mobile, tablet & desktop

📤 Export Data – Download your complete history as JSON

🛠️ Tech Stack
Frontend
React.js – UI library

Vite – Build tool

Tailwind CSS – Styling

Recharts – Charts & graphs

Framer Motion – Animations

React Router – Navigation

Axios – API calls

Backend
Node.js – Runtime

Express.js – Web framework

MongoDB – Database

Mongoose – ODM

JWT – Authentication

bcryptjs – Password hashing

Cerebras AI – Pattern analysis

Deployment
MongoDB Atlas – Cloud database

🚀 Getting Started
Prerequisites
Node.js (v18+)

MongoDB (local or Atlas)

Git

Installation
Clone the repository

bash
git clone https://github.com/yourusername/bipolar-mood-analyzer.git
cd bipolar-mood-analyzer
Install backend dependencies

bash
cd server
npm install
Configure backend environment

bash
cp .env.example .env
# Edit .env with your values
Install frontend dependencies

bash
cd ../client
npm install
Configure frontend environment

bash
cp .env.example .env
# Edit .env with your values
Run the application

bash
# Backend (from server directory)
npm run dev

# Frontend (from client directory in another terminal)
npm run dev
Open your browser

text
http://localhost:3000
📖 Usage Guide
1. Create an Account
Sign up with your name, email, and password

Login to access your dashboard

2. Track Daily
Click "Log Today's Mood"

Fill the 8-field form (takes 30 seconds)

Submit to save your entry

3. View Dashboard
See your mood trends, statistics, and patterns

Check daily insights and recommendations

4. Analyze Patterns
Visit Analysis page for deep insights

View AI-generated summaries

Access crisis resources if needed

5. Manage Settings
Update profile and preferences

Export your data

Delete account if desired

🔌 API Endpoints
Method	Endpoint	Description	Auth
POST	/api/auth/register	New user	❌
POST	/api/auth/login	Login	❌
POST	/api/auth/logout	Logout	❌
GET	/api/auth/me	Current user	✅
POST	/api/mood/entry	Save mood entry	✅
GET	/api/mood/entries	Get entries	✅
GET	/api/mood/today	Today's entry	✅
GET	/api/analysis/patterns	Pattern analysis	✅
GET	/api/analysis/ai-insights	AI insights	✅
GET	/api/analysis/resources	Crisis resources	❌
📸 Screenshots
Dashboard	Daily Entry	Analysis
https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Dashboard	https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Daily+Entry	https://via.placeholder.com/300x200/10B981/FFFFFF?text=Analysis
🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

⚠️ Disclaimer
This application provides insights and awareness only. It is not a medical device and does not provide diagnoses. Always consult with qualified healthcare providers for mental health concerns. If you're in crisis, contact emergency services immediately.

📞 Crisis Resources
National Suicide Prevention Lifeline: 1-800-273-8255

Crisis Text Line: Text HOME to 741741

SAMHSA Helpline: 1-800-662-4357

NAMI Helpline: 1-800-950-6264

📧 Contact
Project Link: https://github.com/yourusername/bipolar-mood-analyzer

Email: your.email@example.com

🙏 Acknowledgments
Cerebras AI for AI infrastructure

MongoDB Atlas for database

Built with ❤️ for better mental health awareness

Track. Analyze. Understand. Take control.

This response is AI-generated, for reference only.

