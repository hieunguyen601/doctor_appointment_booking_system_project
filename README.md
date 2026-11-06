# Doctor Appointment Booking System

A full-stack web application that allows patients to find doctors, book appointments, and manage their bookings. The system uses RESTful APIs, JWT authentication, role-based authorization, and MongoDB Atlas for cloud database storage.

## Tech Stack

**Frontend**
- React.js, TypeScript
- HTML, CSS, JavaScript

**Backend**
- Node.js, Express.js
- MongoDB Atlas, Mongoose
- JSON Web Token (JWT)
- bcryptjs for password hashing

**Development Tools**
- Git & GitHub
- Thunder Client (API Testing)
- VS Code
- dotenv, CORS, Nodemon

## Features

### Authentication & Authorization
- User registration and login
- Secure password hashing with bcryptjs
- JWT-based authentication
- Protected API endpoints
- Role-based access control (Patient, Doctor, Admin)

### Doctor Management
- Create, retrieve, update, and delete doctor profiles
- Store doctor specializations and experience
- Manage doctor availability

### Appointment Management
- Book appointments with available doctors
- View personal appointment history
- Cancel appointments
- Prevent duplicate bookings using MongoDB compound unique indexes
- Store appointment timestamps in UTC, with Central Time support for display

### Frontend (In Development)
- Patient dashboard
- Doctor search and appointment booking interface
- Login and registration pages
- Appointment management interface

## Security

- Passwords are hashed before database storage.
- JWT middleware protects private endpoints.
- Role-based authorization restricts sensitive operations.
- MongoDB indexes prevent duplicate active appointment slots.
- Sensitive credentials are stored in environment variables.

## Future Improvements

- Complete the React frontend
- Doctor availability schedules
- Appointment confirmation and notifications
- Search and filter doctors by specialization
- Deployment of frontend and backend

## Project Status

Backend development and API testing are in progress. Frontend development and deployment are planned.

## Author

**Henry Nguyen**

Computer Science Student | University of Houston

Full-Stack / Software Engineering

