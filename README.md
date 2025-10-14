# Medical App

A professional medical frontend application that allows patients to securely view their medical records, appointments, medications, and health information.

## Features

- **Secure Authentication**: Login and registration system with JWT authentication
- **Patient Dashboard**: Comprehensive view of medical records and health data
- **Medical History**: View past appointments and clinical records
- **Allergies Management**: Track and view patient allergies
- **Medications**: View current prescriptions and medications
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Professional UI**: Clean, trustworthy medical-themed interface

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **JWT** - Secure authentication

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- The medical-api backend running (default: http://localhost:3000)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Siocraft/medical-app.git
cd medical-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── ProtectedRoute.tsx
├── contexts/         # React Context providers
│   └── AuthContext.tsx
├── pages/           # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Dashboard.tsx
├── services/        # API service layer
│   ├── api.ts
│   ├── authService.ts
│   └── patientService.ts
├── types/           # TypeScript type definitions
│   └── index.ts
└── App.tsx          # Main app component
```

## Features Overview

### Authentication
- User registration with email and password
- Secure login with JWT tokens
- Protected routes that require authentication
- Automatic token refresh and logout on expiration

### Patient Dashboard
- Overview cards showing summary statistics
- Medical history with appointment records
- Allergies list
- Current medications
- Responsive sidebar navigation
- Mobile-friendly interface

## Security

- All API requests include JWT authentication headers
- Tokens stored securely in localStorage
- Automatic redirect to login on 401 errors
- Password validation on registration

## Future Enhancements

- Doctor/medic portal for healthcare providers
- Ability for doctors to view and modify patient information
- Appointment scheduling
- Real-time notifications
- Document upload and management
- Lab results viewing
- Prescription refill requests

## API Integration

This app integrates with the medical-api backend. Ensure the API is running and accessible at the URL specified in your `.env` file.

Key endpoints used:
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `GET /patients/me` - Get patient data

## License

Private - Siocraft Organization

## Contributing

This is a private project. For any questions or suggestions, please contact the development team.
