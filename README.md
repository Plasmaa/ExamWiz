# ExamWiz

ExamWiz is an AI-powered study companion that helps you generate practice exams and flashcards from your study materials. Upload PDFs, images, or text files, and let ExamWiz create tailored questions to help you master any subject.

## Features

-   **AI Question Generation**: Automatically generates Multiple Choice Questions (MCQs) and Short Answer questions from your uploaded content.
-   **Flashcard Mode**: Create digital flashcards for quick review and active recall.
-   **Practice MCQ Mode**: Focus specifically on practicing MCQs with instant feedback.
-   **Dashboard**: Manage your uploaded chapters, generated exams, and track your progress.
-   **Responsive Design**: Study on the go with a fully responsive mobile-friendly interface.
-   **Dark Mode**: Toggle between light and dark themes for comfortable viewing in any environment.
-   **Export Options**: Export your exams to PDF, DOCX, or TXT formats.

## Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Lucide React
-   **Backend**: FastAPI, SQLAlchemy, SQLite (or PostgreSQL)
-   **AI/ML**: Groq API (Llama 3), OCR for image text extraction

## Getting Started

### Prerequisites

-   Node.js and npm
-   Python 3.8+
-   Groq API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Plasmaa/ExamWiz.git
    cd ExamWiz
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    # source venv/bin/activate
    pip install -r requirements.txt
    ```
    Create a `.env` file in the `backend` directory and add your API key:
    ```env
    GROQ_API_KEY=your_api_key_here
    ```
    Start the backend server:
    ```bash
    uvicorn main:app --reload
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the App:**
    Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## Usage

1.  **Upload**: Go to the Dashboard and click "Practice MCQ" or "Flashcards".
2.  **Configure**: Upload your study material and choose the number of questions.
3.  **Generate**: Click "Generate Questions" and wait for the AI to process your content.
4.  **Study**: Take the exam or flip through flashcards!

## License

This project is licensed under the MIT License.
