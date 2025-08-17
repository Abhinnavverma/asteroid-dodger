# 🚀 Asteroid Dodger AI

A simulation project where a neural network learns to control a spaceship and dodge incoming asteroids. This project visualizes the process of self-driving cars and reinforcement learning in a simple and interactive way.

## ✨ Features

- **Self-Driving Spaceship:** The primary spaceship is controlled by a neural network.
- **AI Training:** The AI learns and improves over generations. You can save the best-performing AI.
- **Real-time Visualization:**
    - **Game View:** Watch the spaceship navigate the asteroid field.
    - **Neural Network View:** See the neural network's structure and how it processes information in real-time.
- **Interactive Controls:**
    - **💾 Save:** Save the brain of the best spaceship to local storage.
    - **🗑️ Discard:** Discard the saved brain and start fresh.

## 🔧 Technologies Used

- **HTML5 Canvas:** For rendering the game, neural network, and charts.
- **JavaScript (ES6+):** Core logic for the game, physics, and neural network.
- **No external libraries/frameworks:** Built with plain vanilla JavaScript.

## 🏃‍♂️ How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Abhinnavverma/asteroid-dodger.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd asteroid-dodger
    ```
3.  **Open `index.html` in your browser.**
    - You can simply double-click the `index.html` file.
    - For a better experience, use a live server extension in your code editor (like VS Code's "Live Server").

## 🧠 Project Structure

```
├── asteroid.js         # Defines the Asteroid class and its behavior
├── controls.js         # Handles user input controls
├── index.html          # Main HTML file
├── main.js             # Core application logic, game loop, and initialization
├── network.js          # Defines the neural network (Level, Network classes)
├── README.md           # This file
├── sensor.js           # Defines the spaceship's sensor
├── spaceField.js       # Manages the game area and asteroid generation
├── spaceship.js        # Defines the Spaceship class (after rename)
├── style.css           # Styles for the application
├── utils.js            # Utility functions (lerp, getIntersection, etc.)
└── visualizer.js       # Logic for drawing the neural network and charts
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📜 License

This project is open-source. Feel free to use and modify it.
