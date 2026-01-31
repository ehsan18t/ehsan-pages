<script lang="ts">
	/**
	 * Skills Section - Code editor-style skill showcase
	 *
	 * Features:
	 * - Mobile-first responsive design with collapsible sidebar
	 * - Real code snippets for each skill
	 * - Shiki-powered syntax highlighting
	 * - Smooth animations and transitions
	 */

	import { browser } from '$app/environment';
	import SectionTitle from '$components/ui/SectionTitle.svelte';
	import { getLanguageNameFromExtension, getSkillCounts, skillGroups } from '$data';
	import Icon from '@iconify/svelte';
	import { codeToHtml, type BundledLanguage } from 'shiki';
	import { SvelteMap } from 'svelte/reactivity';

	// ─────────────────────────────────────────────────────────────
	// Types
	// ─────────────────────────────────────────────────────────────

	interface ActiveSkill {
		name: string;
		icon: string;
		description: string;
		extension?: string;
		codeSnippet?: string;
		categoryColor: string;
	}

	// ─────────────────────────────────────────────────────────────
	// Constants
	// ─────────────────────────────────────────────────────────────

	const { fileCount } = getSkillCounts();
	const MOBILE_BREAKPOINT = 768;

	/** Map file extensions to Shiki language identifiers */
	const EXT_TO_LANG: Record<string, BundledLanguage> = {
		'.js': 'javascript',
		'.ts': 'typescript',
		'.jsx': 'jsx',
		'.tsx': 'tsx',
		'.py': 'python',
		'.html': 'html',
		'.svelte': 'svelte',
		'.astro': 'astro',
		'.css': 'css',
		'.java': 'java',
		'.sh': 'bash',
		'.bat': 'batch',
		'.yml': 'yaml',
		'.yaml': 'yaml',
		'.md': 'markdown',
		'.json': 'json',
		'.sql': 'sql',
		'.go': 'go',
		'.rs': 'rust',
		'.c': 'c',
		'.cpp': 'cpp',
		'.cs': 'csharp',
		'.rb': 'ruby',
		'.php': 'php'
	};

	// ─────────────────────────────────────────────────────────────
	// Local State
	// ─────────────────────────────────────────────────────────────

	let expandedFolders = $state<string[]>([skillGroups[0].category]);
	let activeSkill = $state<ActiveSkill | null>(null);
	let sidebarOpen = $state(true);
	let isMobile = $state(false);
	let highlightedCode = $state<string>('');

	// ─────────────────────────────────────────────────────────────
	// Derived State
	// ─────────────────────────────────────────────────────────────

	let tabName = $derived(
		activeSkill
			? `${activeSkill.name.toLowerCase().replace(/\s+/g, '-')}${activeSkill.extension || '.txt'}`
			: 'welcome.md'
	);

	let fileTypeDisplay = $derived(getLanguageNameFromExtension(activeSkill?.extension));

	let codeContent = $derived(activeSkill ? formatCode(activeSkill) : getWelcomeCode());

	let lineCount = $derived(codeContent.split('\n').length);

	// ─────────────────────────────────────────────────────────────
	// Helper Functions
	// ─────────────────────────────────────────────────────────────

	function formatCode(skill: ActiveSkill): string {
		if (skill.codeSnippet) {
			return skill.codeSnippet;
		}

		const name = skill.name;
		const nameLower = name.toLowerCase();

		// Tech-specific code snippets with jokes
		const snippets: Record<string, string> = {
			// Web Frontend
			html: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Why HTML is great</title>
</head>
<body>
  <!-- I'm not a real programming language -->
  <!-- But I'm the skeleton that holds -->
  <!-- the web together! 💀 -->
  
  <div class="container">
    <h1>HTML</h1>
    <p>Semantic markup since 1993</p>
    <!-- Divs and spans, divs and spans -->
    <!-- That's what little websites are made of -->
  </div>
</body>
</html>`,

			css: `/* CSS: Cascading Style Sheets */
/* Also known as: Constantly Struggling with Styles */

.developer {
  display: flex;
  justify-content: center; /* Easy, right? */
  align-items: center;     /* ...wait */
}

/* How to center a div: */
/* Step 1: Try everything */
/* Step 2: Cry */
/* Step 3: Use flexbox */

.centered-div {
  /* This took mass 4 hours */
  display: grid;
  place-items: center;
}

/* !important: because sometimes you just give up */`,

			javascript: `// JavaScript: The language where
// "0" == 0 is true, but "0" === 0 is false

const developer = {
  coffee: true,
  bugs: Infinity,
  sleep: null,
};

// Classic interview question
console.log(typeof NaN); // "number" 🤡

// This is fine
console.log([] + []); // ""
console.log([] + {}); // "[object Object]"
console.log({} + []); // 0 (wat?)

// The promise of a better tomorrow
async function life() {
  const happiness = await findBugs();
  return happiness; // undefined
}`,

			typescript: `// TypeScript: JavaScript that scales
// Also: "any" is not a type strategy

interface Developer {
  name: string;
  mass: number;
  mass: number;
  mass: string; // Error: still mass
}

type Bug = {
  found: 'friday-5pm' | 'before-demo' | 'production';
  severity: 'critical' | 'why-is-this-even-here';
};

// When you finally fix the types
const celebration: Promise<never> = new Promise(() => {
  // There's always one more error
});

// TypeScript: Catching bugs at compile time
// So they can surprise you at runtime instead`,

			react: `import { useState, useEffect } from 'react';

// React: Because jQuery wasn't complex enough

function Developer() {
  const [bugs, setBugs] = useState(99);
  const [coffee, setCoffee] = useState(0);

  useEffect(() => {
    // Fix one bug...
    setBugs(prev => prev - 1);
    // ...two more appear
    setBugs(prev => prev + 2);
  }, [coffee]); // missing dependency go brrr

  // The classic: "key" prop warning
  return (
    <ul>
      {Array(bugs).fill(0).map((_, i) => (
        <li key={i}>Bug #{i + 1}</li>
        {/* DON'T use index as key */}
        {/* ...unless you want chaos */}
      ))}
    </ul>
  );
}

// useEffect cleanup? Never heard of her`,

			nextjs: `// Next.js: React but make it ✨enterprise✨
// app/page.tsx

import { headers } from 'next/headers';

// Is this Server or Client? Yes.
export default async function Home() {
  // "use server" - the magic words
  const data = await fetch('/api/data', {
    cache: 'no-store', // or 'force-cache'
    // or whatever, I'll revalidate anyway
    next: { revalidate: 60 }
  });

  return (
    <main>
      {/* Hydration mismatch incoming */}
      <p>Server rendered at: {Date.now()}</p>
    </main>
  );
}

// 13 ways to fetch data in Next.js 13+
// And they're all "the right way"`,

			svelte:
				'<' +
				`script>
  // Svelte: Write less, do more
  // No virtual DOM? No problem!
  
  let count = $state(0);
  // That's it. That's the state.
  
  // No useState, no useEffect
  // Just vibes ✨
  
  $effect(() => {
    console.log("Count is:", count);
    // React devs crying rn
  });
<` +
				'/' +
				`script>

<!-- No className, just class -->
<button onclick={() => count++}>
  Clicked {count} times
</button>

<!-- Transitions? One line. -->
<div transition:fade>
  This is the way.
</div>

<` +
				`style>
  /* Scoped by default. Revolutionary! */
  button { color: orange; }
<` +
				'/' +
				`style>`,

			redux: `// Redux: Predictable state container
// Also predictably verbose

import { createSlice } from '@reduxjs/toolkit';

const developerSlice = createSlice({
  name: 'developer',
  initialState: {
    sanity: 100,
    bugs: 0,
    deployedOnFriday: false,
  },
  reducers: {
    addBug: (state) => {
      state.bugs += 1;
      state.sanity -= 10;
    },
    fixBug: (state) => {
      state.bugs += 2; // Classic
      state.sanity -= 20;
    },
    deployFriday: (state) => {
      state.deployedOnFriday = true;
      state.sanity = 0;
      state.bugs = Infinity;
    }
  }
});

// "Why didn't it update?"
// - Every Redux developer ever`,

			tailwindcss: `<!-- Tailwind CSS: Utility-first -->
<!-- Also: HTML that needs therapy -->

<div class="flex items-center justify-center
            min-h-screen bg-gradient-to-br
            from-purple-500 via-pink-500
            to-red-500 p-4 sm:p-6 md:p-8
            lg:p-12 xl:p-16 2xl:p-20">
  
  <button class="px-4 py-2 bg-blue-500
                 hover:bg-blue-600
                 active:bg-blue-700
                 focus:ring-2 focus:ring-blue-300
                 disabled:opacity-50
                 dark:bg-blue-400
                 dark:hover:bg-blue-500
                 rounded-lg shadow-md
                 transform hover:scale-105
                 transition-all duration-300">
    <!-- 47 classes later... -->
    Click me
  </button>
</div>

<!-- "Why is your HTML 300 lines?"
     "It's just one button" -->`,

			astro: `---
// Astro: Ship less JavaScript
// Finally, 0kb JS by default 🎉

const developer = await fetch('/api/me');
// This runs at BUILD time. Wild.

// Island architecture: JS only where needed
// Like React, but on a diet
---

<html>
  <body>
    <h1>Welcome to Astro!</h1>
    
    <!-- Static by default -->
    <p>This ships as pure HTML 🚀</p>
    
    <!-- Need interactivity? Add an island -->
    <ReactCounter client:load />
    <!-- client:idle, client:visible, etc -->
    
    <!-- Your lighthouse score: 100 -->
    <!-- Your users: confused but fast -->
  </body>
</html>`,

			// Backend & Data
			django: `# Django: The web framework for perfectionists
# with deadlines (and a LOT of opinions)

from django.db import models
from django.contrib.auth.models import User

class Developer(models.Model):
    """
    A developer who definitely didn't just
    copy this from the docs.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    mass = models.FloatField(default=0)  # Always 0 somehow
    mass_per_hour = models.IntegerField(default=42)
    
    def __str__(self):
        return f"{self.user.username} - mass: NaN"
    
    class Meta:
        verbose_name_plural = "Developers"
        # Django ORM: SELECT * FROM happiness
        # WHERE found = False

# python manage.py makemigrations
# python manage.py migrate
# python manage.py cry`,

			sql: `-- SQL: Structured Query Language
-- Also: "Why isn't this joining?"

SELECT 
    developers.name,
    COUNT(bugs.id) AS total_bugs,
    developers.mass,  -- Always NULL
    'Friday 5PM' AS deployment_time
FROM developers
LEFT JOIN bugs ON bugs.developer_id = developers.id
    AND bugs.status != 'fixed'  -- So... all of them
WHERE developers.coffee_level > 0
GROUP BY developers.id
HAVING COUNT(bugs.id) > 99
ORDER BY total_bugs DESC
LIMIT 1;  -- There can only be one

-- How developers see JOINs:
-- INNER JOIN: Gets some stuff
-- LEFT JOIN: Gets more stuff  
-- RIGHT JOIN: Nobody uses this
-- FULL OUTER JOIN: Gets everything (chaos)

-- DROP TABLE production; -- "It was an accident"`,

			firebase: `// Firebase: Google's "we handle the backend" service
// Until the bill arrives 💸

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore(app);

// Writing data is easy!
await setDoc(doc(db, "developers", "me"), {
  name: "Definitely Real Developer",
  mass: 0.0,
  mass_fixed: 0,
  mass_created_today: 42,
  last_mass: new Date()
});

// Security rules: "allow read, write: if true;"
// Production ready! What could go wrong?

// Firebase pricing:
// Month 1: Free tier, life is good
// Month 2: $0.50, still fine
// Month 3: Your app went viral
// Month 4: Bankruptcy

// "Your bill this month: $47,000"`,

			// Core Languages
			'c/c++': `// C++: When you need speed
// Also: When you need segfaults

#include <iostream>
#include <vector>
#include <memory>

int main() {
    // Classic C++
    int* ptr = new int(42);
    // ...500 lines later...
    // Did I delete that? 🤔
    
    // Modern C++ (we have smart pointers now!)
    auto smartPtr = std::make_unique<int>(42);
    // Memory leak? Never heard of her
    
    // The eternal question:
    std::vector<int> nums = {1, 2, 3};
    nums.push_back(4);
    // Is this O(1) or O(n)? Yes.
    
    std::cout << "Hello, Segmentation Fault!" << std::endl;
    
    return 0; // If we even get here
}

// Compiler errors: 
// "expected ';' before '}' token"
// Translation: Good luck finding it`,

			java: `// Java: Write once, debug everywhere

public class Developer {
    // Enterprise naming convention
    private static final AbstractSingletonProxyFactoryBean
        BEAN_FACTORY = new AbstractSingletonProxyFactoryBean();
    
    private int linesOfBoilerplate = Integer.MAX_VALUE;
    private String actualLogic = ""; // minimal
    
    public static void main(String[] args) {
        // Classic Java verbosity
        ArrayList<String> list = new ArrayList<String>();
        // Oh wait, we have var now (finally!)
        var modern = new ArrayList<String>();
        
        System.out.println("Hello, World!");
        // That's it. That's the whole program.
        // In 47 files and 3 interfaces.
    }
    
    // Getters, setters, builders, factories...
    // It's enterprise software, you wouldn't understand
}

// NullPointerException at line: yes`,

			python: `# Python: Code that reads like English
# Also: IndentationError: unexpected indent

def develop():
    """
    A function that does stuff.
    Type hints? Where we're going, we don't need types.
    """
    bugs = []
    
    # Pythonic way
    bugs = [bug for bug in range(99) if bug not in fixed]
    # What's fixed? We'll find out at runtime!
    
    # The GIL sends its regards
    import threading  # LOL
    
    # pip install everything
    import numpy as np
    import pandas as pd  
    import tensorflow as tf
    import my_sanity  # ModuleNotFoundError
    
    # Classic Python
    try:
        deploy_to_production()
    except Exception as e:
        pass  # This is fine 🔥

# Tabs vs spaces: Civil War
# (spaces won, obviously)`,

			php: `<?php
// PHP: Hypertext Preprocessor
// Also: Pretty Horrible Programming (jk... maybe)

class Developer {
    public $mass_fixed = 0;
    public $mass_created = PHP_INT_MAX;
    
    // Dollar signs everywhere $$$
    public function __construct($name) {
        $this->name = $name;
        // Wait, I didn't declare $this->name
        // PHP: "I'll allow it"
    }
}

// Classic PHP
$bugs = array();  // Old school
$bugs = [];       // Modern (PHP 5.4+, only 13 years ago)

// The legendary comparison
"10" == 10;     // true
"10" === 10;    // false  
"php" == 0;     // true (wat?)

echo "Hello, " . $world . "!";
// Undefined variable $world
// PHP: *shows warning, continues anyway*

// <?php or <?
// The debate that ended friendships
?>`,

			// Tools & Systems
			git: `# Git: Distributed version control
# Also: "How do I exit vim?"

$ git init
$ git add .
$ git commit -m "initial commit"
$ git commit -m "fixed bug"
$ git commit -m "actually fixed bug"
$ git commit -m "why isn't this working"
$ git commit -m "AAAAAAHHHHH"
$ git commit -m "fixed for real this time"
$ git commit -m "okay NOW it's fixed"

# The classic workflow
$ git checkout -b feature/new-thing
$ git add . && git commit -m "wip"
$ git push origin feature/new-thing
# Merge conflict detected
$ git checkout -- . # nope, start over

# Dangerous commands
$ git push --force  # YOLO
$ git reset --hard HEAD~5  # Oops
$ git reflog  # Please save me

# git blame: passive aggressive since 2005`,

			github: `# GitHub: Where code goes to be judged

README.md:

# My Awesome Project 🚀

![Build Status](https://img.shields.io/badge/build-passing-green)
![Tests](https://img.shields.io/badge/tests-what_tests-red)
![Coverage](https://img.shields.io/badge/coverage-NaN%25-yellow)

## Installation
\`\`\`bash
npm install mass-fixes  # Doesn't exist
\`\`\`

## Contributing
1. Fork this repo
2. Create a branch
3. Open a PR
4. Wait 6 months for review
5. PR is now outdated

## Issues
- [ ] Fix all the bugs
- [ ] Add more features
- [ ] Update dependencies (scary)
- [ ] Write documentation (LOL)

---
⭐ Star this repo if you've mass got here by accident!

Last updated: mass years ago`,

			linux: `#!/bin/bash
# Linux: "I use Arch, btw"

# The classic commands
$ sudo rm -rf /  # Don't try this at home
$ sudo make me a sandwich  # Actual command? No.

# Finding files
$ find / -name "*.bug" 2>/dev/null
# Result: Your entire codebase

# The eternal struggle
$ man <anything>
# "Press 'q' to exit"
# *presses every other key first*

# Package managers (pick your fighter):
$ apt install mass-fixing-skills      # Debian/Ubuntu
$ dnf install mass-fixing-skills      # Fedora
$ pacman -S mass-fixing-skills        # Arch btw
$ emerge mass-fixing-skills           # Gentoo (still compiling...)

# Permissions
$ chmod 777 everything  # This is fine
$ chown -R me:me /      # What could go wrong

# Uptime flex
$ uptime
# 420 days, 69 minutes (nice)

# "It works on my machine"
# "Your machine is the problem"`,

			bash: `#!/bin/bash
# Bash: Bourne Again Shell
# Also: Barely Acceptable Shell Hacking

# Variables (no spaces allowed, because reasons)
NAME="Developer"
BUGS=99

# The infamous
if [ "$BUGS" -gt 0 ]; then
    echo "You have mass"
    # -gt, -lt, -eq, -ne...
    # Because > and < were too easy
fi

# Loops that look like ancient spells
for bug in $(ls *.bug 2>/dev/null); do
    echo "Found bug: $bug"
    # Don't parse ls output
    # (I know, but it's funny)
done

# String manipulation: dark magic
filename="bug_report.txt"
echo "{filename%.txt}"  # bug_report
echo "{filename##*.}"   # txt
# "Just use sed" - Someone who hates you

# Exit codes
exit 0  # Success!
exit 1  # It failed, but why?
exit 2  # User error (probably)
exit 127  # Command not found (always)`,

			batch: `@echo off
REM Batch: Windows scripting from 1995
REM Still somehow relevant

SET DEVELOPER=Me
SET BUGS=99
SET SANITY=0

ECHO Hello, %DEVELOPER%!
ECHO You have %BUGS% mass to fix.
ECHO Sanity remaining: %SANITY%

REM Classic batch logic
IF %BUGS% GTR 0 (
    ECHO Time to mass...
    REM Parentheses in batch? What year is this?
)

REM The famous pause
PAUSE
REM "Press any key to continue..."
REM *presses power button*

REM Error handling? What's that?
GOTO :PRAY_IT_WORKS

:PRAY_IT_WORKS
ECHO Deploying to production...
REM GOTO considered harmful
REM (but we use it anyway)

REM The nuclear option
REM DEL /F /S /Q C:\\*.*
REM Please don't actually do this

EXIT /B 0`,

			figma: `// Figma: Design tool of champions
// Also: "Can you make it pop more?"

const design = {
  iterations: Infinity,
  clientFeedback: [
    "Can we try it in blue?",
    "Actually, make it red",
    "What about green?",
    "You know what, go back to the first one",
    "But make it pop more ✨"
  ],
  
  // Auto Layout: The holy grail
  layout: {
    display: "auto-layout", // Not flex, AUTO-LAYOUT
    gap: 8,  // Always 8px. Always.
    padding: [16, 16, 16, 16]
  },
  
  // Naming layers properly?
  layers: [
    "Rectangle 47",
    "Frame 183",
    "Group 2 Copy 5",
    "asdfasdf",  // Classic
    "DELETE THIS LATER"  // Spoiler: Never deleted
  ],
  
  handoff: "Dev mode exists now!",
  devReaction: "Finally! ...wait, what's this CSS?"
};`,

			vim: `" Vim: The editor you can't quit
" Literally. How do I exit?

" Basic survival guide:
" :q      - quit (if you haven't edited)
" :q!     - quit and lose everything  
" :wq     - save and quit
" :x      - same as :wq (but cooler)
" ZZ      - same thing (even cooler)
" <Esc>   - spam this when confused

" The journey of every Vim user:
" Day 1: How do I exit?
" Day 30: This is actually nice
" Day 365: *Installs vim plugin for everything*
" Day 500: BTW I use Neovim

" Essential .vimrc
set number          " Line numbers
set relativenumber  " For the flex
syntax on           " Colors!
set mouse=a         " Cheating? Maybe.

" The forbidden commands:
" :help   - You'll be here forever
" :Tutor  - Actually helpful
" :%s/bug/feature/g  - Mass rename (dangerous)

" Modal editing:
" i - insert (type stuff)
" v - visual (select stuff)  
" : - command (do stuff)
" <Esc> - normal (regret stuff)`,

			// Workflow & Process
			'github actions': `# GitHub Actions: YAML engineering at its finest
# .github/workflows/please-work.yml

name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]  
  schedule:
    - cron: '0 0 * * FRI'  # Deploy Friday? Bold.

jobs:
  build:
    runs-on: ubuntu-latest
    # Also: mass-macos, windows-latest
    # Pick your expensive adventure
    
    steps:
      - uses: actions/checkout@v4
        # Step 1: Get the code (revolutionary)
        
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - run: npm ci
      - run: npm test
        # Tests passed locally, right? RIGHT?
        
      - run: npm run build
        continue-on-error: true  # YOLO
        
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: |
          echo "Deploying..."
          # Actual deployment? That's a future problem`,

			jira: `// Jira: Where tickets go to die
// Also: "I'll update the ticket later"

const sprint = {
  name: "Sprint 47: Electric Boogaloo",
  commitment: 100,  // Story points committed
  delivered: 42,    // Story points done
  excuses: [
    "Blocked by dependencies",
    "Requirements changed",
    "Meetings",
    "More meetings",
    "Meeting about meetings"
  ]
};

// Ticket lifecycle
const ticket = {
  status: "In Progress",  // Since 2019
  assignee: "Someone",    // Everyone's favorite
  
  transitions: [
    "To Do → In Progress",      // Day 1
    "In Progress → In Review",  // Day 30
    "In Review → In Progress",  // Day 31
    "In Progress → Done",       // Day 90
    "Done → Reopened",          // Day 91
    // The circle of life
  ],
  
  comments: [
    "Any updates?",
    "Gentle ping",
    "Following up",
    "Bumping this",
    // Thread: 47 comments, 0 progress
  ]
};`,

			scrum: `# Scrum: Agile framework for the organized
# Also: Meetings disguised as productivity

## Daily Standup (15 min max... LOL)
- What I did yesterday: "Stuff"
- What I'm doing today: "More stuff"  
- Blockers: "Everything"

## Sprint Ceremonies:
1. Sprint Planning (2 hours → 4 hours)
2. Daily Standups (15 min → 45 min)
3. Sprint Review (1 hour → 2 hours)
4. Retrospective ("It was fine")

## Story Point Estimation:
fibonacci = [1, 2, 3, 5, 8, 13, 21, ?, ?, ?]
# "Is this a 5 or an 8?"
# *debate for 30 minutes*
# "Let's just say 5"
# *takes 3 sprints*

## Retro Action Items:
- [ ] Write better tickets
- [ ] Improve estimates  
- [ ] Communicate more
# Same items every retro since 2020

## Actual Agile: "Individuals over processes"
## Corporate Agile: "Did you update Jira?"`,

			latex: `% LaTeX: When Word isn't painful enough
% Also: Where kerning enthusiasts thrive

\\documentclass[12pt]{article}
\\usepackage{amsmath}  % Math stuff
\\usepackage{graphicx} % Images
\\usepackage{soul}     % For \\st{sanity}

\\title{Why I Switched to LaTeX}
\\author{A Slightly Unhinged Developer}
\\date{\\today}  % Dynamic! Fancy!

\\begin{document}
\\maketitle

\\section{Introduction}
Writing in LaTeX is \\textit{fun}\\footnote{Citation needed}.

% The sacred equation
\\begin{equation}
  bugs = \\lim_{deadline \\to 0} \\frac{features}{time}
\\end{equation}

% The alignment struggle
\\begin{align}
  code &= bugs + features \\\\
  bugs &= code - features \\\\
  features &= code - bugs \\quad \\text{(never true)}
\\end{align}

\\section{Conclusion}
After 47 compilation errors and 3 hours
of debugging missing braces, it works.

% \\end{document}  -- Missing this? Good luck.
\\end{document}`,

			markdown: `# Markdown: Writing docs made simple
## Also: README.md syndrome

### The Basics
- **Bold** for important stuff
- *Italic* for emphasis
- ~~Strikethrough~~ for mistakes (many)
- \`inline code\` for looking smart

### Code Blocks
\`\`\`javascript
// Look, I'm a developer!
console.log("Hello, README!");
\`\`\`

### The Classic README Structure
1. Impressive project name
2. mass badges (build passing, coverage 0%)
3. Installation (npm install prayer)
4. Usage (figure it out)
5. Contributing (good luck)
6. License (MIT, always MIT)

### Tables (the pain)
| What I Expected | What I Got |
|-----------------|------------|
| Simple formatting | This table |
| Quick docs | 2 hours of alignment |

### Links
[My Portfolio](localhost:3000)  
<!-- TODO: Deploy this someday -->

---
*Last updated: mass ago*`,

			googling: `// Googling: The most important developer skill
// Senior devs just Google faster

const searchHistory = [
  "how to mass code",
  "how to mass code stackoverflow",
  "how to mass code reddit",
  "how to mass code please help",
  "why isn't my code working",
  "error: unexpected token",
  "what is a segfault",
  "how to mass debugging",
  "how to mass mass",
  "how to mass mass mass",
  "career change options non-tech",
  "coding bootcamp refund policy",
  "how to mass code (again)"
];

// Pro tips:
// 1. Add "site:stackoverflow.com" 
// 2. Add the year for recent results
// 3. Add language name
// 4. Copy error message EXACTLY
// 5. Give up and ask ChatGPT

// The cycle:
while (true) {
  google(problem);
  findStackOverflow();
  copyPaste();
  if (works) {
    pretendYouUnderstood();
    break;
  }
  // Repeat until deadline
}`
		};

		// Look for matching snippet
		const key = nameLower.replace(/[^a-z0-9]/g, '');
		const matchedKey = Object.keys(snippets).find(
			(k) => k.replace(/[^a-z0-9]/g, '') === key || nameLower.includes(k) || k.includes(nameLower)
		);

		if (matchedKey) {
			return snippets[matchedKey];
		}

		// Fallback: Generate based on extension
		const ext = skill.extension || '.txt';

		if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
			return `// ${name}: A developer's best friend
// (or worst enemy, depends on the day)

const skill = {
  name: "${name}",
  mass: 0, // Always 0, somehow
  mass_fixed: Infinity, // Sure, Jan
  
  describe() {
    return "${skill.description}";
  },
  
  estimate(task) {
    // The universal formula
    return task.estimate * 3 + "weeks";
  }
};

export default skill;

// TODO: Add more features
// FIXME: This todo has been here for mass`;
		}

		if (ext === '.py') {
			return `# ${name}: The Pythonic Way
# import antigravity  # This is real, try it

class ${name.replace(/[^a-zA-Z]/g, '')}:
    """
    ${skill.description}
    """
    
    def __init__(self):
        self.bugs = float('inf')
        self.coffee = True
        self.mass = None  # As always
        
    def __str__(self):
        return f"Still figuring out {self.__class__.__name__}"
    
    @property
    def is_working(self):
        # Schrodinger's code
        import random
        return random.choice([True, False])

# if __name__ == "__main__":
#     # This will mass work on your machine`;
		}

		// Default fallback
		return `// ${name}
// ${'-'.repeat(name.length)}
//
// ${skill.description}
//
// Status: It works on my machine`;
	}

	function getWelcomeCode(): string {
		return `/**
 * Welcome to my Skills Explorer
 * ============================
 *
 * Browse my tech stack in the file explorer.
 * Click on any file to view details.
 *
 * Each skill shows:
 *   - A code representation
 *   - My experience description
 */`;
	}

	function getLang(ext: string | undefined): BundledLanguage {
		return EXT_TO_LANG[ext || ''] || 'plaintext';
	}

	/** Cache for highlighted code to avoid re-rendering */
	const highlightCache = new SvelteMap<string, string>();

	async function highlightWithShiki(code: string, ext: string | undefined): Promise<string> {
		const cacheKey = `${ext || 'txt'}:${code}`;

		// Return cached result if available
		if (highlightCache.has(cacheKey)) {
			return highlightCache.get(cacheKey)!;
		}

		const lang = getLang(ext);
		try {
			const html = await codeToHtml(code, {
				lang,
				theme: 'github-dark'
			});
			// Cache the result
			highlightCache.set(cacheKey, html);
			return html;
		} catch {
			// Fallback: escape HTML and return plain
			const fallback = `<pre class="shiki"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
			highlightCache.set(cacheKey, fallback);
			return fallback;
		}
	}

	// ─────────────────────────────────────────────────────────────
	// Effects
	// ─────────────────────────────────────────────────────────────

	// Mobile detection
	$effect(() => {
		if (!browser) return;

		const checkMobile = () => {
			isMobile = window.innerWidth < MOBILE_BREAKPOINT;
			if (isMobile) {
				sidebarOpen = false;
			}
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	});

	// Syntax highlighting with Shiki
	$effect(() => {
		const code = codeContent;
		const ext = activeSkill?.extension;

		highlightWithShiki(code, ext).then((html) => {
			highlightedCode = html;
		});
	});

	// ─────────────────────────────────────────────────────────────
	// Event Handlers
	// ─────────────────────────────────────────────────────────────

	function toggleFolder(category: string): void {
		if (expandedFolders.includes(category)) {
			expandedFolders = expandedFolders.filter((c) => c !== category);
		} else {
			expandedFolders = [...expandedFolders, category];
		}
	}

	function collapseAllFolders(): void {
		expandedFolders = [];
	}

	function openSkill(skill: (typeof skillGroups)[0]['skills'][0], categoryColor: string): void {
		activeSkill = {
			...skill,
			categoryColor
		};
		if (isMobile) {
			sidebarOpen = false;
		}
	}

	function closeTab(): void {
		activeSkill = null;
	}

	function toggleSidebar(): void {
		sidebarOpen = !sidebarOpen;
	}
</script>

<section id="skills" class="py-20 md:py-28">
	<div class="container mx-auto px-4">
		<SectionTitle
			p1="My"
			p2="Toolkit"
			subtitle="An interactive overview of the technologies I use. Click on a file to learn more."
		/>

		<!-- Code Editor Structure -->
		<div class="editor-wrapper">
			<!-- Mobile overlay when sidebar is open -->
			{#if isMobile && sidebarOpen}
				<button
					class="sidebar-overlay"
					onclick={() => (sidebarOpen = false)}
					aria-label="Close sidebar"
				></button>
			{/if}

			<!-- Sidebar (File Tree) -->
			<aside class="sidebar" class:open={sidebarOpen} class:mobile={isMobile}>
				<div class="sidebar-header">
					<span>Explorer</span>
					<div class="sidebar-actions">
						<button title="Collapse All" class="sidebar-btn" onclick={collapseAllFolders}>
							<Icon icon="mdi:chevron-double-up" width={14} height={14} />
						</button>
						{#if isMobile}
							<button
								title="Close Sidebar"
								class="sidebar-btn"
								onclick={() => (sidebarOpen = false)}
							>
								<Icon icon="mdi:close" width={14} height={14} />
							</button>
						{/if}
					</div>
				</div>

				<div class="file-tree">
					{#each skillGroups as group (group.category)}
						{@const isExpanded = expandedFolders.includes(group.category)}
						<div class="folder-item">
							<button class="folder-header" onclick={() => toggleFolder(group.category)}>
								<span class="folder-arrow" class:expanded={isExpanded}>
									<Icon icon="mdi:chevron-right" width={16} height={16} />
								</span>
								<Icon icon={group.icon} width={16} height={16} class="folder-icon" />
								<span class="folder-name">{group.category}</span>
								<span class="folder-count">{group.skills.length}</span>
							</button>

							{#if isExpanded}
								<ul class="skill-list">
									{#each group.skills as skill (skill.name)}
										<li>
											<button
												class="file-item"
												class:active={activeSkill?.name === skill.name}
												onclick={() => openSkill(skill, group.color)}
											>
												<Icon
													icon={skill.icon}
													width={16}
													height={16}
													style="color: {group.color};"
												/>
												<span class="file-name">{skill.name}</span>
												{#if skill.extension}
													<span class="file-ext">{skill.extension}</span>
												{/if}
											</button>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/each}
				</div>
			</aside>

			<!-- Main Content -->
			<main class="main-content">
				<!-- Tab Bar -->
				<div class="tab-bar">
					{#if isMobile}
						<button
							class="menu-btn"
							class:hint={!activeSkill}
							onclick={toggleSidebar}
							aria-label="Toggle sidebar"
							title="Browse skills"
						>
							<Icon icon="mdi:menu" width={18} height={18} />
							{#if !activeSkill}
								<span class="menu-hint">Skills</span>
							{/if}
						</button>
					{/if}

					<div class="tab active">
						{#if activeSkill}
							<Icon
								icon={activeSkill.icon}
								width={14}
								height={14}
								style="color: {activeSkill.categoryColor};"
							/>
						{:else}
							<Icon icon="mdi:file-document-outline" width={14} height={14} />
						{/if}
						<span class="tab-name">{tabName}</span>
						{#if activeSkill}
							<button class="tab-close" onclick={closeTab} aria-label="Close tab">
								<Icon icon="mdi:close" width={12} height={12} />
							</button>
						{/if}
					</div>
				</div>

				<!-- Editor Pane -->
				<div class="editor-pane">
					<!-- Line numbers -->
					<div class="line-numbers" aria-hidden="true">
						{#each Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i) as line (line)}
							<span>{line + 1}</span>
						{/each}
					</div>

					<!-- Code content - Shiki output -->
					<div class="code-content">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output is trusted -->
						{@html highlightedCode}
					</div>
				</div>

				<!-- Status Bar -->
				<footer class="status-bar">
					<div class="status-left">
						<span class="status-item">
							<Icon icon="mdi:source-branch" width={14} height={14} />
							main
						</span>
						<span class="status-item hidden sm:flex">
							<Icon icon="mdi:file-multiple" width={14} height={14} />
							{fileCount} files
						</span>
					</div>
					<div class="status-right">
						<span class="status-item">{fileTypeDisplay}</span>
						<span class="status-item hidden sm:flex">Ln {lineCount}</span>
						<span class="status-item">UTF-8</span>
					</div>
				</footer>
			</main>
		</div>
	</div>
</section>

<style>
	.editor-wrapper {
		position: relative;
		display: flex;
		max-width: 64rem;
		margin: 0 auto;
		height: min(70vh, 550px);
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid oklch(var(--foreground) / 0.1);
		background: color-mix(in oklch, rgb(var(--background)), black 30%);
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.25),
			0 0 0 1px oklch(var(--foreground) / 0.05);
	}

	/* Sidebar Overlay for Mobile */
	.sidebar-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 40;
		border: none;
		cursor: pointer;
		border-radius: 0.5rem;
	}

	/* Sidebar */
	.sidebar {
		width: 240px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background: color-mix(in oklch, rgb(var(--background)), black 40%);
		border-right: 1px solid oklch(var(--foreground) / 0.1);
		overflow: hidden;
		transition:
			transform 0.3s ease,
			width 0.3s ease;
	}

	.sidebar.mobile {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: 260px;
		max-width: 80%;
		z-index: 50;
		transform: translateX(-100%);
		border-radius: 0.5rem 0 0 0.5rem;
	}

	.sidebar.mobile.open {
		transform: translateX(0);
	}

	@media (max-width: 767px) {
		.sidebar:not(.mobile) {
			display: none;
		}
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(var(--foreground) / 0.6);
		border-bottom: 1px solid oklch(var(--foreground) / 0.05);
	}

	.sidebar-actions {
		display: flex;
		gap: 0.25rem;
	}

	.sidebar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 4px;
		background: transparent;
		border: none;
		color: oklch(var(--foreground) / 0.6);
		cursor: pointer;
		transition: all 0.2s;
	}

	.sidebar-btn:hover {
		background: oklch(var(--accent-500) / 0.15);
		color: oklch(var(--accent-text));
	}

	.file-tree {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
		scrollbar-width: thin;
		scrollbar-color: oklch(var(--foreground) / 0.2) transparent;
	}

	.folder-item {
		margin-bottom: 0.25rem;
	}

	.folder-header {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0.375rem 0.5rem;
		border: none;
		background: transparent;
		border-radius: 4px;
		cursor: pointer;
		color: oklch(var(--foreground) / 0.9);
		font-size: 0.8125rem;
		transition: background 0.15s;
		text-align: left;
	}

	.folder-header:hover {
		background: oklch(var(--accent-500) / 0.1);
	}

	.folder-arrow {
		display: flex;
		align-items: center;
		transition: transform 0.2s;
		color: oklch(var(--foreground) / 0.5);
	}

	.folder-arrow.expanded {
		transform: rotate(90deg);
	}

	:global(.folder-icon) {
		margin: 0 0.375rem;
		color: oklch(var(--accent-300));
	}

	.folder-name {
		flex: 1;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.folder-count {
		font-size: 0.7rem;
		color: oklch(var(--foreground) / 0.4);
		margin-left: 0.5rem;
	}

	.skill-list {
		list-style: none;
		margin: 0;
		padding: 0.25rem 0 0.25rem 1.25rem;
	}

	.file-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.3rem 0.5rem;
		border: none;
		background: transparent;
		border-radius: 4px;
		cursor: pointer;
		color: oklch(var(--foreground) / 0.7);
		font-size: 0.8125rem;
		transition: all 0.15s;
		text-align: left;
	}

	.file-item:hover {
		background: oklch(var(--accent-500) / 0.1);
		color: oklch(var(--foreground));
	}

	.file-item.active {
		background: oklch(var(--accent-500) / 0.15);
		color: oklch(var(--accent-text));
	}

	.file-name {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-ext {
		font-size: 0.7rem;
		color: oklch(var(--foreground) / 0.4);
	}

	/* Main Content */
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
	}

	/* Tab Bar */
	.tab-bar {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		background: color-mix(in oklch, rgb(var(--background)), black 40%);
		border-bottom: 1px solid oklch(var(--foreground) / 0.1);
	}

	.menu-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		min-width: 40px;
		padding: 0 0.75rem;
		height: 36px;
		background: transparent;
		border: none;
		border-right: 1px solid oklch(var(--foreground) / 0.1);
		color: oklch(var(--foreground) / 0.7);
		cursor: pointer;
		transition: all 0.2s;
	}

	.menu-btn:hover {
		background: oklch(var(--accent-500) / 0.1);
		color: oklch(var(--accent-text));
	}

	.menu-btn.hint {
		background: oklch(var(--accent-500) / 0.15);
		color: oklch(var(--accent-text));
		animation: pulse-hint 2s ease-in-out infinite;
	}

	.menu-hint {
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	@keyframes pulse-hint {
		0%,
		100% {
			background: oklch(var(--accent-500) / 0.15);
		}
		50% {
			background: oklch(var(--accent-500) / 0.3);
		}
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.8125rem;
		color: oklch(var(--foreground) / 0.6);
		border-right: 1px solid oklch(var(--foreground) / 0.1);
		background: transparent;
	}

	.tab.active {
		background: color-mix(in oklch, rgb(var(--background)), black 25%);
		color: oklch(var(--foreground));
		border-bottom: 1px solid oklch(var(--accent-500));
		margin-bottom: -1px;
	}

	.tab-name {
		max-width: 150px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tab-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 4px;
		background: transparent;
		border: none;
		color: oklch(var(--foreground) / 0.4);
		cursor: pointer;
		opacity: 0;
		transition: all 0.15s;
	}

	.tab:hover .tab-close {
		opacity: 1;
	}

	.tab-close:hover {
		background: oklch(var(--foreground) / 0.1);
		color: oklch(var(--foreground));
	}

	/* Editor Pane */
	.editor-pane {
		flex: 1;
		display: flex;
		overflow: auto;
		min-height: 0;
		background: color-mix(in oklch, rgb(var(--background)), black 25%);
	}

	.line-numbers {
		display: flex;
		flex-direction: column;
		padding: 1rem 0;
		min-width: 3rem;
		text-align: right;
		font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
		font-size: 0.8125rem;
		line-height: 1.6;
		color: oklch(var(--foreground) / 0.3);
		background: color-mix(in oklch, rgb(var(--background)), black 30%);
		border-right: 1px solid oklch(var(--foreground) / 0.05);
		user-select: none;
	}

	.line-numbers span {
		padding-right: 1rem;
	}

	.code-content {
		flex: 1;
		padding: 0;
		overflow: visible;
	}

	/* Shiki output styling */
	.code-content :global(pre.shiki) {
		margin: 0;
		padding: 1rem 1.5rem;
		background: transparent !important;
		font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
		font-size: 0.8125rem;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.code-content :global(pre.shiki code) {
		background: transparent;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
	}

	/* Status Bar */
	.status-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		color: oklch(var(--foreground) / 0.6);
		background: color-mix(in oklch, rgb(var(--background)), black 45%);
		border-top: 1px solid oklch(var(--foreground) / 0.1);
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	/* Responsive */
	@media (max-width: 639px) {
		.editor-wrapper {
			height: 450px;
		}

		.line-numbers {
			min-width: 2.5rem;
			font-size: 0.75rem;
		}

		.line-numbers span {
			padding-right: 0.75rem;
		}

		.code-content :global(pre.shiki) {
			padding: 1rem;
			font-size: 0.75rem;
		}

		.status-bar {
			flex-wrap: wrap;
			gap: 0.5rem;
		}
	}
</style>
