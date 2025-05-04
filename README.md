# Weave

## General Info
Weave is a full stack website application aimed for media creators, where they can host a link page, upload and display images on their gallery page, and maintain blogs on their blog page-- all within a single integrated platform.

This repository contains the working backend for the application and is intended to be run alongside the frontend.  
Click here to view the repository containing the frontend --> https://github.com/atlasastronomer/weave

This project was built through VSCode. While it is possible to use another text editor or IDE in its place, using VSCode makes the setup for this project significantly easier

## Technologies
### Frontend
- React.js (Ver. 19.0.0)
- HTML5
- CSS3
- Javascript (ES6+)
### Backend
- Node.js (v23.11.0)
- Express.js
- MongoDB (Mongoose ODM)
### Tools and Environments
- VSCode
- Cloudinary API
- Node Package Manager (npm)
- Postman
- Github

## Setup Instructions
### Step 1:
Create a new directory
### Step 2:
2. Navigate to new directory; clone frontend and backend repositories in new directory
### Step 3:
MongoDB Database Configuration:
   - Login/Signup to MongoDB Atlas
   - Create new cluster
   - Navigate to cluster
   - Create new database
   - In database, create the following collections: avatars, blogs, links, posts, user
### Step 4:
MongoDB Connection:
   - Click Connect in your MongoDB Atlas dashboard
   - Choose connection method MongoDB for VS Code
   - Follow instructions to obtain connection string and save for later use (Step 6-7)
### Step 5:
Cloudinary Configuration:
   - Login/Signup to Cloudinary
   - Navigate to Dashboard and create new app (if necessary)
   - Find your Cloud Name, API Key, and API Secret on the dashboard.
   - Save for later use (Step 6-7)
### Step 6
**In frontend directory**:
   - Create `.env` file in the root of the directory
   - Set up environment variables:
     - MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/ (use connection string obtained from step 4)
     - VITE_PORT=3001
     - SECRET=your_secret_key (Replace <secret> with a secret string)
     - CLOUDINARY_API_KEY=your_cloudinary_api_key
     - CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     - CLOUDINARY_NAME=your_cloudinary_cloud_name
### Step 7
**In backend directory:**
   - Create `.env` file in the root of the directory
   - Set up environment variables:
   - Environment variables are identical to the ones in the frontend directory, only replace VITE_PORT with PORT
     - MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/ (use connection string obtained from step 4)
     - PORT=3001
     - SECRET=your_secret_key (Replace <secret> with a secret string)
     - CLOUDINARY_API_KEY=your_cloudinary_api_key
     - CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     - CLOUDINARY_NAME=your_cloudinary_cloud_name

Your version of the project should be working now. Please let me know about any bugs that need squashing via email:  
@atlasastronomer@gmail.com

## Resources
Full Stack Open for learning REST APIs, React.js, MongoDB, and Postman  
https://fullstackopen.com/en/

Cloudinary Official Documentation for setting up Cloudinary  
https://cloudinary.com/documentation/react_integration
