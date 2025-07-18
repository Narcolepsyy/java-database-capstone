### Section 1: Architecture Summary

This Spring Boot application follows a **layered architecture** using both **MVC (Model-View-Controller)** and **RESTful design** patterns. The application serves two kinds of clients:

* **Thymeleaf-based web pages** for the Admin and Doctor dashboards
* **REST APIs** for modules like Patient, Appointment, and Prescription management

The backend is powered by two databases:

* **MySQL** is used to store structured data such as patients, doctors, appointments, and admin accounts. This data is accessed via **JPA repositories and entity models**.
* **MongoDB** stores prescription data in a flexible, document-based structure using **Spring Data MongoDB**.

All incoming requests—whether from Thymeleaf pages or REST clients—are routed through controllers. These controllers invoke methods in the **service layer**, which abstracts business logic. The service layer then communicates with the appropriate **JPA or MongoDB repository layer** to fetch or persist data.

This design ensures separation of concerns, testability, and easy scalability across modules and services.

---

### Section 2: Numbered Flow of Data and Control

1. The user accesses the system via a web browser (AdminDashboard or DoctorDashboard) or through a frontend app making REST API calls.
2. Requests are routed to the appropriate controller—either a **Thymeleaf controller** (for admin and doctor views) or a **REST controller** (for all other operations).
3. The controller forwards the request to the corresponding method in the **service layer**.
4. The service layer contains business logic and decides whether to interact with **MySQL (via JPA)** or **MongoDB (via MongoTemplate or repository)**.
5. The service calls the appropriate **repository** (JPA Repository for MySQL or MongoRepository for MongoDB).
6. The repository retrieves or saves data and returns it to the service layer.
7. The service processes the result (if needed), and the controller sends the response back to the frontend (as a rendered HTML page or a JSON response).
