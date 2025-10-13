# Rule: Generating a Task List from a PRD

## Goal

To guide an AI assistant in creating a detailed, step-by-step task list in Markdown format based on an existing Product Requirements Document (PRD). The task list should guide a developer through implementation.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `tasks-[prd-file-name].md` (e.g., `tasks-0001-prd-user-profile-editing.md`)

## Process

1.  **Receive PRD Reference:** The user points the AI to a specific PRD file
2.  **Analyze PRD:** The AI reads and analyzes the functional requirements, user stories, and other sections of the specified PRD.
3.  **Assess Current State:** Review the existing codebase to understand existing infrastructure, architectural patterns and conventions. Also, identify any existing components or features that already exist and could be relevant to the PRD requirements. Then, identify existing related files, components, and utilities that can be leveraged or need modification. If this is a new project, assess the technology stack and architectural decisions specified in the PRD.
4.  **Phase 1: Generate Parent Tasks:** Based on the PRD analysis and current state assessment, create the file and generate the main, high-level tasks required to implement the feature. Consider the technology stack and project type when organizing tasks. Common task categories include:
    - Project Setup & Configuration (for new projects)
    - Data Layer & Backend Implementation
    - Core Feature Implementation
    - User Interface & Experience
    - Testing & Quality Assurance
    - Deployment & Documentation

    Use your judgement on how many high-level tasks to use (typically 4-7 tasks). Present these tasks to the user in the specified format (without sub-tasks yet). Inform the user: "I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed."
5.  **Wait for Confirmation:** Pause and wait for the user to respond with "Go".
6.  **Phase 2: Generate Sub-Tasks:** Once the user confirms, break down each parent task into smaller, actionable sub-tasks necessary to complete the parent task. Ensure sub-tasks:
    - Logically follow from the parent task
    - Cover all implementation details implied by the PRD
    - Include technology-specific setup and configuration
    - Address testing requirements for each component
    - Consider security, performance, and accessibility requirements
    - Include error handling and edge case implementation
    - Account for documentation and deployment needs
    - Consider existing codebase patterns where relevant without being constrained by them
7.  **Identify Relevant Files:** Based on the tasks and PRD, identify potential files that will need to be created or modified. Consider the technology stack when determining file types and organization. Include:
    - Source code files (components, services, utilities)
    - Test files (unit, integration, e2e)
    - Configuration files (build tools, CI/CD, environment)
    - Documentation files (README, API docs, user guides)
    - Infrastructure files (Docker, deployment configs)
    - Asset files (styles, images, static content)
    List these under the `Relevant Files` section with clear descriptions.
8.  **Generate Final Output:** Combine the parent tasks, sub-tasks, relevant files, and notes into the final Markdown structure.
9.  **Save Task List:** Save the generated document in the `/tasks/` directory with the filename `tasks-[prd-file-name].md`, where `[prd-file-name]` matches the base name of the input PRD file (e.g., if the input was `0001-prd-user-profile-editing.md`, the output is `tasks-0001-prd-user-profile-editing.md`).

## Output Format

The generated task list _must_ follow this structure:

```markdown
# Task List: [Feature Name]

Based on PRD: `[prd-filename].md`

## Relevant Files

### Source Code
- `src/components/FeatureComponent.tsx` - Main component for this feature
- `src/hooks/useFeatureData.ts` - Custom hook for feature data management
- `src/services/featureApi.ts` - API service layer for feature
- `src/utils/featureHelpers.ts` - Utility functions for feature logic
- `src/types/feature.ts` - TypeScript interfaces and types

### Testing
- `src/components/FeatureComponent.test.tsx` - Unit tests for main component
- `src/hooks/useFeatureData.test.ts` - Tests for data management hook
- `src/services/featureApi.test.ts` - API service tests
- `src/utils/featureHelpers.test.ts` - Utility function tests
- `e2e/feature.spec.ts` - End-to-end tests for feature workflow

### Configuration & Infrastructure
- `package.json` - Dependencies and scripts
- `vite.config.ts` / `webpack.config.js` - Build configuration
- `jest.config.js` - Testing configuration
- `docker/Dockerfile` - Container configuration (if applicable)
- `.github/workflows/ci.yml` - CI/CD pipeline (if applicable)

### Documentation
- `README.md` - Project documentation updates
- `docs/api.md` - API documentation (if applicable)
- `docs/user-guide.md` - User documentation (if applicable)

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use technology-appropriate test commands (e.g., `npm test`, `yarn test`, `pytest`)
- Configuration files should match the chosen technology stack
- Include environment-specific files as needed (.env, config files)

## Tasks

- [ ] 1.0 Parent Task Title
  - [ ] 1.1 [Sub-task description 1.1]
  - [ ] 1.2 [Sub-task description 1.2]
  - [ ] 1.3 [Testing for task 1]
- [ ] 2.0 Parent Task Title
  - [ ] 2.1 [Sub-task description 2.1]
  - [ ] 2.2 [Testing for task 2]
- [ ] 3.0 Final Integration & Testing
  - [ ] 3.1 [Integration testing]
  - [ ] 3.2 [End-to-end testing]
  - [ ] 3.3 [Documentation updates]
  - [ ] 3.4 [Deployment preparation]
```

## Interaction Model

The process explicitly requires a pause after generating parent tasks to get user confirmation ("Go") before proceeding to generate the detailed sub-tasks. This ensures the high-level plan aligns with user expectations before diving into details.

## Technology-Specific Considerations

When generating tasks, consider the technology stack specified in the PRD:

### Frontend Frameworks
- **React/Next.js:** Include component structure, hooks, state management, routing
- **Vue/Nuxt.js:** Include component structure, composables, stores, routing
- **Angular:** Include components, services, modules, routing, dependency injection
- **Vanilla JavaScript:** Include modular structure, event handling, DOM manipulation

### Backend Technologies
- **Node.js/Express:** Include middleware, routes, controllers, database models
- **Python/Django/Flask:** Include views, models, serializers, middleware
- **Java/Spring:** Include controllers, services, repositories, configuration
- **Firebase:** Include Firestore rules, cloud functions, authentication setup

### Database Considerations
- **SQL Databases:** Include schema design, migrations, query optimization
- **NoSQL Databases:** Include document structure, indexing, data modeling
- **Cloud Databases:** Include setup, configuration, security rules

### Testing Strategies
- **Unit Testing:** Component/function level tests with appropriate frameworks
- **Integration Testing:** API and database integration tests
- **E2E Testing:** User workflow tests with tools like Cypress, Playwright
- **Performance Testing:** Load testing and optimization verification

### Deployment & DevOps
- **Containerization:** Docker setup and configuration
- **CI/CD:** GitHub Actions, GitLab CI, or other pipeline setup
- **Cloud Deployment:** Platform-specific deployment tasks
- **Monitoring:** Error tracking, analytics, performance monitoring

## Target Audience

Assume the primary reader of the task list is a **junior developer** who will implement the feature. Therefore:

- **Tasks should be specific and actionable** - avoid vague descriptions
- **Include clear acceptance criteria** for each sub-task
- **Provide technology-specific guidance** when relevant
- **Consider the learning curve** for unfamiliar technologies
- **Include testing requirements** for each major component
- **Reference documentation** and best practices where helpful
- **Account for common pitfalls** and edge cases in implementation
