# AI Coder: Your AI-Powered Development Assistant

![Project Logo Placeholder](public/placeholder-logo.png)

## Project Description

AI Coder is an interactive development environment designed to streamline your coding workflow with the power of Artificial Intelligence. It provides a seamless experience for managing code files, interacting with an AI assistant for code generation and modification, and now features robust chat history persistence using Supabase.

## Features

-   **Interactive Code Editor:** Edit and manage your code files directly within the application.
-   **File Management Sidebar:** Easily switch between different code files.
-   **AI Chat Assistant:** Engage with an AI to:
    -   Generate new code snippets.
    -   Modify existing code.
    -   Explain complex code sections.
    -   Answer programming-related questions.
-   **AI-Powered Code Refactoring (In Progress):** Select code directly in the editor and trigger AI suggestions for refactoring or optimization.
-   **Persistent Chat History:** All your conversations with the AI assistant are now securely stored and retrieved using a Supabase PostgreSQL database, ensuring your chat history is preserved across sessions.
-   **Responsive UI:** A clean and intuitive user interface built with modern web technologies.

## Technologies Used

-   **Frontend:** Next.js, React, TypeScript
-   **Styling:** Tailwind CSS, Shadcn/ui
-   **AI Integration:** Vercel AI SDK, OpenAI (gpt-4o-mini)
-   **Database:** Supabase (PostgreSQL)
-   **Persistence:** Supabase Client Library (`@supabase/supabase-js`)
-   **Utilities:** `uuid` for unique ID generation

## Setup and Installation

Follow these steps to get your AI Coder project up and running locally.

### 1. Clone the Repository

First, clone the project repository to your local machine:

```bash
git clone https://github.com/mamudulislam/AI_codePower.git
cd AI_codePower
```

### 2. Install Dependencies

Install the required Node.js packages:

```bash
npm install
# or
yarn install
```

### 3. Supabase Project Setup

AI Coder uses Supabase for chat history persistence. You'll need to set up a Supabase project and configure your environment variables.

#### a. Create a Supabase Project

1.  Go to [Supabase.com](https://supabase.com/) and sign up or log in.
2.  Click on **"New project"**.
3.  Provide a **Name** for your project (e.g., `AICoderApp`).
4.  Set a strong **Database Password** and save it securely.
5.  Choose a **Region** close to you.
6.  Click **"Create new project"**.

#### b. Get Supabase API Keys

Once your project is created:

1.  Navigate to **"Project Settings"** (gear icon in the left sidebar).
2.  Click on **"API"**.
3.  Copy the **Project URL** (e.g., `https://<project-ref>.supabase.co`).
4.  Copy the **`anon` (public) key**.
5.  Copy the **`service_role` (secret) key**. **Keep this key secure and never expose it to client-side code.**

#### c. Configure Environment Variables

Create a `.env.local` file in the root of your project and add the following variables, replacing the placeholders with your actual keys:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

**Important:**
-   `NEXT_PUBLIC_` variables are exposed to the browser.
-   `SUPABASE_SERVICE_ROLE_KEY` (without `NEXT_PUBLIC_`) is only available on the server-side (e.g., in API routes) and must remain secret.

#### d. Define Database Schema

Create the necessary tables in your Supabase project using the **"Table Editor"** in your Supabase dashboard.

**`chats` table:**
-   **Name:** `chats`
-   **Enable Row Level Security (RLS):** ON
-   **Columns:**
    -   `id`: `uuid` (Primary Key, Default Value: `gen_random_uuid()`)
    -   `title`: `text` (Nullable: `false`)
    -   `created_at`: `timestamp with time zone` (Default Value: `now()`)
    -   `updated_at`: `timestamp with time zone` (Default Value: `now()`)

**`messages` table:**
-   **Name:** `messages`
-   **Enable Row Level Security (RLS):** ON
-   **Columns:**
    -   `id`: `uuid` (Primary Key, Default Value: `gen_random_uuid()`)
    -   `chat_id`: `uuid` (Nullable: `false`)
    -   `type`: `text` (Nullable: `false`, e.g., 'user', 'assistant')
    -   `content`: `text` (Nullable: `false`)
    -   `created_at`: `timestamp with time zone` (Default Value: `now()`)
-   **Foreign Key:**
    -   **Column:** `chat_id`
    -   **References table:** `chats`
    -   **References column:** `id`
    -   **On Delete:** `CASCADE`

### 4. Run the Development Server

After configuring Supabase and installing dependencies, start the Next.js development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

-   **File Management:** Use the left sidebar to create new files or switch between existing ones.
-   **Code Editor:** Write and modify code in the central editor panel.
-   **AI Chat:** Use the right sidebar to interact with the AI assistant. Type your queries in the input field and press Enter.
-   **Refactor with AI:** Select a block of code in the editor, and a "Refactor with AI" button will appear in the chat panel. Click it to get AI suggestions for the selected code.
-   **Persistent History:** Your chat conversations will now be saved and loaded automatically.

## Future Enhancements

-   Implement a diff view for AI refactoring suggestions to easily apply changes.
-   Add user authentication to associate chats with specific users.
-   Expand AI capabilities for more advanced code analysis and generation tasks.
-   Integrate linting and formatting tools with AI explanations.

---

Feel free to contribute to this project by submitting issues or pull requests!