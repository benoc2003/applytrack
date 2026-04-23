import {
  getSeedApplications,
  getSeedCategories,
  getSeedStatusLogs,
  getSeedTargets,
  getSeedUser,
  shouldSeed,
} from '../drizzle/seed-utils';

describe('seed utils', () => {
  it('returns true when there are no existing users', () => {
    expect(shouldSeed(0)).toBe(true);
  });

  it('returns false when users already exist', () => {
    expect(shouldSeed(1)).toBe(false);
    expect(shouldSeed(5)).toBe(false);
  });

  it('provides seed data for all core tables', () => {
    const user = getSeedUser();
    const categories = getSeedCategories();
    const applications = getSeedApplications();
    const statusLogs = getSeedStatusLogs();
    const targets = getSeedTargets();

    expect(user).toBeTruthy();
    expect(user.username).toBeTruthy();
    expect(user.password).toBeTruthy();
    expect(user.createdAt).toBeTruthy();

    expect(categories.length).toBeGreaterThan(0);
    expect(categories.every((category) => category.userId === 1)).toBe(true);
    expect(categories.every((category) => !!category.name)).toBe(true);

    expect(applications.length).toBeGreaterThan(0);
    expect(applications.every((application) => application.userId === 1)).toBe(true);
    expect(applications.every((application) => !!application.company)).toBe(true);
    expect(applications.every((application) => !!application.role)).toBe(true);
    expect(applications.every((application) => !!application.dateApplied)).toBe(true);
    expect(applications.every((application) => application.categoryId > 0)).toBe(true);

    expect(statusLogs.length).toBeGreaterThan(0);
    expect(statusLogs.every((log) => log.applicationId > 0)).toBe(true);
    expect(statusLogs.every((log) => !!log.status)).toBe(true);
    expect(statusLogs.every((log) => !!log.statusDate)).toBe(true);

    expect(targets.length).toBeGreaterThan(0);
    expect(targets.every((target) => target.userId === 1)).toBe(true);
    expect(targets.every((target) => ['weekly', 'monthly'].includes(target.periodType))).toBe(true);
    expect(targets.every((target) => target.targetCount > 0)).toBe(true);
    expect(targets.every((target) => !!target.startDate)).toBe(true);
  });

  it('does not contain duplicate category names or duplicate target periods', () => {
    const categories = getSeedCategories();
    const targets = getSeedTargets();

    const categoryNames = categories.map((category) => category.name);
    const uniqueCategoryNames = new Set(categoryNames);

    expect(uniqueCategoryNames.size).toBe(categoryNames.length);

    const targetPeriods = targets.map((target) => target.periodType);
    const uniqueTargetPeriods = new Set(targetPeriods);

    expect(uniqueTargetPeriods.size).toBe(targetPeriods.length);
  });
});