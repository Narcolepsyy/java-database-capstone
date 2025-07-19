## MySQL Database Design
### Table: patients
- id: INT, PRIMARY KEY, Auto_Increment 
- full_name: VARCHAR, Not Null 
- email: VARCHAR, UNIQUE, Not Null
- phone: VARCHAR, UNIQUE
- dob: DATE
- gender: ENUM('Male', 'Female', 'Other')
- address: TEXT
- created_at: DATETIME, DEFAULT_CURRENT_TIMESTAMP
### Table: doctors
- id: INT, PRIMARY KEY, Auto_Increment
- full_name: VARCHAR, Not Null
- email: VARCHAR, NOT NULL, UNIQUE
- phone: VARCHAR, UNIQUE
- specialization: VARCHAR, NOT NULL
- profile_description: TEXT
- available_from: TIME
- available_to: TIME
- created_at: DATETIME, DEFAULT_CURRENT_TIMESTAMP
### Table: appointments
- id: INT, PRIMARY KEY, Auto_Increment
- doctor_id: INT, Foreign Key → doctors(id) ON DELETE CASCADE
- patient_id: INT, Foreign Key → patients(id) ON DELETE CASCADE
- appointment_time: DATETIME, Not Null
- status: INT (0: scheduled, 1: completed, 2: Canceled) 
> ON DELETE CASCADE make sure that when delete doctor or patient the appointment link with it also be deleted

### Table: admin 
- id: INT, PRIMARY KEY, AUTO_INCREMENT
- username: VARCHAR, UNIQUE, NOT NULL
- password_hash: VARCHAR, NOT NULL
- role: ENUM('SuperAdmin', 'Staff') DEFAULT Staff
- created_at: DATETIME, DEFAULT_CURRENT_TIMESTAMP

### Table: clinic_location
- id: INT, PRIMARY KEY, AUTO_INCREMENT
- name: VARCHAR, NOT NULL
- address: TEXT, NOT NULL
- phone: VARCHAR
- EMAIL: VARCHAR
> In case the clinic is a multi-branch

### Table: payments
- id: INT, PRIMARY KEY, AUTO_INCREMENT
- appointment_id: INT, FOREIGN KEY → appointments(id) ON DELETE SET NULL
- amount: DECIMAL, NOT NULL
- payment_method: ENUM('cash','card', 'online')
- payment_status: ENUM('pending', 'paid', 'failed')
- paid_at: DATETIME


### Design justification
- On delete cascade is applied when deleting patient or doctor it should also delete the related appointment
- Overlapping appointment should be handled via appointment_time and doctor_id
- Admin role allow future expansion

## MongoDB Collection Design
### Collection: prescriptions
```json
{
"_id": "ObjectId('64abc123456')",
"patientId": 1042,
"doctorId": 89,
"appointmentId": 51,
"recordType": "consultation",
"createdAt": "2025-07-19T15:18:19Z",
"updatedAt": "2025-07-19T15:18:19Z",

"clinicalNotes": {
"chiefComplaint": "Recurring headaches for 2 weeks",
"subjective": "Patient reports throbbing pain behind right eye, 7/10 intensity, worse in evenings",
"objective": {
"vitals": {
"bp": "128/82",
"pulse": 76,
"temp": 98.6,
"respRate": 16,
"o2Sat": 98
},
"examination": "Mild tenderness in temporal region. No photophobia. Neurological exam normal."
},
"assessment": "Probable tension headache with possible migraine component",
"plan": "Trial of sumatriptan as needed. Lifestyle modifications discussed."
},

"prescriptions": [
{
"medication": "Sumatriptan",
"dosage": "50mg",
"route": "oral",
"sig": "Take 1 tablet at onset of headache. May repeat after 2 hours if needed. Max 2 tablets/24 hours.",
"quantity": 9,
"refills": 1,
"startDate": "2025-07-19",
"endDate": "2025-10-19",
"pharmacy": {
"id": 123,
"name": "MedRx Pharmacy",
"address": "450 Market St, San Francisco, CA"
},
"status": "sent"
}
],

"attachments": [
{
"type": "image",
"filename": "previous_ct_scan.jpg",
"contentType": "image/jpeg",
"size": 2458092,
"uploadedAt": "2025-07-19T15:10:23Z",
"description": "CT scan from previous hospital visit",
"path": "/storage/patient/1042/ct_scan_20250519.jpg"
}
],

"patientFeedback": {
"submittedAt": "2025-07-19T17:45:12Z",
"overallRating": 4,
"waitTimeRating": 3,
"doctorCommunicationRating": 5,
"comments": "Dr. Smith was very thorough and took time to explain my condition. Wait time was longer than expected.",
"followupRequested": false
},

"metadata": {
"version": 1,
"lastModifiedBy": "dr_smith",
"department": "Neurology",
"tags": ["headache", "migraine", "follow-up-needed"],
"billing": {
"status": "pending",
"insuranceVerified": true,
"diagnosisCodes": ["G44.209", "R51"]
}
}
}
```
### Design Considerations

**1. References vs. Embedding:**
I've used ID references (`patientId`, `doctorId`, `appointmentId`) rather than embedding full objects because:
- It maintains a single source of truth for patient/doctor information in MySQL
- Reduces document size and prevents data duplication
- Makes patient demographic updates simpler (update once in MySQL)
- Follows best practices for relational data even in a NoSQL context

**2. Schema Evolution Support:**
This design supports future schema changes by:
- Using a version field in metadata to track schema changes
- Organizing data in logical nested structures that can expand
- Using arrays for collections that may grow (prescriptions, attachments)
- Including flexible fields like tags that can accommodate new categorization needs

**3. Advanced MongoDB Features:**
- Compound indexes could be created on `patientId` and `createdAt` for efficient queries
- Text search capabilities on the free-form notes
- TTL indexes could be used to automatically archive old records
- Aggregation pipeline could generate reports across multiple records

**4. Benefits Over Relational Databases:**
- Free-form clinical notes can vary greatly between specialties and physicians
- The document structure naturally maps to how healthcare providers think about patient encounters
- Flexible schema accommodates different record types without schema migrations
- Nested structures eliminate the need for complex joins

