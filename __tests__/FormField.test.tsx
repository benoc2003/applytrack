import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import FormField from '../components/FormField';

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');

  return {
    useFocusEffect: (callback: any) => {
      React.useEffect(() => {
        callback();
      }, []);
    },
  };
});

describe('FormField', () => {
  it('renders label and placeholder and handles text input', () => {
    const onChangeText = jest.fn();

    const { getByText, getByPlaceholderText } = render(
      <FormField
        label="Company"
        placeholder="Enter company"
        value=""
        onChangeText={onChangeText}
      />
    );

    expect(getByText('Company')).toBeTruthy();

    const input = getByPlaceholderText('Enter company');
    expect(input).toBeTruthy();

    fireEvent.changeText(input, 'Google');
    expect(onChangeText).toHaveBeenCalledWith('Google');
  });
});