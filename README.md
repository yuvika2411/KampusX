# KampusX - Campus Issue Reporting & Student Interaction Platform

KampusX is a full-stack campus issue reporting and student interaction platform designed specifically for college students. It provides a centralized platform where students can report problems around the campus, support existing issues through voting, and interact with other students regarding academic and college-related concerns.

The platform includes three main roles — **Student, Resolver, and Admin**. Students can report issues related to hostels, Wi-Fi, labs, cafeterias, classrooms, and other campus facilities, while Resolvers handle reported issues and Admin manages and monitors the overall platform.

The application is built using **Next.js, Spring Boot, PostgreSQL, Cloudinary, and Docker**, following RESTful architecture, JWT-based authentication, role-based authorization, and a structured backend design.

---

## Features

### Student

- User Registration & Login
- JWT Authentication
- Report Campus Issues
- Issue Category & Priority
- Campus Location Selection
- Affected Users Count
- Optional Image Upload
- View Reported Issues
- Issue Details
- Issue Voting
- Create Posts
- Like & Comment on Posts
- Student-to-Student Chat
- Academic & Campus Discussions

### Resolver

- Resolver Login
- View Reported Issues
- Handle Assigned Issues
- Update Issue Status
- Track Issue Progress

### Admin

- Admin Login
- User Management
- Issue Management
- Monitor Reported Issues
- Monitor Issue Resolution
- Manage Platform Activities

---

## Tech Stack

### Frontend

- Next.js
- React
- JavaScript / TypeScript
- Axios
- Tailwind CSS
- REST API Integration

### Backend

- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- REST APIs
- Maven
- Lombok

### Database

- PostgreSQL

### Cloud & DevOps

- Cloudinary
- Docker
- Git & GitHub
- GitHub Actions
- CI/CD

---

## Authentication & Security

- JWT Authentication
- Spring Security
- Role-Based Authorization
- Protected REST APIs
- Stateless Authentication
- Method-Level Authorization

---

## Issue Management

Students can report issues related to different areas of the college campus.

Each issue can contain:

- Title
- Description
- Category
- Location
- Priority
- Affected Users
- Reporter
- Status
- Optional Image

Students can vote on issues they are also facing, helping highlight problems affecting a larger number of students.

The issue workflow is:

```text
Student Reports Issue
        ↓
Issue Created
        ↓
Students Vote / Support
        ↓
Resolver Handles Issue
        ↓
Issue Status Updated
        ↓
Admin Monitors
