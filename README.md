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

## Setup
1. Create a new directory
2. Navigate to new directory; clone frontend and backend repositories in new directory
3. MongoDB Database Configuration:
   - Login/Signup to MongoDB Atlas
   - Create new cluster
   - Navigate to cluster
   - Create new database
   - In database, create the following collections: avatars, blogs, links, posts, user
4. MongoDB Connection:
   - Click Connect
   - Select MongoDB for VS Code
   - Follow instructions; save connection string and password for later use
5. Cloudinary Configuration:
   - Login/Signup to Cloudinary
   - Save Cloud name for later use
   - Save API Key for later use
   - Save API Secret for later use 
6. In frontend directory:
   - Ensure you are in frontend directory
   - Create .env file
   - Set up environment variables:
     - MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/ (use connection string obtained from step 4)
     - VITE_PORT=3001
     - SECRET=your_secret_key (Replace <secret> with a secret string)
     - CLOUDINARY_API_KEY=your_cloudinary_api_key
     - CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     - CLOUDINARY_NAME=your_cloudinary_cloud_name
7. In backend directory:
   - Ensure you are in backend directory
   - Create .env file
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
