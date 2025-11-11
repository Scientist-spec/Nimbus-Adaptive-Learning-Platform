# Seed Data for Nimbus Learning Platform

This directory contains sample quiz questions to help you test the platform immediately.

## How to Add Sample Questions

The `seed_questions.sql` file contains 12 sample questions across different subjects:

### Included Questions:
- **Math** (5 questions): Calculus, algebra, percentages
- **Programming** (4 questions): Data structures, algorithms, Python
- **Science** (3 questions): Biology, chemistry, physics

### Using the Seed Data

1. **Via Cloud Tab**:
   - Go to the Cloud tab in Lovable
   - Navigate to Database → SQL Editor
   - Copy the contents of `seed_questions.sql`
   - Run the SQL commands

2. **Manual Entry**:
   - Sign in as an instructor
   - Go to Instructor Console
   - Use the "Create Question" form to add questions

## Sample Quiz Topics

The seed data creates questions tagged with:
- `math`, `calculus`, `algebra`, `percentage`
- `programming`, `data-structures`, `algorithms`, `python`
- `science`, `biology`, `chemistry`, `physics`

Students can start quizzes filtered by these tags from the Dashboard's "Quick Start Quiz" section.

## Test User Setup

To fully test the platform:

1. **Create Student Account**: Sign up normally - default role is student
2. **Create Instructor Account**: 
   - Sign up with a different email
   - Update their role to 'instructor' via SQL:
   ```sql
   INSERT INTO user_roles (user_id, role) 
   VALUES ('user-id-here', 'instructor');
   ```

## Question Types

The platform supports three question types:
- **MCQ**: Multiple choice with 2-6 options
- **Short Answer**: Text input for concise answers
- **Code**: Multi-line code input

Each question includes:
- Difficulty level (1-5)
- Tags for categorization
- Optional hints
- Explanations for learning
- Bloom's taxonomy level
