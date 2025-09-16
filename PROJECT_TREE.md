# ClaimsLionAI - Complete Project Tree

## 📁 Root Directory
```
ClaimsLionAI/
├── 📁 .git/                           # Git version control directory
├── 📁 .github/                        # GitHub workflows and configurations
├── 📁 attached_assets/                # Screenshots and images for documentation
│   ├── image_1752248859114.png       # UI screenshot
│   ├── image_1752248896204.png       # Dashboard screenshot
│   ├── image_1752249276240.png       # Analysis screenshot
│   ├── image_1752253604969.png       # Error screenshot
│   ├── image_1752253624929.png       # Upload screenshot
│   ├── image_1752254591495.png       # Processing screenshot
│   ├── image_1752254622700.png       # Results screenshot
│   └── image_1752255266009.png       # Final screenshot
├── 📁 client/                         # Frontend React application (duplicate of src/)
│   ├── 📁 src/                       # Source code for client
│   └── index.html                    # Main HTML entry point
├── 📁 dist/                          # Built/compiled application files
├── 📁 netlify/                       # Netlify deployment configuration
│   └── 📁 functions/                 # Netlify serverless functions
│       ├── analysis.js               # Analysis processing function
│       ├── chat.js                   # Chat functionality
│       ├── delete-analysis.js        # Delete analysis endpoint
│       ├── get-analyses.js           # Get all analyses
│       ├── get-chat.js               # Get chat history
│       ├── package.json              # Netlify functions dependencies
│       ├── test-upload.js            # Upload testing function
│       ├── test.js                   # General testing function
│       ├── upload.js                 # File upload handler
│       ├── 📁 services/              # Service layer for Netlify functions
│       │   ├── chunking.ts           # File chunking logic
│       │   ├── gemini.ts             # Gemini AI integration
│       │   ├── openai.ts             # OpenAI integration
│       │   └── storage.ts            # Storage operations
│       └── 📁 shared/                # Shared utilities
│           └── schema.ts             # Database schema definitions
├── 📁 node_modules/                  # Node.js dependencies
├── 📁 RetailLion Logic/              # Legacy RetailLion logic (deprecated)
│   └── 📁 functions/                 # Old function implementations
│       ├── 📁 process-analysis/      # Old analysis processing
│       └── 📁 process-analysis-worker/ # Old worker implementation
├── 📁 scripts/                       # Database and deployment scripts
│   ├── add-analyzed-at-column.sql    # Add analyzed_at column to database
│   ├── add-locking-columns.sql       # Add job locking columns
│   ├── add-missing-columns.sql       # Add missing database columns
│   ├── add-row-analysis-table.sql    # Create row analysis table
│   ├── check-current-tables.sql      # Check current database structure
│   ├── check-row-analysis-data.sql   # Verify row analysis data
│   ├── check-row-analysis-table.sql  # Check row analysis table structure
│   ├── clear-current-stuck-job.js    # Clear specific stuck job
│   ├── clear-stuck-job-simple.js     # Simple stuck job clearer
│   ├── clear-stuck-jobs.sql          # Clear all stuck jobs
│   ├── create-fresh-tables.sql       # Create fresh database tables
│   ├── debug-analysis.js             # Debug analysis issues
│   ├── deploy-worker-manual.md       # Manual deployment guide
│   ├── diagnose-row-analysis.js      # Diagnose row analysis issues
│   ├── extract-row-analysis-columns.sql # Extract row analysis data
│   ├── fix-row-analysis-foreign-key.sql # Fix foreign key constraints
│   ├── fix-row-analysis-table.sql    # Fix row analysis table
│   ├── fix-worker-errors.sql         # Fix worker function errors
│   ├── kill-specific-job.sql         # Kill specific processing job
│   ├── kill-stuck-job-permanently.sql # Permanently kill stuck jobs
│   ├── manual-fix-foreign-key.js     # Manual foreign key fix
│   ├── migrate-existing-tables.sql   # Migrate existing database
│   ├── model-comparison-test.js      # Test different AI models
│   ├── model-config.js               # AI model configuration
│   ├── model-status.js               # Check model status
│   ├── quick-model-test.js           # Quick model testing
│   ├── README-MIGRATION.md           # Migration documentation
│   ├── README-ROW-ANALYSIS.md        # Row analysis documentation
│   ├── reset-analysis.js             # Reset analysis status
│   ├── reset-stuck-analysis.js       # Reset stuck analysis
│   ├── row-analysis-actual-structure.sql # Current row analysis structure
│   ├── row-analysis-table-definition.sql # Row analysis table definition
│   ├── run-fix.js                    # Run database fixes
│   ├── run-migration.js              # Run database migrations
│   ├── set-vertex-ai-env.sh          # Set Vertex AI environment
│   ├── setup-database.sql            # Initial database setup
│   ├── switch-model.js               # Switch between AI models
│   ├── test-deployment.js            # Test deployment
│   ├── test-model-output-size.js     # Test model output sizes
│   ├── verify-database.js            # Verify database integrity
│   └── verify-row-analysis-data.js   # Verify row analysis data
├── 📁 server/                        # Express.js backend server
│   ├── db.ts                         # Database connection
│   ├── index.ts                      # Server entry point
│   ├── routes.ts                     # API routes
│   ├── storage.ts                    # Storage operations
│   ├── vite.ts                       # Vite configuration for server
│   └── 📁 services/                  # Backend services
│       ├── chunking.ts               # File chunking service
│       └── openai.ts                 # OpenAI integration
├── 📁 shared/                        # Shared code between frontend/backend
│   └── schema.ts                     # Shared database schema
├── 📁 src/                           # Main React frontend source code
│   ├── App.tsx                       # Main React application component
│   ├── index.css                     # Global CSS styles
│   ├── main.tsx                      # React entry point
│   ├── 📁 components/                # React components
│   │   ├── 📁 auth/                  # Authentication components
│   │   │   ├── LoginModal.tsx        # Login modal component
│   │   │   └── ProtectedRoute.tsx    # Route protection component
│   │   ├── 📁 dashboard/             # Dashboard components
│   │   │   ├── charts.tsx            # Chart components
│   │   │   ├── chat-window.tsx       # Chat interface
│   │   │   ├── critical-alerts-sidebar.tsx # Alerts sidebar
│   │   │   ├── data-tables.tsx       # Data table components
│   │   │   ├── expandable-chart.tsx  # Expandable charts
│   │   │   ├── expandable-table.tsx  # Expandable tables
│   │   │   ├── insight-cards.tsx     # Insight display cards
│   │   │   ├── insight-table.tsx     # Insight table
│   │   │   ├── policy-search.tsx     # Policy search component
│   │   │   ├── regional-performance.tsx # Regional performance charts
│   │   │   ├── risk-management.tsx   # Risk management interface
│   │   │   ├── row-analysis-table-simple.tsx # Simple row analysis
│   │   │   ├── row-analysis-table.tsx # Full row analysis table
│   │   │   ├── simulation-sandbox.tsx # Simulation interface
│   │   │   ├── sku-performance.tsx   # SKU performance charts
│   │   │   └── summary-cards.tsx     # Summary cards
│   │   ├── 📁 layout/                # Layout components
│   │   │   ├── footer.tsx            # Footer component
│   │   │   └── navigation.tsx        # Navigation component
│   │   ├── 📁 ui/                    # Reusable UI components
│   │   │   ├── accordion.tsx         # Accordion component
│   │   │   ├── alert-dialog.tsx      # Alert dialog
│   │   │   ├── alert.tsx             # Alert component
│   │   │   ├── aspect-ratio.tsx      # Aspect ratio wrapper
│   │   │   ├── avatar.tsx            # Avatar component
│   │   │   ├── badge.tsx             # Badge component
│   │   │   ├── breadcrumb.tsx        # Breadcrumb navigation
│   │   │   ├── button.tsx            # Button component
│   │   │   ├── calendar.tsx          # Calendar component
│   │   │   ├── card.tsx              # Card component
│   │   │   ├── carousel.tsx          # Carousel component
│   │   │   ├── chart.tsx             # Chart wrapper
│   │   │   ├── checkbox.tsx          # Checkbox component
│   │   │   ├── collapsible.tsx       # Collapsible component
│   │   │   ├── command.tsx           # Command palette
│   │   │   ├── context-menu.tsx      # Context menu
│   │   │   ├── dialog.tsx            # Dialog component
│   │   │   ├── drawer.tsx            # Drawer component
│   │   │   ├── dropdown-menu.tsx     # Dropdown menu
│   │   │   ├── form.tsx              # Form components
│   │   │   ├── hover-card.tsx        # Hover card
│   │   │   ├── input-otp.tsx         # OTP input
│   │   │   ├── input.tsx             # Input component
│   │   │   ├── label.tsx             # Label component
│   │   │   ├── menubar.tsx           # Menu bar
│   │   │   ├── multiselect.tsx       # Multi-select component
│   │   │   ├── navigation-menu.tsx   # Navigation menu
│   │   │   ├── pagination.tsx        # Pagination component
│   │   │   ├── popover.tsx           # Popover component
│   │   │   ├── progress.tsx          # Progress bar
│   │   │   ├── radio-group.tsx       # Radio button group
│   │   │   ├── resizable.tsx         # Resizable component
│   │   │   ├── scroll-area.tsx       # Scroll area
│   │   │   ├── select.tsx            # Select component
│   │   │   ├── separator.tsx         # Separator component
│   │   │   ├── sheet.tsx             # Sheet component
│   │   │   ├── sidebar.tsx           # Sidebar component
│   │   │   ├── skeleton.tsx          # Loading skeleton
│   │   │   ├── slider.tsx            # Slider component
│   │   │   ├── switch.tsx            # Switch component
│   │   │   ├── table.tsx             # Table component
│   │   │   ├── tabs.tsx              # Tabs component
│   │   │   ├── textarea.tsx          # Textarea component
│   │   │   ├── toast.tsx             # Toast notification
│   │   │   ├── toaster.tsx           # Toast container
│   │   │   ├── toggle-group.tsx      # Toggle group
│   │   │   ├── toggle.tsx            # Toggle component
│   │   │   └── tooltip.tsx           # Tooltip component
│   │   └── 📁 upload/                # Upload components
│   │       ├── file-upload.tsx       # File upload component
│   │       └── ProgressIndicator.tsx # Upload progress indicator
│   ├── 📁 contexts/                  # React contexts
│   │   └── AuthContext.tsx           # Authentication context
│   ├── 📁 hooks/                     # Custom React hooks
│   │   ├── use-mobile.tsx            # Mobile detection hook
│   │   ├── use-row-analysis.ts       # Row analysis hook
│   │   └── use-toast.ts              # Toast notification hook
│   ├── 📁 lib/                       # Utility libraries
│   │   ├── api.ts                    # API client
│   │   ├── queryClient.ts            # React Query client
│   │   ├── supabase.ts               # Supabase client
│   │   └── utils.ts                  # Utility functions
│   ├── 📁 pages/                     # Page components
│   │   ├── about.tsx                 # About page
│   │   ├── contact.tsx               # Contact page
│   │   ├── dashboard.tsx             # Main dashboard
│   │   ├── history.tsx               # Analysis history
│   │   ├── landing.tsx               # Landing page
│   │   ├── not-found.tsx             # 404 page
│   │   └── upload.tsx                # File upload page
│   └── 📁 prompts/                   # AI prompt templates
│       ├── claimLionPrompt.ts        # Claims analysis prompts
│       └── retailLionPrompt.ts       # Retail analysis prompts
├── 📁 supabase/                      # Supabase backend configuration
│   ├── 📁 .temp/                     # Temporary Supabase files
│   └── 📁 functions/                 # Supabase Edge Functions
│       └── 📁 process-analysis-worker/ # Analysis processing worker
│           ├── index.ts              # Main worker function (deployed)
│           ├── index-CodeZilla-13.ts # Backup worker version
│           ├── claimLionPrompt.ts    # Claims analysis prompts
│           ├── retailLionPrompt.ts   # Retail analysis prompts
│           └── 📁 services/          # Worker services
│               └── gemini.ts         # Gemini AI integration
├── .gitattributes                    # Git attributes configuration
├── .gitignore                        # Git ignore rules
├── add-locking-columns.sql           # Add job locking to database
├── clear-all-stuck-jobs.sql          # Clear all stuck jobs
├── clear-stuck-job.sql               # Clear specific stuck job
├── check-stuck-jobs.sql              # Check for stuck jobs
├── components.json                   # UI component configuration
├── DATABASE-SETUP.md                 # Database setup documentation
├── debug-504.js                      # Debug 504 errors
├── deploy-functions.ps1              # PowerShell deployment script
├── deploy-supabase-functions.ps1     # Supabase deployment script
├── deploy-supabase-functions.sh      # Bash deployment script
├── drizzle.config.ts                 # Drizzle ORM configuration
├── index.html                        # Main HTML entry point
├── MODEL_TESTING_GUIDE.md            # AI model testing guide
├── netlify.toml                      # Netlify configuration
├── package.json                      # Node.js dependencies and scripts
├── package-lock.json                 # Locked dependency versions
├── postcss.config.js                 # PostCSS configuration
├── project-structure.txt             # Project structure documentation
├── README.md                         # Main project documentation
├── replit.md                         # Replit deployment guide
├── setup-analysis-results-table.sql  # Analysis results table setup
├── SUPABASE_DEPLOYMENT.md            # Supabase deployment guide
├── tailwind.config.ts                # Tailwind CSS configuration
├── test-comprehensive_ai.csv         # Test data file
├── test-data-processing.js           # Test data processing
├── test-token-limit.js               # Test token limits
├── test-worker-access.js             # Test worker access
├── tsconfig.json                     # TypeScript configuration
├── VERTEX-AI-MIGRATION.md            # Vertex AI migration guide
├── vite.config.ts                    # Vite build configuration
└── WORKER-FIX-README.md              # Worker function fixes guide
```

## 🏗️ Architecture Overview

### **Frontend (React + TypeScript)**
- **src/**: Main React application with modern UI components
- **client/**: Duplicate frontend (legacy, should be removed)
- **dist/**: Built production files

### **Backend (Multiple Options)**
- **supabase/**: Primary backend using Supabase Edge Functions
- **netlify/**: Alternative backend using Netlify Functions
- **server/**: Express.js server (legacy)

### **Database & Scripts**
- **scripts/**: Database management and deployment scripts
- **shared/**: Shared code between frontend/backend
- **SQL files**: Database setup and maintenance scripts

### **Configuration Files**
- **package.json**: Dependencies and build scripts
- **vite.config.ts**: Build configuration
- **tailwind.config.ts**: CSS framework configuration
- **tsconfig.json**: TypeScript configuration

### **Documentation**
- **README files**: Various documentation guides
- **attached_assets/**: Screenshots and images
- **Markdown files**: Setup and deployment guides

## 🎯 Key Features
- **Claims Analysis**: AI-powered insurance claims analysis
- **File Upload**: CSV file processing with progress tracking
- **Dashboard**: Interactive data visualization and insights
- **Real-time Processing**: Background job processing with status updates
- **Multi-platform**: Supports both Supabase and Netlify deployments 