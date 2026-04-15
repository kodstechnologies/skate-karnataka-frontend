src/
│
├── app/                     # App level config
│   ├── store.js             # Redux / Zustand store
│   ├── routes.jsx           # All routes
│   ├── theme.js             # MUI theme config
│
├── assets/                  # Static files
│   ├── images/
│   ├── icons/
│   └── styles/
│
├── components/              # Reusable components
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── Loader.jsx
│   │
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   │
│   └── ui/                  # MUI wrappers
│       ├── Table.jsx
│       ├── Card.jsx
│       ├── Dialog.jsx
│
├── features/                # 🔥 Main business logic (VERY IMPORTANT)
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── api.js
│   │   ├── authSlice.js
│   │   └── validation.js
│   │
│   ├── dashboard/
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   │   ├── StatsCard.jsx
│   │   │   └── Charts.jsx
│   │
│   ├── skaters/
│   │   ├── pages/
│   │   │   ├── SkaterList.jsx
│   │   │   ├── AddSkater.jsx
│   │   │   └── SkaterDetails.jsx
│   │   ├── components/
│   │   ├── api.js
│   │
│   ├── events/
│   │   ├── pages/
│   │   │   ├── EventList.jsx
│   │   │   ├── CreateEvent.jsx
│   │   │   └── EventDetails.jsx
│   │   ├── components/
│   │   ├── api.js
│   │
│   ├── results/
│   │   ├── pages/
│   │   │   ├── ResultList.jsx
│   │   │   ├── AddResult.jsx
│   │   ├── components/
│   │
│   ├── certificates/
│   │   ├── pages/
│   │   │   ├── CertificateList.jsx
│   │   │   ├── CreateCertificate.jsx
│   │
│   ├── circulars/
│   │   ├── pages/
│   │   │   ├── CircularList.jsx
│   │   │   ├── CreateCircular.jsx
│   │
│   ├── media/
│   │   ├── pages/
│   │   │   ├── Gallery.jsx
│   │   │   ├── UploadMedia.jsx
│   │
│   ├── payments/
│   │   ├── pages/
│   │   │   ├── PaymentList.jsx
│   │   │   ├── PaymentDetails.jsx
│   │
│   ├── district/
│   │   ├── pages/
│   │   │   ├── DistrictList.jsx
│   │   │   ├── AddDistrict.jsx
│   │
│   ├── clubs/
│   │   ├── pages/
│   │   │   ├── ClubList.jsx
│   │   │   ├── AddClub.jsx
│   │
│   ├── complaints/
│   │   ├── pages/
│   │   │   ├── ComplaintList.jsx
│   │   │   ├── ComplaintDetails.jsx
│
├── hooks/                   # Custom hooks
│   ├── useAuth.js
│   ├── useApi.js
│
├── services/                # API calls (axios)
│   ├── axios.js
│   └── endpoints.js
│
├── utils/                   # Helper functions
│   ├── constants.js
│   ├── formatDate.js
│   └── validators.js
│
├── context/                 # Context API (if used)
│   └── AuthContext.jsx
│
├── App.jsx
├── main.jsx
└── index.css# KRSA_admin
