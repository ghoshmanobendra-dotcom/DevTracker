export interface Topic {
    id: string;
    title: string;
    description?: string;
    resources?: { name: string; url: string }[];
}

export interface CareerPath {
    id: string;
    title: string;
    description: string;
    modules: {
        id: string;
        title: string;
        topics: Topic[];
    }[];
}

export const CAREER_PATHS: CareerPath[] = [
    {
        id: 'web-developer',
        title: 'Web Developer',
        description: 'The ultimate path to becoming a Full Stack Web Developer in 2025.',
        modules: [
            {
                id: 'internet-basics',
                title: 'Phase 1: Internet & Computing Basics',
                topics: [
                    { id: 'how-internet-works', title: 'How the Internet Works', description: 'DNS, HTTP/HTTPS, Domain Names, Hosting' },
                    { id: 'browsers', title: 'Browsers & How they work', description: 'Rendering Engine, Parsing, JS Engine' },
                    { id: 'terminal', title: 'Terminal Usage', description: 'Basic CLI commands (cd, ls, mkdir, touch, grep)' }
                ]
            },
            {
                id: 'html-mastery',
                title: 'Phase 2: HTML5 Mastery',
                topics: [
                    { id: 'semantic-html', title: 'Semantic HTML', description: 'header, footer, main, article, section, aside' },
                    { id: 'forms-validation', title: 'Forms & Validation', description: 'Inputs, attributes, Constraint Validation API' },
                    { id: 'accessibility', title: 'Accessibility (A11y)', description: 'ARIA labels, roles, contrast, keyboard navigation' },
                    { id: 'seo-basics', title: 'SEO Basics', description: 'Meta tags, Open Graph, JSON-LD, Sitemap' }
                ]
            },
            {
                id: 'css-mastery',
                title: 'Phase 3: CSS Wizardry',
                topics: [
                    { id: 'box-model', title: 'The Box Model', description: 'Margins, Borders, Padding, Content' },
                    { id: 'layout-flexbox', title: 'Flexbox', description: 'Justify-content, align-items, flex-direction, wrapping' },
                    { id: 'layout-grid', title: 'CSS Grid', description: 'Grid template areas, columns, rows, gap' },
                    { id: 'responsive-design', title: 'Responsive Design', description: 'Media queries, mobile-first approach, viewport units' },
                    { id: 'tailwind-css', title: 'Tailwind CSS', description: 'Utility-first classes, configuration, plugins' },
                    { id: 'animations', title: 'Animations & Transitions', description: 'Keyframes, transform, transition-timing-function' }
                ]
            },
            {
                id: 'javascript-deep-dive',
                title: 'Phase 4: JavaScript Deep Dive',
                topics: [
                    { id: 'es6-plus', title: 'Modern Syntax (ES6+)', description: 'Let/Const, Arrow Functions, Template Literals, Destructuring' },
                    { id: 'dom-manipulation', title: 'DOM Manipulation', description: 'QuerySelector, Event Listeners, Creating elements' },
                    { id: 'async-js', title: 'Async JavaScript', description: 'Promises, Async/Await, Event Loop, Callbacks' },
                    { id: 'api-fetch', title: 'Working with APIs', description: 'Fetch API, Axios, HTTP Methods, JSON handling' },
                    { id: 'js-modules', title: 'Modules & Tooling', description: 'Import/Export, NPM, Vite, Bundling' },
                    { id: 'storage', title: 'Browser Storage', description: 'LocalStorage, SessionStorage, Cookies, IndexedDB' }
                ]
            },
            {
                id: 'version-control',
                title: 'Phase 5: Git & GitHub',
                topics: [
                    { id: 'git-basics', title: 'Git Basics', description: 'init, add, commit, push, pull, status, log' },
                    { id: 'branching', title: 'Branching & Merging', description: 'checkout, branch, merge, stash, rebase' },
                    { id: 'repo-hosting', title: 'GitHub/GitLab', description: 'Pull Requests, Forks, Issues, Actions' }
                ]
            },
            {
                id: 'react-ecosystem',
                title: 'Phase 6: React Ecosystem',
                topics: [
                    { id: 'jsx-components', title: 'JSX & Components', description: 'Functional components, Props, Composition' },
                    { id: 'hooks-basics', title: 'Core Hooks', description: 'useState, useEffect, useRef' },
                    { id: 'hooks-advanced', title: 'Advanced Hooks', description: 'useContext, useReducer, useMemo, useCallback' },
                    { id: 'routing', title: 'React Router', description: 'Routes, Link, useNavigate, Dynamic Segments' },
                    { id: 'state-management', title: 'State Management', description: 'Context API, Zustand, Redux Toolkit' },
                    { id: 'react-forms', title: 'Form Handling', description: 'Controlled inputs, React Hook Form, Zod validation' }
                ]
            },
            {
                id: 'typescript-core',
                title: 'Phase 7: TypeScript',
                topics: [
                    { id: 'ts-basics', title: 'Basic Types', description: 'string, number, boolean, arrays, any, unknown' },
                    { id: 'interfaces-types', title: 'Interfaces & Types', description: 'Object shapes, Union types, Intersection' },
                    { id: 'generics', title: 'Generics', description: 'Reusability, Type constraints, Utility types' },
                    { id: 'ts-react', title: 'TypeScript with React', description: 'Typing Props, Hooks, Events' }
                ]
            },
            {
                id: 'backend-basics',
                title: 'Phase 8: Backend & Database',
                topics: [
                    { id: 'nodejs-runtime', title: 'Node.js Runtime', description: 'Event loop, fs module, path module, streams' },
                    { id: 'api-design', title: 'API Design', description: 'REST standards, Status codes, Express.js middleware' },
                    { id: 'databases-sql', title: 'PostgreSQL (SQL)', description: 'Tables, Relations, Joins, Indexing, Supabase' },
                    { id: 'databases-nosql', title: 'MongoDB (NoSQL)', description: 'Documents, Collections, Mongoose schemas' },
                    { id: 'auth-security', title: 'Auth & Security', description: 'JWT, OAuth, Hashing (Bcrypt), CORS, Helmet' }
                ]
            },
            {
                id: 'fullstack-frameworks',
                title: 'Phase 9: Next.js & Full Stack',
                topics: [
                    { id: 'next-routing', title: 'App Router', description: 'File-system routing, Layouts, Loading, Error' },
                    { id: 'rendering', title: 'Rendering Strategies', description: 'CSR vs SSR vs SSG vs ISR' },
                    { id: 'server-actions', title: 'Server Actions', description: 'Direct database mutations, Validations' },
                    { id: 'api-routes', title: 'Route Handlers', description: 'Backend logic within Next.js' }
                ]
            },
            {
                id: 'deployment-devops',
                title: 'Phase 10: DevOps & Deployment',
                topics: [
                    { id: 'deployment', title: 'Deployment', description: 'Vercel, Netlify, Railway, Render' },
                    { id: 'docker', title: 'Docker', description: 'Containerization, Dockerfile, Docker Compose' },
                    { id: 'ci-cd', title: 'CI/CD Pipelines', description: 'GitHub Actions, Automated Testing' }
                ]
            }
        ]
    },
    {
        id: 'data-scientist',
        title: 'Data Scientist',
        description: 'Analyze data, build models, and unlock insights using AI & ML.',
        modules: [
            {
                id: 'maths-stats',
                title: 'Phase 1: Mathematics & Statistics',
                topics: [
                    { id: 'prob-stats', title: 'Probability & Statistics', description: 'Distributions, Hypothesis Testing, P-values' },
                    { id: 'linear-algebra', title: 'Linear Algebra', description: 'Vectors, Matrices, Eigenvalues, Dot Products' },
                    { id: 'calculus', title: 'Calculus for ML', description: 'Derivatives, Gradients, Optimization, Cost Functions' }
                ]
            },
            {
                id: 'ds-programming',
                title: 'Phase 2: Programming for Data',
                topics: [
                    { id: 'python-ds', title: 'Python Mastery', description: 'Lists, Dictionaries, Functions, OOPS' },
                    { id: 'ds-libraries', title: 'Key Libraries', description: 'NumPy, Pandas, Matplotlib, Seaborn' },
                    { id: 'sql-ds', title: 'SQL for Analysis', description: 'Joins, Aggregations, Window Functions, Subqueries' }
                ]
            },
            {
                id: 'data-wrangling',
                title: 'Phase 3: Data Analysis & Engineering',
                topics: [
                    { id: 'eda', title: 'Exploratory Data Analysis', description: 'Data visualization, identifying patterns, outliers' },
                    { id: 'feature-engineering', title: 'Feature Engineering', description: 'Normalization, Encoding, Imputation, Scaling' },
                    { id: 'data-scraping', title: 'Data Collection', description: 'APIs, Web Scraping (BeautifulSoup/Selenium)' }
                ]
            },
            {
                id: 'ml-fundamentals',
                title: 'Phase 4: Machine Learning Basics',
                topics: [
                    { id: 'supervised', title: 'Supervised Learning', description: 'Regression, Classification, Decision Trees, SVM' },
                    { id: 'unsupervised', title: 'Unsupervised Learning', description: 'Clustering (K-Means), PCA, Association Rules' },
                    { id: 'model-eval', title: 'Model Evaluation', description: 'Accuracy, Precision, Recall, F1-Score, ROC-AUC' }
                ]
            },
            {
                id: 'deep-learning',
                title: 'Phase 5: Deep Learning & AI',
                topics: [
                    { id: 'neural-networks', title: 'Neural Networks', description: 'Perceptrons, Activation Functions, Backpropagation' },
                    { id: 'frameworks', title: 'Frameworks', description: 'TensorFlow, PyTorch, Keras' },
                    { id: 'cnn-rnn', title: 'Architectures', description: 'CNNs (Vision), RNNs/LSTMs (Sequences)' }
                ]
            },
            {
                id: 'advanced-ai',
                title: 'Phase 6: Advanced AI Topics',
                topics: [
                    { id: 'nlp', title: 'NLP', description: 'Tokenization, Embeddings, Transformers, BERT' },
                    { id: 'gen-ai', title: 'Generative AI', description: 'LLMs, Prompt Engineering, RAG, Fine-tuning' },
                    { id: 'computer-vision', title: 'Computer Vision', description: 'Object Detection, Segmentation, OpenCV' }
                ]
            },
            {
                id: 'mlops',
                title: 'Phase 7: MLOps & Deployment',
                topics: [
                    { id: 'model-deploy', title: 'Model Deployment', description: 'Flask/FastAPI, Docker containers' },
                    { id: 'cloud-ml', title: 'Cloud ML', description: 'AWS SageMaker, Google Vertex AI' },
                    { id: 'pipeline', title: 'Pipelines', description: 'MLflow, DVC, Monitoring' }
                ]
            }
        ]
    },
    {
        id: 'software-developer',
        title: 'Software Developer',
        description: 'Build robust, scalable software systems and master computer science fundamentals.',
        modules: [
            {
                id: 'cs-foundations',
                title: 'Phase 1: CS Foundations',
                topics: [
                    { id: 'dsa', title: 'Data Structures & Algo', description: 'Arrays, Maps, Trees, Graphs, Sorting, Searching' },
                    { id: 'oop', title: 'OOP Principles', description: 'Encapsulation, Inheritance, Polymorphism, Abstraction' },
                    { id: 'os-networking', title: 'OS & Networking', description: 'Processes, Threads, Memory, HTTP, TCP/IP, DNS' }
                ]
            },
            {
                id: 'languages',
                title: 'Phase 2: Language Mastery',
                topics: [
                    { id: 'compile-lang', title: 'Compiled Languages', description: 'Java, C++, Go, or Rust (Pick one deep)' },
                    { id: 'scripting', title: 'Scripting', description: 'Python or JavaScript/TypeScript mastery' },
                    { id: 'functional', title: 'Functional Concepts', description: 'Immutability, Pure Functions, Higher-order functions' }
                ]
            },
            {
                id: 'software-design',
                title: 'Phase 3: System Design & Architecture',
                topics: [
                    { id: 'design-patterns', title: 'Design Patterns', description: 'Singleton, Factory, Observer, Strategy' },
                    { id: 'system-design', title: 'System Design', description: 'Scalability, Load Balancing, Caching, Sharding' },
                    { id: 'microservices', title: 'Architecture Styles', description: 'Monolith vs Microservices, Event-driven' }
                ]
            },
            {
                id: 'databases-backend',
                title: 'Phase 4: Data & Backend',
                topics: [
                    { id: 'db-design', title: 'Database Design', description: 'Normalization, ACID properties, Indexing' },
                    { id: 'sql-nosql', title: 'SQL & NoSQL', description: 'PostgreSQL vs MongoDB/Cassandra/Redis' },
                    { id: 'api-arch', title: 'API Paradigms', description: 'REST, GraphQL, gRPC, WebSockets' }
                ]
            },
            {
                id: 'devops-cloud',
                title: 'Phase 5: DevOps & Cloud',
                topics: [
                    { id: 'docker-k8s', title: 'Containerization', description: 'Docker, Kubernetes (K8s) basics' },
                    { id: 'ci-cd-pipelines', title: 'CI/CD', description: 'Jenkins, GitHub Actions, Automated Testing' },
                    { id: 'cloud-basics', title: 'Cloud Infrastructure', description: 'AWS/Azure/GCP core services (EC2, S3, IAM)' }
                ]
            },
            {
                id: 'quality-security',
                title: 'Phase 6: Quality & Security',
                topics: [
                    { id: 'testing', title: 'Testing', description: 'Unit (Jest/JUnit), Integration, TDD' },
                    { id: 'security', title: 'Security', description: 'OWASP Top 10, Auth (JWT/OAuth), Encryption' }
                ]
            }
        ]
    }
];
