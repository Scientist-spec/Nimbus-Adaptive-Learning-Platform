-- Sample quiz questions for testing the Nimbus platform
-- Run this after the initial migration to populate the question bank

-- Math questions
INSERT INTO public.items (type, prompt, options, answer, explanation, hints, tags, difficulty, bloom_level) VALUES
(
  'mcq',
  'What is the derivative of x²?',
  '["2x", "x", "2", "x²"]'::jsonb,
  '2x',
  'The power rule states that the derivative of xⁿ is n·xⁿ⁻¹. For x², we get 2·x²⁻¹ = 2x.',
  ARRAY['Remember the power rule', 'Bring down the exponent and reduce it by 1'],
  ARRAY['math', 'calculus', 'derivatives'],
  3,
  'apply'
),
(
  'mcq',
  'What is 15% of 200?',
  '["30", "25", "20", "35"]'::jsonb,
  '30',
  'To find 15% of 200, multiply 200 by 0.15: 200 × 0.15 = 30',
  ARRAY['Convert percentage to decimal', 'Multiply by the base number'],
  ARRAY['math', 'percentage', 'arithmetic'],
  2,
  'apply'
),
(
  'short_answer',
  'Solve for x: 2x + 5 = 13',
  NULL,
  '4',
  'Subtract 5 from both sides to get 2x = 8, then divide both sides by 2 to get x = 4.',
  ARRAY['Isolate the variable', 'Use inverse operations'],
  ARRAY['math', 'algebra', 'equations'],
  2,
  'apply'
);

-- Programming questions
INSERT INTO public.items (type, prompt, options, answer, explanation, hints, tags, difficulty, bloom_level) VALUES
(
  'mcq',
  'Which data structure uses LIFO (Last In First Out)?',
  '["Stack", "Queue", "Array", "Linked List"]'::jsonb,
  'Stack',
  'A stack follows the LIFO principle, where the last element added is the first one to be removed, like a stack of plates.',
  ARRAY['Think about a stack of plates', 'The last item added is removed first'],
  ARRAY['programming', 'data-structures', 'computer-science'],
  3,
  'understand'
),
(
  'mcq',
  'What is the time complexity of binary search?',
  '["O(log n)", "O(n)", "O(n²)", "O(1)"]'::jsonb,
  'O(log n)',
  'Binary search repeatedly divides the search space in half, resulting in logarithmic time complexity.',
  ARRAY['The search space is halved each time', 'Think about how many times you can divide n by 2'],
  ARRAY['programming', 'algorithms', 'complexity'],
  4,
  'analyze'
),
(
  'code',
  'Write a Python function that returns the sum of two numbers.',
  NULL,
  'def add(a, b): return a + b',
  'A simple function that takes two parameters and returns their sum using the + operator.',
  ARRAY['Use the def keyword', 'Return the result of adding the parameters'],
  ARRAY['programming', 'python', 'functions'],
  1,
  'apply'
);

-- Science questions
INSERT INTO public.items (type, prompt, options, answer, explanation, hints, tags, difficulty, bloom_level) VALUES
(
  'mcq',
  'What is the powerhouse of the cell?',
  '["Mitochondria", "Nucleus", "Ribosome", "Chloroplast"]'::jsonb,
  'Mitochondria',
  'Mitochondria are organelles that generate most of the cell''s energy in the form of ATP through cellular respiration.',
  ARRAY['Think about energy production', 'ATP is the energy currency'],
  ARRAY['science', 'biology', 'cells'],
  2,
  'remember'
),
(
  'mcq',
  'What is the chemical symbol for Gold?',
  '["Au", "Go", "Gd", "Ag"]'::jsonb,
  'Au',
  'Gold''s chemical symbol is Au, derived from its Latin name "Aurum".',
  ARRAY['Think about Latin origins', 'It''s not based on the English name'],
  ARRAY['science', 'chemistry', 'elements'],
  2,
  'remember'
),
(
  'short_answer',
  'What is the speed of light in meters per second? (Use scientific notation)',
  NULL,
  '3×10⁸',
  'The speed of light in a vacuum is approximately 299,792,458 m/s, commonly rounded to 3×10⁸ m/s.',
  ARRAY['It''s about 300 million meters per second', 'Use powers of 10'],
  ARRAY['science', 'physics', 'constants'],
  3,
  'remember'
);

-- More advanced questions
INSERT INTO public.items (type, prompt, options, answer, explanation, hints, tags, difficulty, bloom_level) VALUES
(
  'mcq',
  'What is the integral of 1/x dx?',
  '["ln|x| + C", "x²/2 + C", "1/x² + C", "e^x + C"]'::jsonb,
  'ln|x| + C',
  'The integral of 1/x is the natural logarithm of the absolute value of x, plus the constant of integration C.',
  ARRAY['This is a special case', 'Think about the natural logarithm'],
  ARRAY['math', 'calculus', 'integration'],
  4,
  'apply'
),
(
  'mcq',
  'In object-oriented programming, what is polymorphism?',
  '["The ability to take multiple forms", "A type of loop", "A way to store data", "A sorting algorithm"]'::jsonb,
  'The ability to take multiple forms',
  'Polymorphism allows objects of different classes to be treated as objects of a common parent class, enabling methods to behave differently based on the object calling them.',
  ARRAY['Think about multiple forms', 'Related to inheritance and interfaces'],
  ARRAY['programming', 'oop', 'concepts'],
  4,
  'understand'
),
(
  'short_answer',
  'What is the process by which plants make their food called?',
  NULL,
  'photosynthesis',
  'Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.',
  ARRAY['Plants use sunlight', 'Involves chlorophyll'],
  ARRAY['science', 'biology', 'plants'],
  2,
  'remember'
);

-- Create a sample quiz
INSERT INTO public.quizzes (title, description, mode, tags) VALUES
(
  'Mathematics Fundamentals',
  'Test your knowledge of basic math concepts including algebra and calculus',
  'formative',
  ARRAY['math', 'algebra', 'calculus']
),
(
  'Programming Basics',
  'Essential programming concepts and data structures',
  'formative',
  ARRAY['programming', 'computer-science']
),
(
  'General Science',
  'Biology, Chemistry, and Physics fundamentals',
  'diagnostic',
  ARRAY['science', 'biology', 'chemistry', 'physics']
);
