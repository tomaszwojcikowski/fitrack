import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SetRow from '../../src/components/SetRow.vue';
import type { Set } from '../../src/types';

describe('SetRow', () => {
  const mockSet: Set = {
    id: 'set-1',
    reps: 10,
    weight: 60,
    completed: false,
  };

  it('renders set number correctly', () => {
    const wrapper = mount(SetRow, {
      props: { set: mockSet, index: 0 },
    });

    expect(wrapper.find('.set-number').text()).toBe('1');
  });

  it('renders input fields with values', () => {
    const wrapper = mount(SetRow, {
      props: { set: mockSet, index: 0 },
    });

    const inputs = wrapper.findAll('.set-input');
    expect(inputs).toHaveLength(2);
    
    const repsInput = inputs[0].element as HTMLInputElement;
    const weightInput = inputs[1].element as HTMLInputElement;
    
    expect(repsInput.value).toBe('10');
    expect(weightInput.value).toBe('60');
  });

  it('shows previous set suggestion when available', () => {
    const previousSet: Set = {
      id: 'set-0',
      reps: 12,
      weight: 55,
      completed: true,
    };

    const wrapper = mount(SetRow, {
      props: {
        set: mockSet,
        index: 1,
        previousSet,
      },
    });

    const suggestion = wrapper.find('.set-suggestion');
    expect(suggestion.exists()).toBe(true);
    expect(suggestion.text()).toContain('55kg');
    expect(suggestion.text()).toContain('12');
  });

  it('does not show suggestion when no previous set', () => {
    const wrapper = mount(SetRow, {
      props: { set: mockSet, index: 0 },
    });

    const suggestion = wrapper.find('.set-suggestion');
    expect(suggestion.exists()).toBe(false);
  });

  it('emits update event when toggling completion', async () => {
    const wrapper = mount(SetRow, {
      props: { set: mockSet, index: 0 },
    });

    const completeBtn = wrapper.find('.complete-btn');
    await completeBtn.trigger('click');

    expect(wrapper.emitted('update')).toBeTruthy();
    expect(wrapper.emitted('complete')).toBeTruthy();
  });

  it('applies completed class when set is completed', () => {
    const completedSet: Set = {
      ...mockSet,
      completed: true,
    };

    const wrapper = mount(SetRow, {
      props: { set: completedSet, index: 0 },
    });

    expect(wrapper.classes()).toContain('completed');
  });

  it('disables inputs when set is completed', () => {
    const completedSet: Set = {
      ...mockSet,
      completed: true,
    };

    const wrapper = mount(SetRow, {
      props: { set: completedSet, index: 0 },
    });

    const inputs = wrapper.findAll('.set-input');
    inputs.forEach(input => {
      expect((input.element as HTMLInputElement).disabled).toBe(true);
    });
  });

  it('emits remove event when remove button clicked', async () => {
    const wrapper = mount(SetRow, {
      props: { set: mockSet, index: 0 },
    });

    const removeBtn = wrapper.find('.icon-btn-small');
    await removeBtn.trigger('click');

    expect(wrapper.emitted('remove')).toBeTruthy();
  });
});
