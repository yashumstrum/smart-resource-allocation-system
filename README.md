# Smart Resource Allocation System using AI

## Problem Statement
Organizations often face inefficient resource allocation due to manual planning and lack of real-time insights. This leads to resource wastage, increased operational costs, execution delays, and poor decision-making. 

## Solution Overview
An AI-powered system that takes resources and tasks as input, and intelligently maps them using Google Gemini API. It dynamically allocates resources to tasks based on priority and efficiency, ensuring the most optimal assignment while balancing resource load.

## Setup Steps

### Prerequisites
- Node.js installed
- Google Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your Gemini API key to `backend/.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=5001
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Usage
- Enter a list of resources (e.g. servers, engineers, rooms).
- Enter a list of tasks and select their priority.
- Click **"Allocate Resources"** to invoke the AI engine and see the Optimized Output Dashboard.

## Future Scope
- **Advanced ML Prediction Models**: Train custom models based on historical organizational data.
- **IoT Integration**: Track physical resource availability in real-time.
- **Mobile App Version**: Provide a quick dashboard for field managers.
- **Industry-Specific Optimization**: Specialized modes for Hospitals, Construction, or Software Engineering.
