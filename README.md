<h1>Demo URL: <a href="https://music.icruso.ro" style="color: #007acc; text-decoration: none;">https://music.icruso.ro</a></h1>

# Digital Music Library

Welcome to the Digital Music Library! This application is designed as part of an assignment for the Grad/Junior Full Stack Engineer (Innovation Team) position. The primary goal of this project is to visualize artists and their albums, allowing users to open albums to view a description and a list of songs. Additionally, the app features a search functionality with an autocomplete component to provide suggestions as users type in the search box.

## What I Used

<ul>
  <li><strong>Next.js</strong> - A React framework for server-side rendering and static site generation.</li>
  <li><strong>Supabase</strong> - An open-source Firebase alternative for authentication, database, and storage.</li>
  <li><strong>React</strong> - A JavaScript library for building user interfaces.</li>
  <li><strong>TypeScript</strong> - A typed superset of JavaScript that compiles to plain JavaScript.</li>
  <li><strong>SCSS</strong> - A CSS preprocessor that adds power and elegance to the basic language.</li>
  <li><strong>Framer Motion</strong> - A library for animations and gestures in React.</li>
</ul>

## Features

- List all artists and their albums
- List all the albums
- View detailed information about each album, including a list of songs
- A playlist section where you can create your own playlist
- Search functionality with autocomplete
- User authentication
- Responsive design

## Guidelines Followed

The project follows the given guidelines, ensuring a well-structured and maintainable codebase. It includes all required functionalities and considers related security aspects for the search feature.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your local machine:

- <span style="color:#339933; background-color:white; font-family:Arial, Helvetica, sans-serif;"><strong>Node.js</strong></span>
- <span style="color:#CB3837; background-color:white; font-family:Arial, Helvetica, sans-serif;"><strong>npm</strong></span>
- <span style="color:#F05032; background-color:white; font-family:Arial, Helvetica, sans-serif;"><strong>Git</strong></span>

### Installation

1. Clone the repository:

   <code>git clone https://github.com/ioancruso/musicapp.git</code>

   <code>cd musicapp</code>

2. Install the dependencies:

   <code>npm install</code>

3. Set up Supabase:

   - Create a `.env.local` file in the root of your project and add the following:

     <pre>
     SUPABASE_URL=https://horohbpvdxoasuwqopsl.supabase.co
     SUPABASE_SERVICE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvcm9oYnB2ZHhvYXN1d3FvcHNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDMwMzAzNCwiZXhwIjoyMDM1ODc5MDM0fQ.f5lPXc-zIXs8dEABmewm0XDSrSQs95HVBLLVZH59Ylw
     </pre>

4. Run the application:

   <code>npm run dev</code>

5. Access the application:

   Open your browser and navigate to <code>http://localhost:3000/</code> to see the app in action.

## Contact

If you have any questions, feel free to reach out to me at <a href="mailto:ionut.cruso@gmail.com">ionut.cruso@gmail.com</a>.

---

Thank you for checking out the Digital Music Library! If you have any questions or feedback, feel free to open an issue or contact the repository owner.
