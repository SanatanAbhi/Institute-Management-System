# Institute Management System (IMS)

A Full Stack Institute Management System built using **Django**, **Django REST Framework**, **React.js**, **MySQL**, and **Bootstrap**.

This project is being developed as a portfolio project to manage students, centers, courses, batches, and institute activities through separate user roles.

---

## Project Overview

Institute Management System (IMS) is a full-stack web application designed to manage the daily activities of an educational institute. It provides separate login access for Super Admin, Centers, and Students and helps manage courses, batches, student records, and institute information through a centralized system.

---

## Tech Stack

### Backend

* Python
* Django
* Django REST Framework (DRF)
* MySQL

### Frontend

* React.js
* Bootstrap
* HTML5
* CSS3
* JavaScript (ES6+)

### Tools

* Git
* GitHub
* VS Code

---

## Key Features

* Role-Based Authentication (Super Admin, Center, Student)
* Student Registration and Management
* Center Registration and Management
* Course Management
* Batch Management
* REST APIs using Django REST Framework
* Responsive Frontend built with React.js and Bootstrap

---

## Features Implemented

### Authentication

* Super Admin Login
* Center Login
* Student Login
* Custom User Model with Role-Based Authentication

### Student Module

* Student Registration
* Student Profile
* Student Management APIs

### Center Module

* Center Registration
* Center Management
* Permissions and APIs

### Course Module

* Course Management

### Batch Module

* Batch Management
* Batch APIs

### Frontend Pages

* Home Page
* Super Admin Login
* Student Login
* Center Login
* Student Dashboard
* Center Dashboard
* Super Admin Dashboard
* Events Section
* Downloads Section
* Gallery Section
* Success Stories
* Government Partners Section

---

## Project Structure

```text
Institute-Management-System/
│
├── backend/
│   ├── accounts/
│   ├── students/
│   ├── centers/
│   ├── courses/
│   ├── batches/
│   ├── config/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── database_design.md
│   ├── modules.md
│   └── project_plan.md
│
├── requirements.txt
├── .gitignore
└── README.md
```

---

## How to Run the Project

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r ../requirements.txt

python manage.py migrate

python manage.py runserver
```

Backend runs at:

```text
http://127.0.0.1:8000/
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```text
http://localhost:5173/
```

> **Note:** Make sure MySQL is installed and configured before running Django migrations.

---

## Database

* MySQL
* Django ORM
* Custom User Model

---

## Project Status

This project is currently under active development. Additional modules such as Fees Management, Attendance, Exams, Results, Certificates, and Reports will be added in future updates.

---

## Future Modules

* Admissions Management
* Fees Management
* Attendance Management
* Exams Management
* Results Management
* Certificate Generation
* Reports and Analytics

---

## Developer

**Abhishek Kumar**

Python Full Stack Developer (Fresher)

**Skills:** Python • Django • Django REST Framework • React.js • MySQL • Bootstrap • HTML • CSS • JavaScript

---

⭐ This project is part of my Python Full Stack Developer portfolio and is being developed to strengthen my backend, frontend, and REST API development skills.
