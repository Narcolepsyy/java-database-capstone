# Admin 
## User story 1

**Title:**
_As an admin, I want to log into the portal with username and password, so that I can manage the platform securely._

**Acceptance Criteria:**
1. The system should display a login with fields for username and password.
2. The admin should be authenticated against stored credentials in the database.
3. Upon successful login, the admin is redirected to the admin dashboard.

**Priority:** High
**Story Points:** 3
**Notes:**
- Invalid login attempts should display an error message.
- Passwords should be encrypted and stored securely. 
---
## User story 2

**Title:**
_As an admin, I want to logout of the portal, so that I can protect access to the system._

**Acceptance Criteria:**
1. The admin should see a "Logout" option in the dashboard.
2. Clicking "Logout" should invalidate the current session.
3. The system should redirect to the login screen after logout.

**Priority:** High
**Story Points:** 1
**Notes:**
- Session timeout should also trigger auto-logout.
---
## User story 3

**Title:**
_As an admin, I want to add doctor to the portal , so that I can register new staff members._

**Acceptance Criteria:**
1. The admin can access a form to enter doctor details (name, email, specialization).
2. The form validates required fields before submission.
3. On submission, the doctor's profile is saved in the database and shown in the doctor lists.

**Priority:** High
**Story Points:** 3
**Notes:**
- Duplicate email should be disallowed.
---
## User story 4

**Title:**
_As an admin, I want to delete a doctor's profile, so that I can remove former or incorrect records._

**Acceptance Criteria:**
1. The admin should be able to view a list of existing doctors.
2.  Each doctor profile should include a "Delete" button.
3. A confirmation prompt should appear before deletion.
4. On confirmation, the doctor record should be removed from the database.

**Priority:** High
**Story Points:** 2
**Notes:**
- Deleting a doctor should also handle orphaned appointment records or notify the user.


## User story 5

**Title:**
_As an admin, I want to Run a stored procedure in MySQL CLI, so that I can get the number of appointments per month and track usage statistics._

**Acceptance Criteria:**
1. A stored procedure is defined in MySQL that counts appointments by month.
2. Admin can access the CLI and execute the procedure with a single command.
3. The output should display a month-wise summary of appointments.

**Priority:** Medium
**Story Points:** 2
**Notes:**
- Consider creating a view in the future to expose this data on the dashboard.
---
# Patient

## User Story 6
**Title**:
_As a patient, I want to view a list of doctors without logging in, so that I can explore options before registering._

**Acceptance Criteria**:

1. The homepage should show a "View Doctors" section or link.
2. The system displays a paginated list of doctors with basic details (name, specialization).
3. No login should be required to access this list.

**Priority**: High
**Story Points**: 2
**Notes**:

- Consider allowing filtering by specialization or city.
---
## User Story 7
**Title**:
_As a patient, I want to sign up using my email and password, so that I can book appointments._

**Acceptance Criteria**:

1. A "Sign Up" form is available with required fields (email, password, name).

2. Form validation ensures the email is unique and the password meets security requirements.

3. On successful registration, the patient is redirected to the login or dashboard page.

**Priority**: High
**Story Points**: 3
**Notes**:
- Email verification could be added in the future.
---
## User Story 8
**Title**:
_As a patient, I want to log into the portal, so that I can manage my bookings._

**Acceptance Criteria**:

1. Login form accepts registered email and password.
2. System authenticates user and redirects them to the patient dashboard.
3. Invalid credentials trigger a proper error message.

**Priority**: High
**Story Points**: 2
**Notes**:
- Sessions should be securely handled and timed out appropriately.
---
## User Story 9
**Title**:
_As a patient, I want to log out of the portal, so that I can secure my account._

**Acceptance Criteria**:
1. The dashboard should include a "Logout" button.
2. Clicking "Logout" should invalidate the current session and redirect to the homepage or login screen.
3. User should no longer be able to access protected routes after logout.

**Priority**: Medium
**Story Points**: 1
**Notes**:
- Include auto logout after inactivity.
---
## User Story 10
**Title**:
_As a patient, I want to book an hour-long appointment after logging in, so that I can consult with a doctor._

**Acceptance Criteria**:
1. After login, user can choose a doctor and see their availability.
2. The user selects a date and one-hour time slot.
3. On confirmation, the appointment is saved to the database and shown in the user's upcoming appointments.

**Priority**: High
**Story Points**: 3
**Notes**:

- Overlapping appointments should be prevented.
---
## User Story 11
**Title**:
_As a patient, I want to view my upcoming appointments, so that I can prepare accordingly._

**Acceptance Criteria:**

1. Logged-in patients can access a "My Appointments" page.

2. The page shows a list of future appointments including date, time, and doctor name.

3. Past appointments are not shown or are separated in a different section.

**Priority: High**
**Story Points**: 2
**Notes**:

- Sorting by date would improve usability.
---
# Doctor

## **User Story 12**

**Title:**
*As a doctor, I want to log into the portal to manage my appointments, so that I can access my schedule securely.*

**Acceptance Criteria:**

1. Doctor can log in using email and password.
2. Successful login redirects to doctor dashboard.
3. Login errors display appropriate messages.

**Priority:** High
**Story Points:** 2
**Notes:**

* Use secure authentication and session handling.

---

## **User Story 13**

**Title:**
*As a doctor, I want to log out of the portal, so that I can protect my data and maintain security.*

**Acceptance Criteria:**

1. Doctor can click "Logout" from any dashboard page.
2. Session ends and redirects to login page.
3. Re-accessing dashboard without login is blocked.

**Priority:** High
**Story Points:** 1
**Notes:**

* Ensure token/session is cleared properly.

---

## **User Story 14**

**Title:**
*As a doctor, I want to view my appointment calendar, so that I can stay organized and manage my time efficiently.*

**Acceptance Criteria:**

1. Calendar view shows upcoming appointments.
2. Includes patient names, times, and durations.
3. Supports monthly, weekly, and daily views.

**Priority:** High
**Story Points:** 3
**Notes:**

* Use a calendar UI component for usability.

---

## **User Story 15**

**Title:**
*As a doctor, I want to mark my unavailability, so that patients only see the slots when I’m available.*

**Acceptance Criteria:**

1. Doctor can block out time slots via dashboard.
2. Unavailable slots are hidden from patient booking.
3. System updates calendar availability accordingly.

**Priority:** Medium
**Story Points:** 3
**Notes:**

* Prevent bookings in marked unavailable slots.

---

## **User Story 16**

**Title:**
*As a doctor, I want to update my profile with specialization and contact information, so that patients have up-to-date information.*

**Acceptance Criteria:**

1. Doctor can edit name, specialization, and contact details.
2. Changes are validated and saved to the database.
3. Updated profile is reflected on doctor listing page.

**Priority:** Medium
**Story Points:** 2
**Notes:**

* Profile updates should require authentication.

---

## **User Story 17**

**Title:**
*As a doctor, I want to view the patient details for upcoming appointments, so that I can be prepared in advance.*

**Acceptance Criteria:**

1. Doctor dashboard lists upcoming appointments.
2. Each appointment links to patient info (name, history).
3. Patient details are view-only and securely accessible.

**Priority:** High
**Story Points:** 3
**Notes:**

* Limit access only to doctors assigned to that patient.

---

