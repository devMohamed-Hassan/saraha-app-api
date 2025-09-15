# Saraha App

A secure and anonymous messaging platform built with Node.js, Express.js, and MongoDB. Saraha App allows users to send anonymous messages to each other while maintaining privacy and security.


## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)

## Features

### Authentication & User Management
- **User Registration & Login** - Secure account creation with email verification
- **Social Login** - Google OAuth2 integration
- **Password Management** - Secure password reset with OTP verification
- **Email Verification** - OTP-based email confirmation system
- **Profile Management** - Update user profile, upload images
- **Account Security** - Multi-device session management and logout

### Messaging System
- **Anonymous Messaging** - Send messages without revealing identity
- **Image Support** - Send both text and image messages
- **Message Inbox** - View received messages
- **Message Status** - Track read/unread status

### Security & Privacy
- **Data Encryption** - Sensitive data encrypted at rest
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Protection** - Configurable CORS policies
- **Helmet Security** - Security headers implementation
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt password hashing with salt

### Additional Features
- **Cloud Storage** - Cloudinary integration for image storage
- **Email Service** - Nodemailer for email notifications
- **Input Validation** - Joi schema validation
- **Error Handling** - Comprehensive error handling middleware
- **Logging** - Morgan HTTP request logging
- **Database** - MongoDB with Mongoose ODM

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Google OAuth2
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Utilities**: Bcrypt, Crypto-js, Nanoid



## API Documentation

### Deployment URLs:
### AWS EC2
```
http://ec2-98-84-149-71.compute-1.amazonaws.com
```
### Vercel
```
https://saraha-app-sigma.vercel.app
```


### Authentication Endpoints

#### Register User
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "Mohamed Hassan",
  "email": "dev.mohamed.hassan@example.com",
  "password": "StrongPassword123",
  "confirmPassword": "StrongPassword123",
  "age": 72,
  "gender": "male",
  "phone": "+201234567890"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "dev.mohamed.hassan@example.com",
  "password": "StrongPassword123"
}
```

#### Confirm Email
```http
POST /auth/confirm-email
Content-Type: application/json

{
  "email": "dev.mohamed.hassan@example.com",
  "otp": "123456"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "dev.mohamed.hassan@example.com"
}
```

#### Reset Password
```http
PUT /auth/reset-password
Content-Type: application/json

{
  "email": "dev.mohamed.hassan@example.com",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

#### Social Login (Google)
```http
POST /auth/social-login
Content-Type: application/json

{
  "idToken": "google-id-token"
}
```

### User Endpoints

#### Get User Profile
```http
GET /user
Authorization: Bearer <token>
```

#### Update User Profile
```http
PATCH /user/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "age": 92
}
```

#### Upload Profile Image
```http
PATCH /user/profile-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

#### Get Public Profile
```http
GET /user/public/:userId
```

### Message Endpoints

#### Send Message
```http
POST /message/send/:receiverId
Authorization: Bearer <token>
Content-Type: multipart/form-data

content: "Your anonymous message"
image: <file> (optional)
```

#### Get Messages (Inbox)
```http
GET /message/inbox
Authorization: Bearer <token>
```

## Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **Data Encryption**: Sensitive data encrypted using crypto-js
- **JWT Tokens**: Secure authentication with refresh token mechanism
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive Joi schema validation
- **Security Headers**: Helmet.js for security headers
- **OTP Verification**: Time-based OTP for email verification
- **Session Management**: Multi-device session tracking and management

> **⚠️ Note:** This application was carefully developed to provide an **anonymous messaging experience**.  
> For access credentials (Bearer token) and the Postman collection, please **contact the developer**.


