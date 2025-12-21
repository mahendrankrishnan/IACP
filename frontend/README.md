# Own Okta Frontend

A React-based frontend for the Own Okta authentication service.

## Features

- User registration and login
- Protected dashboard showing user information and JWT token
- Token decoding and claim visualization
- Configurable claim settings
- Modern, responsive UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:4500`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Features

- **Login/Register**: User authentication with email and password
- **Dashboard**: View user information and JWT token
- **Config**: Configure which claims are included in JWT tokens
- **Token Decoding**: View decoded JWT token claims

## API Integration

The frontend is configured to proxy API requests to the backend running on `http://localhost:4501`. Make sure the backend is running before using the frontend.

