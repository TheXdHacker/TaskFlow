const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager');
    console.log('🔄 Connected to database for seeding...');

    // 1. Clear existing database collections
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    console.log('🧹 Cleared existing database records.');

    // 2. Seed Default Users
    // NOTE: Passwords are automatically hashed in the User model's pre-save middleware
    const users = await User.create([
      {
        name: 'Workspace Admin',
        email: 'admin@taskflow.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'John Member',
        email: 'member@taskflow.com',
        password: 'member123',
        role: 'member',
      },
      {
        name: 'Alice Developer',
        email: 'alice@taskflow.com',
        password: 'alice123',
        role: 'member',
      },
    ]);
    console.log('👥 Seeded 3 default users (1 Admin, 2 Members).');

    const adminUser = users[0];
    const memberJohn = users[1];
    const memberAlice = users[2];

    // 3. Seed Projects
    const projects = await Project.create([
      {
        name: 'Acme Web Portal',
        description: 'Complete redesign of corporate SaaS portal client dashboard.',
        createdBy: adminUser._id,
        members: [adminUser._id, memberJohn._id, memberAlice._id],
      },
      {
        name: 'Mobile App Redesign',
        description: 'Rebuild iOS and Android native apps using React Native and Tailwind CSS.',
        createdBy: adminUser._id,
        members: [adminUser._id, memberJohn._id],
      },
    ]);
    console.log('📁 Seeded 2 projects.');

    const projectWebPortal = projects[0];
    const projectMobileApp = projects[1];

    // 4. Calculate Relative Due Dates for Testing Tasks
    const today = new Date();
    
    // Yesterdays date (to force an Overdue warning state)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 2);

    // Future due date
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Tomorrow due date
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 5. Seed Tasks
    await Task.create([
      {
        title: 'Design Login Screen UI',
        description: 'Create high-fidelity wireframes in Figma and implement in frontend code.',
        status: 'done', // Completed task
        assignedTo: memberJohn._id,
        project: projectWebPortal._id,
        dueDate: yesterday, // Due date in the past, but completed so it shouldn't show as overdue
      },
      {
        title: 'Setup API Authentication Routing',
        description: 'Configure Express endpoints, validation, and JSON Web Token responses.',
        status: 'in_progress', // Active task
        assignedTo: adminUser._id,
        project: projectWebPortal._id,
        dueDate: nextWeek,
      },
      {
        title: 'Write Integration Tests',
        description: 'Write robust unit and integration tests to cover JWT auth middleware.',
        status: 'todo', // Not started
        assignedTo: memberAlice._id,
        project: projectWebPortal._id,
        dueDate: yesterday, // OVERDUE: Not started, and due date is in the past!
      },
      {
        title: 'Configure DB Sharding',
        description: 'Draft plan to implement sharding for tasks collection as scaling database helper.',
        status: 'todo', // Not started
        assignedTo: memberJohn._id,
        project: projectWebPortal._id,
        dueDate: tomorrow,
      },
      {
        title: 'Redesign Landing Page Graphics',
        description: 'Collaborate with marketing to refine asset sizes and layout.',
        status: 'todo', // Not started
        assignedTo: memberJohn._id,
        project: projectMobileApp._id,
        dueDate: nextWeek,
      },
    ]);
    console.log('✅ Seeded 5 tasks (including one Overdue task for UI highlight tests).');

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  }
};

// Run the script
seedData();
