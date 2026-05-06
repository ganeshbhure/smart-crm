# Smart CRM 🚀

A Full Stack Customer Relationship Management (CRM) application built using **Spring Boot, React, PostgreSQL, and JWT Authentication**.

This project helps manage customers, contacts, and notes/issues in a modern CRM dashboard with role-based access control.

---

# 📌 Features

## 🔐 Authentication & Authorization
- User Registration & Login
- JWT Authentication
- Role-Based Access Control (ADMIN / USER)
- Protected Routes

---

## 👥 Customer Management
- Add Customer
- Update Customer
- Delete Customer
- Search Customer
- Pagination
- Sorting
- Responsive Dashboard UI

---

## 📞 Contact Management
- Add Contacts for Customers
- View Customer Contacts
- Modal-based Contact UI

---

## 📝 Notes / Issue Tracking
- Add Notes for Customers
- Update Note Status
- Delete Notes
- Status Tracking:
  - OPEN
  - IN_PROGRESS
  - RESOLVED

---

## 🎨 UI/UX Features
- Modern Dashboard UI
- Custom Delete Confirmation Modal
- Dropdown Action Menu
- Loading States
- Responsive Layout
- Professional CRM-style Design

---

# 🛠️ Tech Stack

## Frontend
- React.js
- React Router DOM
- JavaScript
- HTML5
- CSS3

---

## Backend
- Java
- Spring Boot
- Spring Security
- JWT Authentication
- REST APIs
- Maven

---

## Database
- PostgreSQL
- Spring Data JPA / Hibernate

---

# 📂 Project Structure

```text
SmartCRM/
│
├── backend/
│   └── smartcrm-backend/
│
├── smartcrm-frontend/
```

---

# ⚙️ Backend Setup

## 1️⃣ Configure PostgreSQL

Create database:

```sql
CREATE DATABASE smartcrm;
```

Update `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartcrm
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
```

---

## 2️⃣ Run Backend

```bash
cd backend/smartcrm-backend
./mvnw spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

# 💻 Frontend Setup

## 1️⃣ Go to frontend folder

```bash
cd smartcrm-frontend
```

## 2️⃣ Install dependencies

```bash
npm install
```

## 3️⃣ Start frontend

```bash
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

# 🔑 API Endpoints

## Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

## Customers
- `GET /api/customers`
- `POST /api/customers`
- `PUT /api/customers/{id}`
- `DELETE /api/customers/{id}`

## Contacts
- `GET /api/contacts/customer/{customerId}`
- `POST /api/contacts`

## Notes
- `GET /api/notes/customer/{customerId}`
- `POST /api/notes/customer/{customerId}`
- `PUT /api/notes/{noteId}`
- `DELETE /api/notes/{noteId}`

---

# 🔒 Roles

| Role | Permissions |
|------|-------------|
| ADMIN | Full Access |
| USER | View Customers, Contacts, Notes |

---

# 👨‍💻 Contributors

- Ganesh Bhure
- Project Partner

---

# 🚀 Future Improvements

- Analytics Dashboard
- Email Notifications
- CSV Export
- Activity Timeline
- File Attachments
- Deployment

---

# 📷 Screenshots

_Add project screenshots here_

---

# 📄 License

This project is developed for educational and learning purposes.
