##🏢 Software House OS

A comprehensive, role-based Project and Task Management operating system designed specifically for software development agencies. This system serves as a custom-tailored alternative to Jira or Trello, enforcing a strict, professional pipeline from project creation to Quality Assurance (QA) delivery.

## ✨ Key Features & Workflows

This application enforces a strict, real-world software development lifecycle across 5 distinct user roles:

* **👑 Admin Hub:** A central command matrix to manage the user directory, promote team members into specific roles, and oversee all agency operations.
* **📊 Project Manager (PM) Dashboard:** Executive transparency featuring agency-wide KPIs, global chronological activity feeds, and a granular Project Explorer to track exactly what features are being built.
* **🎯 Team Lead Workspace:** A dynamic task delegation board to monitor pending PM requests and assign tickets to specific developers based on nearest deadlines.
* **💻 Developer Kanban Board:** An interactive, drag-and-drop Kanban board (`Assigned` → `Working On` → `Ready for Testing`). Includes dynamic red-alert kickbacks if QA rejects a feature.
* **🧪 Tester (QA) Master-Detail View:** A split-screen testing environment. Testers can approve features for deployment or hit "Fail" to instantly log a bug report and warp the task back to the original developer's active board.

## 🛠️ Tech Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database:** [PostgreSQL](https://www.postgresql.org/) (Hosted on Supabase)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Authentication:** [Clerk](https://clerk.com/) (with Svix Webhooks for DB syncing)

## 🗄️ Database Schema Overview

* **User:** Stores user metadata, roles (`ADMIN`, `PM`, `TEAM_LEAD`, `DEV`, `TESTER`), and authentication IDs.
* **Project:** Groups tasks together, tracked by `status` (Active, Completed, On Hold).
* **Task:** The core unit of work. Tracks assignments, priority, current tag (column status), and deadline.
* **TaskHistory:** An immutable ledger that logs exactly who did what, and when. Powers the global activity feed and QA bug reporting.

