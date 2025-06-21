Nutrition Trends - Dual CRM
🚀 Overview
Nutrition Trends is a robust dual Customer Relationship Management (CRM) web application specifically tailored for dieticians and their clients. It streamlines data exchange, communication, and service delivery, providing a centralized platform for managing client information, tracking progress, and enhancing the overall client engagement experience.

✨ Key Features
Dual Interface: Separate, optimized interfaces for dieticians (managing multiple clients) and individual clients (accessing their personalized plans and progress).

Client Management: Dieticians can easily add, view, and manage client profiles, dietary plans, and progress data.

Data Exchange: Facilitates seamless and secure exchange of information between dieticians and clients.

Responsive Design: Engineered with highly responsive interfaces to ensure optimal usability across various devices (desktop, tablet, mobile).

Secure & Scalable: Leverages Firebase for robust backend services, ensuring data security and a scalable foundation for growth.

🛠️ Technologies Used
Frontend:

React.js: A declarative, efficient, and flexible JavaScript library for building user interfaces.

JavaScript: The core programming language for dynamic and interactive web content.

HTML/CSS: For structuring and styling the web application.

Tailwind CSS: A highly customizable, low-level CSS framework.

Backend & Database:

Firebase: Google's comprehensive platform for web and mobile development, specifically utilized for:

Firebase Authentication: For secure user (dietician and client) registration and login.

Firestore: A flexible, scalable NoSQL cloud database for storing all client and dietician data.

🚀 Live Demo
Explore the Nutrition Trends CRM in action: https://nutrition-trends.web.app/

🏗️ Installation & Setup
Follow these steps to get a local copy of Nutrition Trends up and running on your development machine.

Prerequisites
Node.js (LTS version recommended)

npm or Yarn

Steps
Clone the repository:

git clone https://github.com/Natasha-cyber777/Nutrition-Trends.git
cd Nutrition-Trends

(Note: Replace https://github.com/Natasha-cyber777/Nutrition-Trends.git with the actual URL of your repository if it's different).

Install dependencies:

npm install
# or if you prefer yarn:
yarn install

Firebase Configuration (Environment Variables):
This project connects to Firebase. To ensure your sensitive API keys are not exposed, you must use environment variables.

Create a .env file in the root of your project directory.

Add your Firebase project's configuration details. You can find these in your Firebase project console (Project overview -> Project settings -> General -> Your apps -> Web app section). Remember to prefix variables with REACT_APP_ for Create React App projects:

REACT_APP_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID

Crucially, ensure .env is listed in your .gitignore file.

Run the application:

npm start
# or:
yarn start

This command will launch the development server, and the Nutrition Trends app should open in your default web browser, typically at http://localhost:3000.

🛣️ Future Enhancements
Appointment Scheduling: Integrate a calendar for dieticians to manage appointments with clients.

Meal Plan Generation: Tools for dieticians to create and share personalized meal plans.

Progress Charts: Enhanced data visualization for client progress over time (weight, metrics, etc.).

Secure Messaging: In-app secure chat for direct communication.

Notification System: Alerts for new messages, updated plans, or upcoming appointments.

🤝 Contributing
Contributions are welcome! If you have suggestions or want to contribute to the project, please feel free to:

Fork the repository.

Create a new branch (git checkout -b feature/your-feature).

Implement your changes.

Commit your changes (git commit -m 'Add new feature X').

Push to the branch (git push origin feature/your-feature).

Open a Pull Request describing your contribution.

📄 License
This project is licensed under the MIT License - see the LICENSE file for more details.

📧 Contact
For any inquiries or collaboration opportunities, please feel free to connect:

Natasha Robinson: matasha093@gmail.com

LinkedIn: www.linkedin.com/in/natasha-robinson-29abb517a

GitHub: github.com/Natasha-cyber777
