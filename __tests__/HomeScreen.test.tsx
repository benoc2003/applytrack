import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import HomeScreen from '../app/(tabs)/index';

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');

  return {
    router: {
      push: jest.fn(),
    },
    useFocusEffect: (callback: any) => {
      React.useEffect(() => {
        callback();
      }, []);
    },
  };
});

jest.mock('../drizzle/db', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        innerJoin: jest.fn(() =>
          Promise.resolve([
            {
              id: 1,
              company: 'Google',
              role: 'Software Engineer',
              dateApplied: '2026-04-21',
              priorityScore: 5,
              notes: 'Strong role',
              categoryId: 1,
              categoryName: 'Software',
              categoryIcon: '💻',
            },
          ])
        ),
        where: jest.fn(() =>
          Promise.resolve([
            { id: 1, name: 'Software', icon: '💻' },
          ])
        ),
      })),
    })),
  },
}));

describe('HomeScreen', () => {
  it('displays seeded application data', async () => {
const { getByText, getAllByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Google')).toBeTruthy();
      expect(getByText('Software Engineer')).toBeTruthy();
      expect(getAllByText('💻 Software').length).toBeGreaterThan(0);
    });
  });
});