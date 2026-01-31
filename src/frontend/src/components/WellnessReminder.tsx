import React, { useState, useEffect } from 'react';
import { UIIcon } from '../components/ui/Icon';

interface WellnessReminderProps {
  activeTime?: number; // in minutes
  inactiveTime?: number; // in seconds
  onDismiss: () => void;
  onPostpone?: () => void;
}

interface ReminderConfig {
  type: 'break' | 'water' | 'stretch' | 'inactive';
  title: string;
  message: string;
  icon: string;
  color: string;
  showAfter: number; // minutes of active time or seconds of inactivity
  condition: (
    activeTime: number | undefined,
    inactiveTime: number | undefined,
  ) => boolean;
}

const WellnessReminderComponent: React.FC<WellnessReminderProps> = ({
  activeTime,
  inactiveTime,
  onDismiss,
  onPostpone,
}) => {
  const [currentReminder, setCurrentReminder] = useState<ReminderConfig | null>(
    null,
  );
  const [showReminder, setShowReminder] = useState<boolean>(false);

  const reminderConfigs: ReminderConfig[] = [
    {
      type: 'break',
      title: 'Take a Break!',
      message:
        "You've been learning for a while. Take a 5-minute break to rest your eyes and stretch.",
      icon: 'coffee',
      color: 'from-yellow-500 to-orange-500',
      showAfter: 15,
      condition: (activeTime) =>
        (activeTime || 0) >= 15 && (activeTime || 0) < 30,
    },
    {
      type: 'water',
      title: 'Hydrate!',
      message:
        'Time for a drink of water. Staying hydrated helps you focus better.',
      icon: 'drop',
      color: 'from-blue-500 to-cyan-500',
      showAfter: 20,
      condition: (activeTime) =>
        (activeTime || 0) >= 20 && (activeTime || 0) < 40,
    },
    {
      type: 'stretch',
      title: 'Stretch Time!',
      message:
        'Time to stretch your body. Reach for the sky and touch your toes!',
      icon: 'body',
      color: 'from-green-500 to-emerald-500',
      showAfter: 30,
      condition: (activeTime) => (activeTime || 0) >= 30,
    },
    {
      type: 'inactive',
      title: 'Are You Still There?',
      message:
        "We noticed you haven't been active for a while. Are you still playing?",
      icon: 'eye',
      color: 'from-red-500 to-pink-500',
      showAfter: 60,
      condition: (_activeTime, inactiveTime) => (inactiveTime || 0) >= 60,
    },
  ];

  // Check for applicable reminders
  useEffect(() => {
    const applicableReminder = reminderConfigs.find((config) =>
      config.condition(activeTime || 0, inactiveTime || 0),
    );

    if (applicableReminder && !showReminder) {
      setCurrentReminder(applicableReminder);
      setShowReminder(true);
    } else if (!applicableReminder) {
      setShowReminder(false);
    }
  }, [activeTime, inactiveTime, showReminder]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!showReminder || !currentReminder) {
    return null;
  }

  const reminder = currentReminder!;

  return (
    <dialog
      open
      className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
      aria-modal='true'
      aria-labelledby='wellness-title'
    >
      <div
        className={`bg-gradient-to-br ${reminder.color} rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-white/20`}
      >
        <div className='text-center'>
          <div className='w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6'>
            <UIIcon
              name={reminder.icon as any}
              size={48}
              className='text-white'
            />
          </div>

          <h2
            id='wellness-title'
            className='text-2xl font-bold text-white mb-3'
          >
            {reminder.title}
          </h2>

          <p className='text-white/90 mb-8 text-lg'>{reminder.message}</p>

          <div className='flex flex-col sm:flex-row gap-3'>
            {onPostpone && (
              <button
                type='button'
                onClick={onPostpone}
                className='flex-1 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition backdrop-blur-sm'
              >
                Remind Me Later
              </button>
            )}
            <button
              type='button'
              onClick={onDismiss}
              className='flex-1 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition'
            >
              {currentReminder.type === 'inactive'
                ? "Yes, I'm here!"
                : "OK, I'll do it!"}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default React.memo(WellnessReminderComponent);
