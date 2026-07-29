# Data Retention & Privacy Policy

## 1. Overview & Purpose
This application collects and processes candidate data to generate tailored job fit analyses, project roadmaps, and application packages. We prioritize data privacy and minimize the retention of sensitive Personal Identifiable Information (PII).

## 2. Collected Data & Storage
- **Parsed Resume Data:** Extracted skills, education, experience, and project entries stored in structured JSON format.
- **GitHub Profile Metadata:** Public repository names, descriptions, languages, star counts, and last update timestamps fetched from GitHub APIs.
- **Job & Company Research:** Target job postings and public engineering context. *(Note: Company research data pertains to corporate entities and contains no student PII).*

## 3. Ephemeral Resume Handling
Uploaded raw resume files (PDF/DOCX) are parsed in-memory and converted into structured JSON representations. Raw uploaded file binaries are immediately discarded after parsing to eliminate superfluous file storage and mitigate data breach risks.

## 4. Retention & Soft-Delete Cascading
- Student data is retained strictly as long as the account remains active.
- User records utilize a `deleted_at` soft-delete timestamp. When deletion is requested, all associated student profiles, fit analyses, and tailored application packages are marked deleted and excluded from active queries before automated hard cleanup.

## 5. Account & Data Deletion
Students can request full deletion of their personal data at any time via the `DELETE /api/profile` endpoint. Upon execution, all stored candidate profiles, parsed resume data, and fit history are irreversibly removed from active systems.
