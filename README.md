# SingleThread

A real-time collaborative note-taking and thread management application built with React, TypeScript, and Convex.

## Features

- Real-time collaborative note-taking
- Thread-based organization
- Modern, responsive UI built with React and Tailwind CSS
- Authentication with Convex Auth
- Real-time updates and synchronization

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Convex (database, real-time sync, authentication)
- **UI Components**: Custom components with shadcn/ui styling
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Convex account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd singleThread
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up your Convex project:
   - Create a new project at [convex.dev](https://convex.dev)
   - Follow the setup instructions to configure your environment

4. Start the development server:
```bash
pnpm run dev
```

This will start both the frontend (Vite) and backend (Convex) servers.

## Project Structure

```
singleThread/
├── convex/           # Backend code (Convex functions, schema, auth)
├── src/              # Frontend React application
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utility functions
├── public/           # Static assets
└── package.json      # Dependencies and scripts
```

## Development

- `pnpm run dev` - Start development servers
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build

## Deployment

This project is connected to the Convex deployment named `hearty-toucan-357`. To deploy your own version:

1. Create a new Convex project
2. Update the deployment configuration
3. Deploy using Convex's hosting platform

For more information on deployment, check out the [Convex documentation](https://docs.convex.dev/production/).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
