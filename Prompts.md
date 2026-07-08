# My Prompts — Chat Support Project

This is a record of the prompts I used, in order, to build and ship this
project.

<br/>

## 1. Initial build request

```
Build a responsive, enterprise‑grade Real‑Time Chat Support web application
for an Electronics Repair Shop. The system must enable staff to manage live
customer chats efficiently, replacing manual paper and Excel workflows.

Core Requirements:
- Implement persistent WebSocket communication (Socket.io) for real‑time
  message exchange.
- Ensure instant UI updates without manual refresh.
- Handle edge cases gracefully:
  - Empty states → show "No data found."
  - Slow connectivity → show loading indicators.
  - Invalid inputs → highlight errors in red and block submission.
- Maintain security best practices: sanitize all text inputs to prevent XSS
  injection.
- Add telemetry simulation: log [Analytics] User interacted with Real‑Time
  Chat Support in console after each major action.

Non‑Functional Requirements:
- Achieve 100% Lighthouse accessibility score (ARIA labels, keyboard
  navigation).
- Use a clean, monochromatic corporate theme — professional, minimal, and
  modern. Avoid fancy fonts; use a decent, classy typeface like Inter,
  Roboto, or Open Sans.
- Maintain consistent spacing (16px/32px steps) and responsive layout for
  mobile, tablet, and desktop.
- Follow strict ESLint rules and ensure zero warnings.

Tech Stack:
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- Real‑Time: WebSocket (Socket.io)
- Database: MongoDB
- Validation: Zod
- Deployment: Vercel or Render

Definition of Done:
- Code compiles and runs without fatal errors.
- Meets all Happy and Unhappy Path criteria.
- No hardcoded API keys or sensitive data.
- UI is fully responsive and accessible across all devices.

This project is going to decide whether I get the job, so build it well
enough to seriously impress a recruiter and make a senior developer feel
like genuinely high-quality work was done. Also give me a zip file of it.
```

<br/>

## 2. Asking how to run, push, and deploy it

```
What do I need to change in this now, and how do I run it, how does it get
pushed to GitHub, and how does it get deployed?
```

<br/>

## 3. Asking for more detail

```
Walk me through everything I need to do and everything I need, in detail.
```

<br/>

## 4. Env setup question

```
Keep it short for now — what do I need for the .env file?
```

<br/>

## 5. Follow-up on a specific env variable

```
What should I put in the agent access code?
```

<br/>

## 6. MongoDB Atlas conflict question

```
My M0 cluster is already running a previous project — what should I do now?
```

<br/>

## 7. Confirming it worked, asking for deploy steps

```
Okay, it's working well now — but how exactly do I deploy it?
```

<br/>

## 8. Render deployed, asking next step

```
It's deployed on Render now — what's next?
```

<br/>

## 9. Vercel build settings question

```
What should I put in the build command and output settings?
```

<br/>

## 10. Reporting a bug (with screenshot)

```
It's showing "Unable to verify access code."
```

*(attached a screenshot of the browser console showing a CORS error)*

<br/>

## 11. Asking for improvement ideas

```
What else could make this project even better?
```

<br/>

## 12. Choosing which improvements to build

```
Go ahead and build the Tier 1 ideas.
```

<br/>

## 13. Requesting this prompt history be documented

```
Give me a Prompt.md.
```

<br/>

## 14. Clarifying the previous request

```
I want the actual prompts I used to build this project, written out.
```

<br/>

<br/>

---

**Note:** Every response to these prompts involved Claude actually writing
the code, running syntax and bundle verification, executing real test cases
against the validation and storage logic, and packaging the result as a
downloadable zip — not just describing what to do. The `README.md` and
`PROMPT.md` files in this repo cover the technical side (architecture,
requirements coverage, what was built); this file is just the prompt trail
on my end.
