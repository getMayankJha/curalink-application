# CuraLink - AI-Powered Healthcare Connection Platform

CuraLink is an innovative platform designed to connect patients and researchers by simplifying the discovery of clinical trials, medical publications, and health experts.

## Features

### For Patients/Caregivers
- **Personalized Dashboard**: View recommendations based on your medical conditions
- **Clinical Trials Discovery**: Search and filter clinical trials relevant to your condition
- **Health Experts Directory**: Find and connect with medical experts in your area of interest
- **Publications Library**: Browse medical research papers with AI-generated summaries
- **Community Forums**: Ask questions and get answers from healthcare researchers
- **Favorites System**: Save and track clinical trials, publications, and experts

### For Researchers
- **Clinical Trials Management**: Add, update, and manage your clinical trials
- **Collaborator Network**: Connect with other researchers in your field
- **Forum Moderation**: Create communities and answer patient questions
- **Profile Showcase**: Display your specialties, research interests, and publications
- **Meeting Requests**: Manage meeting requests from patients
- **Favorites System**: Save interesting trials, publications, and potential collaborators

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite

## Setup Instructions

### Prerequisites
- Node.js 18 or higher
- A Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. The database schema has already been created via migrations. To add sample data, run the SQL in `seed-data.sql` in your Supabase SQL Editor.

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to `http://localhost:5173`

## Database Schema

The application uses a comprehensive database schema including:
- **profiles**: User accounts (patients and researchers)
- **patient_profiles**: Extended patient information
- **researcher_profiles**: Extended researcher information
- **clinical_trials**: Clinical trial listings
- **publications**: Medical research papers
- **forums**: Discussion communities
- **forum_posts**: Forum questions and posts
- **forum_replies**: Researcher replies to forum posts
- **favorites**: Saved items for users
- **meeting_requests**: Patient-researcher meeting requests
- **connections**: Researcher-to-researcher connections

All tables include Row Level Security (RLS) policies for data protection.

## User Flows

### Patient Flow
1. Sign up and select "Patient/Caregiver"
2. Complete profile with medical conditions and location
3. Access personalized dashboard showing:
   - Relevant clinical trials
   - Health experts in your area
   - Recent publications
   - Community forums
4. Save favorites and request meetings with experts

### Researcher Flow
1. Sign up and select "Researcher"
2. Complete profile with specialties and research interests
3. Access researcher dashboard to:
   - Add and manage clinical trials
   - Connect with other researchers
   - Answer patient questions in forums
   - Manage meeting requests

## Key Features

### Authentication & Security
- Secure email/password authentication via Supabase
- Role-based access control (Patient vs Researcher)
- Row Level Security on all database tables
- Session management with automatic refresh

### Personalization
- Condition-based recommendations for patients
- Specialty-based matching for researchers
- Location-aware expert discovery
- Interest-based content filtering

### Search & Discovery
- Full-text search for clinical trials
- Keyword-based publication search
- Expert search by specialty and research interest
- Filter by status, location, and other criteria

### Communication
- Meeting request system for patient-expert connections
- Forum system for Q&A
- Connection requests for researcher collaboration

## Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── patient/           # Patient-specific views
│   ├── researcher/        # Researcher-specific views
│   ├── LandingPage.tsx    # Initial landing page
│   ├── AuthModal.tsx      # Authentication modal
│   ├── PatientOnboarding.tsx
│   └── ResearcherOnboarding.tsx
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── lib/
│   └── supabase.ts       # Supabase client and types
├── App.tsx               # Main application router
└── main.tsx              # Application entry point
```

## Future Enhancements

- External API integration (PubMed, ClinicalTrials.gov)
- AI-powered content summarization
- Real-time chat between patients and experts
- Publication auto-import from ORCID/ResearchGate
- Advanced filtering and recommendation algorithms
- Email notifications for meeting requests
- Mobile application

## Contributing

This project was built as part of a hackathon challenge. For any questions or contributions, please reach out to the development team.

## License

All rights reserved.
