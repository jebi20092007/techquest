import { ChallengeQuestion } from '../types/game';

export const CHALLENGE_BANK: ChallengeQuestion[] = [
  // 1. Data Structures
  {
    id: 'CHAL_DS_01',
    category: 'Data Structures',
    question: 'What is the average time complexity of searching for an element in a Hash Table with a uniform hash function?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correctAnswerIndex: 0,
    explanation: 'Hash tables offer constant time O(1) average lookup assuming collisions are evenly distributed.',
  },
  {
    id: 'CHAL_DS_02',
    category: 'Data Structures',
    question: 'Which data structure follows the Last-In, First-Out (LIFO) access pattern?',
    options: ['Queue', 'Stack', 'Doubly Linked List', 'Binary Min-Heap'],
    correctAnswerIndex: 1,
    explanation: 'A Stack is inherently LIFO: the last pushed item is the first one popped.',
  },
  {
    id: 'CHAL_DS_03',
    category: 'Data Structures',
    question: 'In a Doubly Linked List, how many pointer references does an internal node hold?',
    options: ['One (Next only)', 'Two (Prev & Next)', 'Three (Parent & Children)', 'Zero'],
    correctAnswerIndex: 1,
    explanation: 'Each internal node in a Doubly Linked List holds two pointers: prev and next.',
  },
  {
    id: 'CHAL_DS_04',
    category: 'Data Structures',
    question: 'What is the maximum number of children any node can have in a Binary Search Tree?',
    options: ['1', '2', '3', 'Unlimited'],
    correctAnswerIndex: 1,
    explanation: 'A binary tree node can have at most two children: left and right.',
  },
  {
    id: 'CHAL_DS_05',
    category: 'Data Structures',
    question: 'How does a Circular Queue distinguish between an empty queue and full queue using indices?',
    options: [
      'By tracking count or keeping one empty sentinel slot',
      'By dynamically freeing memory on read',
      'By reversing array traversal order',
      'It cannot be distinguished without an external database'
    ],
    correctAnswerIndex: 0,
    explanation: 'Circular queues either track an explicit count variable or reserve one buffer slot to separate full from empty.',
  },

  // 2. Mathematics
  {
    id: 'CHAL_MATH_01',
    category: 'Mathematics',
    question: 'What is the value of 2⁸ (2 raised to the power of 8)?',
    options: ['128', '256', '512', '1024'],
    correctAnswerIndex: 1,
    explanation: '2⁸ = 256, representing 1 byte of possible bit patterns (0 to 255).',
  },
  {
    id: 'CHAL_MATH_02',
    category: 'Mathematics',
    question: 'If log₂(x) = 6, what is the value of x?',
    options: ['32', '36', '64', '128'],
    correctAnswerIndex: 2,
    explanation: '2⁶ = 64, so x = 64.',
  },
  {
    id: 'CHAL_MATH_03',
    category: 'Mathematics',
    question: 'What is 15 modulo 4 (15 % 4)?',
    options: ['1', '2', '3', '4'],
    correctAnswerIndex: 2,
    explanation: '15 divided by 4 equals 3 with a remainder of 3.',
  },
  {
    id: 'CHAL_MATH_04',
    category: 'Mathematics',
    question: 'What is the sum of integers from 1 to 10 (1 + 2 + ... + 10)?',
    options: ['45', '50', '55', '60'],
    correctAnswerIndex: 2,
    explanation: 'Using Gauss formula n(n+1)/2 = 10(11)/2 = 55.',
  },

  // 3. Prime Numbers
  {
    id: 'CHAL_PRIME_01',
    category: 'Prime numbers',
    question: 'Which of the following numbers is a prime number?',
    options: ['21', '27', '31', '35'],
    correctAnswerIndex: 2,
    explanation: '31 has only two distinct positive divisors: 1 and 31.',
  },
  {
    id: 'CHAL_PRIME_02',
    category: 'Prime numbers',
    question: 'What is the only even prime number?',
    options: ['0', '2', '4', 'There are none'],
    correctAnswerIndex: 1,
    explanation: '2 is the only even prime, as all larger even numbers are divisible by 2.',
  },
  {
    id: 'CHAL_PRIME_03',
    category: 'Prime numbers',
    question: 'Which ancient algorithmic sieve finds all primes up to a specified integer n?',
    options: ['Sieve of Eratosthenes', 'Euclidean Algorithm', 'Dijkstra Sieve', 'Karatsuba Sieve'],
    correctAnswerIndex: 0,
    explanation: 'The Sieve of Eratosthenes systematically marks multiples of each prime starting from 2.',
  },
  {
    id: 'CHAL_PRIME_04',
    category: 'Prime numbers',
    question: 'How many prime numbers exist between 1 and 10 inclusive?',
    options: ['3', '4 (2, 3, 5, 7)', '5', '6'],
    correctAnswerIndex: 1,
    explanation: 'The prime numbers $\\le 10$ are 2, 3, 5, and 7 (total of 4).',
  },

  // 4. Logical Reasoning
  {
    id: 'CHAL_LOGIC_01',
    category: 'Logical reasoning',
    question: 'In Boolean logic, what is the output of (TRUE AND FALSE) OR (NOT FALSE)?',
    options: ['TRUE', 'FALSE', 'NULL', 'Undefined'],
    correctAnswerIndex: 0,
    explanation: '(TRUE AND FALSE) is FALSE; (NOT FALSE) is TRUE; FALSE OR TRUE evaluates to TRUE.',
  },
  {
    id: 'CHAL_LOGIC_02',
    category: 'Logical reasoning',
    question: 'According to De Morgan\'s Laws, NOT (A AND B) is logically equivalent to:',
    options: ['(NOT A) AND (NOT B)', '(NOT A) OR (NOT B)', 'NOT A AND B', 'A OR B'],
    correctAnswerIndex: 1,
    explanation: 'De Morgan\'s law states: ¬(A ∧ B) ≡ (¬A) ∨ (¬B).',
  },
  {
    id: 'CHAL_LOGIC_03',
    category: 'Logical reasoning',
    question: 'If All X are Y, and No Y are Z, what must necessarily be true?',
    options: ['All X are Z', 'No X are Z', 'Some Z are X', 'All Z are Y'],
    correctAnswerIndex: 1,
    explanation: 'Since all X reside inside Y, and Y and Z share no intersection, no X can belong to Z.',
  },

  // 5. Number Sequences
  {
    id: 'CHAL_SEQ_01',
    category: 'Number sequences',
    question: 'What is the next number in the Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, ...?',
    options: ['11', '12', '13', '15'],
    correctAnswerIndex: 2,
    explanation: 'Each Fibonacci term is the sum of the two preceding terms: 5 + 8 = 13.',
  },
  {
    id: 'CHAL_SEQ_02',
    category: 'Number sequences',
    question: 'Identify the next term in the geometric sequence: 2, 6, 18, 54, ...',
    options: ['108', '144', '162', '216'],
    correctAnswerIndex: 2,
    explanation: 'The common ratio is 3 (2×3=6, 6×3=18, 18×3=54, 54×3=162).',
  },
  {
    id: 'CHAL_SEQ_03',
    category: 'Number sequences',
    question: 'What is the next power of two: 16, 32, 64, 128, ...?',
    options: ['196', '256', '512', '248'],
    correctAnswerIndex: 1,
    explanation: 'Each step doubles the preceding value: 128 × 2 = 256.',
  },

  // 6. Basic Programming Logic
  {
    id: 'CHAL_CODE_01',
    category: 'Basic programming logic',
    question: 'In a 0-indexed array of length 5, what is the index of the last element?',
    options: ['4', '5', '0', '-1'],
    correctAnswerIndex: 0,
    explanation: 'In 0-indexed systems, an array with n items has indices from 0 up to n - 1 (here, 4).',
  },
  {
    id: 'CHAL_CODE_02',
    category: 'Basic programming logic',
    question: 'What condition causes infinite recursion resulting in a Stack Overflow?',
    options: ['Missing base case', 'Too many local variables', 'Using while instead of for', 'Array out of bounds'],
    correctAnswerIndex: 0,
    explanation: 'Without a reachable base termination condition, a recursive function calls itself indefinitely.',
  },
  {
    id: 'CHAL_CODE_03',
    category: 'Basic programming logic',
    question: 'What does the bitwise expression (x & 1) === 0 test for an integer x?',
    options: ['Whether x is negative', 'Whether x is even', 'Whether x is prime', 'Whether x is zero'],
    correctAnswerIndex: 1,
    explanation: 'The least significant bit of any even integer is 0, so (x & 1) produces 0.',
  },
];

/**
 * Returns a randomized challenge question avoiding immediately repeated questions.
 */
export function getRandomChallenge(excludedIds: string[] = []): ChallengeQuestion {
  const available = CHALLENGE_BANK.filter((q) => !excludedIds.includes(q.id));
  const pool = available.length > 0 ? available : CHALLENGE_BANK;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
