## Packages
framer-motion | Page transitions, streaming text effects, and collapsible panel animations
react-markdown | Rendering markdown in AI chat responses
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes safely
lucide-react | Icons (already in stack but confirming usage)
date-fns | Formatting dates for history

## Notes
The app interacts with an AI streaming endpoint via SSE (Server-Sent Events) at `/api/conversations/:id/messages`.
The backend uses Replit AI Integrations for Gemini.
Audits are stored in PostgreSQL.
The design is dark-mode first ("cyberpunk professional").
