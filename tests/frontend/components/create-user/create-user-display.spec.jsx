jest.mock('react-router-dom/Link');
import React from 'react';
import { mount } from 'enzyme';
import CreateUserDisplay from 'components/create-user/create-user-display';

describe('<CreateUserDisplay />', () => {
  let wrapper;
  const props = {
    history: {
      push: jest.fn(),
    },
    isLoading: false,
    createAccount: jest.fn(),
  };

  beforeEach(() => {
    wrapper = mount(<CreateUserDisplay {...props} />);
  });

  it('should match the snapshop', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
