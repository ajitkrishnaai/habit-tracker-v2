# Rule: Generating a Product Requirements Document (PRD)

## Goal

To guide an AI assistant in creating a detailed Product Requirements Document (PRD) in Markdown format, based on an initial user prompt. The PRD should be clear, actionable, and suitable for a junior developer to understand and implement the feature.

## Process

1.  **Receive Initial Prompt:** The user provides a brief description or request for a new feature or functionality.
2.  **Ask Clarifying Questions:** Before writing the PRD, the AI *must* ask clarifying questions to gather sufficient detail. The goal is to understand the "what" and "why" of the feature, not necessarily the "how" (which the developer will figure out). Make sure to provide options in letter/number lists so I can respond easily with my selections.
3.  **Generate PRD:** Based on the initial prompt and the user's answers to the clarifying questions, generate a PRD using the structure outlined below.
4.  **Save PRD:** Save the generated document as `[n]-prd-[feature-name].md` inside the `/tasks` directory. (Where `n` is a zero-padded 4-digit sequence starting from 0001, e.g., `0001-prd-user-authentication.md`, `0002-prd-dashboard.md`, etc.)

## Clarifying Questions (Examples)

The AI should adapt its questions based on the prompt, but here are common areas to explore. **Always provide options in letter/number lists** for easy user response:

### Core Requirements
*   **Problem/Goal:** "What problem does this feature solve for the user?" or "What is the main goal we want to achieve with this feature?"
*   **Target User:** "Who is the primary user of this feature?"
*   **Core Functionality:** "Can you describe the key actions a user should be able to perform with this feature?"
*   **User Stories:** "Could you provide a few user stories? (e.g., As a [type of user], I want to [perform an action] so that [benefit].)"
*   **Acceptance Criteria:** "How will we know when this feature is successfully implemented? What are the key success criteria?"
*   **Scope/Boundaries:** "Are there any specific things this feature *should not* do (non-goals)?"

### Technical & Platform
*   **Platform/Technology:** "What platform should this run on?" (A) Web app, B) Mobile app, C) Desktop app, D) API/Backend service)
*   **Technology Stack:** "Do you have technology preferences?" (A) React/Vue/Angular, B) Node.js/Python/Java, C) No preference, D) Match existing stack)
*   **Data Storage:** "How should data be stored?" (A) Local storage, B) Cloud database, C) Existing system, D) No preference)
*   **Authentication:** "What authentication is needed?" (A) No auth, B) Simple login, C) OAuth/SSO, D) Anonymous users)

### Data & Integration
*   **Data Requirements:** "What kind of data does this feature need to display or manipulate?"
*   **External Integrations:** "Does this need to integrate with existing systems, APIs, or third-party services?"
*   **Data Migration:** "Is there existing data that needs to be imported or migrated?"
*   **Data Export:** "Do users need to export or backup their data?"

### User Experience & Design
*   **Design/UI:** "Are there any existing design mockups or UI guidelines to follow?" or "Can you describe the desired look and feel?"
*   **User Flow:** "Can you walk through the typical user journey for this feature?"
*   **Accessibility:** "Are there specific accessibility requirements?" (A) Standard compliance, B) Enhanced accessibility, C) Screen reader support, D) No special requirements)
*   **Mobile Responsiveness:** "How important is mobile support?" (A) Mobile-first, B) Mobile-friendly, C) Desktop-focused, D) Mobile not needed)

### Performance & Scale
*   **Performance Requirements:** "Are there specific performance expectations?" (A) Under 2 seconds load time, B) Real-time updates, C) Offline capability, D) Standard performance)
*   **Scale Expectations:** "How many users/data volume do you expect?" (A) Personal use, B) Small team, C) Hundreds of users, D) Thousands+ users)
*   **Availability:** "What are the uptime requirements?" (A) Best effort, B) Business hours, C) 24/7 availability, D) Not critical)

### Security & Compliance
*   **Security Requirements:** "Are there specific security needs?" (A) Standard security, B) Data encryption, C) Compliance requirements, D) Public data)
*   **Privacy Concerns:** "Are there privacy considerations for user data?"
*   **Compliance:** "Are there regulatory requirements?" (GDPR, HIPAA, etc.)

### Error Handling & Edge Cases
*   **Edge Cases:** "Are there any potential edge cases or error conditions we should consider?"
*   **Error Recovery:** "How should the system handle failures or errors?"
*   **Data Validation:** "What validation rules are needed for user inputs?"

## PRD Structure

The generated PRD should include the following sections:

### Core Sections
1.  **Introduction/Overview:** Briefly describe the feature and the problem it solves. State the goal.
2.  **Goals:** List the specific, measurable objectives for this feature.
3.  **User Stories:** Detail the user narratives describing feature usage and benefits.
4.  **Functional Requirements:** List the specific functionalities the feature must have. Use clear, concise language (e.g., "The system must allow users to upload a profile picture."). Number these requirements.
5.  **Non-Goals (Out of Scope):** Clearly state what this feature will *not* include to manage scope.

### Technical Sections
6.  **Technical Considerations:** Include technology stack, architecture decisions, dependencies, and integration requirements.
7.  **Performance Requirements:** Specify load time, response time, throughput, and scalability needs.
8.  **Security & Compliance:** Detail authentication, authorization, data protection, and regulatory requirements.
9.  **Data Requirements:** Describe data models, storage needs, migration requirements, and data flow.

### Design & User Experience
10. **Design Considerations:** Link to mockups, describe UI/UX requirements, accessibility needs, and responsive design.
11. **User Experience Flow:** Detail the step-by-step user journey through the feature.
12. **Error Handling:** Specify how errors, edge cases, and validation should be handled.

### Measurement & Validation
13. **Success Metrics:** How will the success of this feature be measured? (e.g., "Increase user engagement by 10%", "Reduce support tickets related to X").
14. **Acceptance Criteria:** Specific, testable criteria that define when the feature is complete.
15. **Open Questions:** List any remaining questions or areas needing further clarification.

## Target Audience

Assume the primary reader of the PRD is a **junior developer**. Therefore:

* **Requirements should be explicit and unambiguous** - avoid assumptions
* **Use clear, simple language** - minimize technical jargon
* **Provide sufficient context** - explain the "why" behind requirements
* **Include examples** where helpful for clarity
* **Number all requirements** for easy reference
* **Define any domain-specific terms** that must be used
* **Structure information logically** from high-level goals to specific details

## Output

*   **Format:** Markdown (`.md`)
*   **Location:** `/tasks/`
*   **Filename:** `[n]-prd-[feature-name].md`

## Process Guidelines

### Question Strategy
1. **Group related questions** to avoid overwhelming the user
2. **Ask 5-8 questions at a time** maximum, focusing on the most critical areas first
3. **Always provide multiple choice options** (A, B, C, D) for easier responses
4. **Adapt questions** based on the feature type and complexity
5. **Follow up** with additional questions based on user responses

### PRD Generation Process
1. **Phase 1:** Ask core requirement questions (problem, users, functionality)
2. **Phase 2:** Ask technical and platform questions
3. **Phase 3:** Ask design and user experience questions
4. **Phase 4:** Ask performance, security, and scale questions
5. **Generate Initial PRD:** Create comprehensive PRD based on all responses
6. **Review & Refine:** Ask if any sections need clarification or expansion

## Final Instructions

1. **Do NOT start implementing** the PRD - only create the requirements document
2. **Always ask clarifying questions first** - never generate a PRD without user input
3. **Use the structured question approach** outlined above
4. **Create comprehensive PRDs** that include all relevant sections
5. **Validate completeness** by asking if anything is missing before finalizing