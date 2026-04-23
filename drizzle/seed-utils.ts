export function shouldSeed(existingUserCount: number) {
  return existingUserCount === 0;
}

// --- Seed Data Helpers ---

export function getSeedUser() {
  return {
    userId: 1,
    username: 'ben',
    password: 'password123',
    createdAt: new Date().toISOString(),
  };
}

export function getSeedCategories() {
  return [
    {
      userId: 1,
      name: 'Software',
      color: '#3b82f6',
      icon: '💻',
    },
    {
      userId: 1,
      name: 'Finance',
      color: '#10b981',
      icon: '💰',
    },
  ];
}

export function getSeedApplications() {
  return [
    {
      userId: 1,
      company: 'Google',
      role: 'Software Engineer',
      dateApplied: new Date().toISOString(),
      priorityScore: 5,
      categoryId: 1,
      notes: 'Strong role',
      createdAt: new Date().toISOString(),
    },
    {
      userId: 1,
      company: 'Deloitte',
      role: 'Consulting Analyst',
      dateApplied: new Date().toISOString(),
      priorityScore: 3,
      categoryId: 2,
      notes: '',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getSeedStatusLogs() {
  return [
    {
      applicationId: 1,
      status: 'Applied',
      statusDate: new Date().toISOString(),
      notes: 'Application submitted',
    },
    {
      applicationId: 2,
      status: 'Applied',
      statusDate: new Date().toISOString(),
      notes: 'Application submitted',
    },
  ];
}

export function getSeedTargets() {
  return [
    {
      userId: 1,
      periodType: 'weekly',
      targetCount: 5,
      startDate: new Date().toISOString(),
    },
  ];
}