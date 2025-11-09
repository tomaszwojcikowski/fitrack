import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import ExerciseCard from '../../src/components/ExerciseCard.vue';
import type { WorkoutExercise } from '../../src/types';

describe('ExerciseCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockExercise: WorkoutExercise = {
    id: 'ex-1',
    exerciseId: 'bench-press',
    exercise: {
      id: 'bench-press',
      name: 'Bench Press',
      category: 'chest',
      equipment: 'barbell',
    },
    sets: [
      { id: 'set-1', reps: 10, weight: 60, completed: false },
      { id: 'set-2', reps: 10, weight: 60, completed: true },
    ],
    order: 0,
  };

  it('renders exercise name and meta information', () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise },
    });

    expect(wrapper.text()).toContain('Bench Press');
    expect(wrapper.text()).toContain('chest');
    expect(wrapper.text()).toContain('barbell');
  });

  it('renders all sets', () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise },
    });

    const setRows = wrapper.findAllComponents({ name: 'SetRow' });
    expect(setRows).toHaveLength(2);
  });

  it('can be collapsed and expanded', async () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise },
    });

    const collapseBtn = wrapper.find('.collapse-btn');
    expect(collapseBtn.exists()).toBe(true);

    // Initially expanded
    expect(wrapper.find('.exercise-body').isVisible()).toBe(true);

    // Click to collapse
    await collapseBtn.trigger('click');
    await wrapper.vm.$nextTick();
    
    // Should have collapsed class
    expect(wrapper.classes()).toContain('collapsed');
  });

  it('emits remove event when remove button clicked', async () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise },
    });

    const removeBtn = wrapper.find('.icon-btn');
    await removeBtn.trigger('click');

    expect(wrapper.emitted('remove')).toBeTruthy();
  });

  it('emits add-set event when add set button clicked', async () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise },
    });

    const addSetBtn = wrapper.find('.add-set-btn');
    await addSetBtn.trigger('click');

    expect(wrapper.emitted('add-set')).toBeTruthy();
  });

  it('displays add set button', () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise },
    });

    const addSetBtn = wrapper.find('.add-set-btn');
    expect(addSetBtn.exists()).toBe(true);
    expect(addSetBtn.text()).toContain('Add Set');
  });
});
