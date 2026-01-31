import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UIIcon } from '../components/ui/Icon';

interface WellnessAlert {
  id: string;
  type: 'posture' | 'attention' | 'break' | 'hydration' | 'stretch' | 'screen_time';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

interface WellnessReminderProps {
  alerts: WellnessAlert[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
  childName?: string;
}

const WellnessReminder: React.FC<WellnessReminderProps> = ({ 
  alerts, 
  onAcknowledge, 
  onDismiss,
  childName = 'Little Learner'
}) => {
  const [visibleAlerts, setVisibleAlerts] = useState<WellnessAlert[]>([]);

  // Update visible alerts when alerts change
  useEffect(() => {
    // Only show non-acknowledged alerts
    const newVisibleAlerts = alerts.filter(alert => !alert.acknowledged);
    setVisibleAlerts(newVisibleAlerts);
  }, [alerts]);

  // Get icon and color based on alert type
  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'posture':
        return { icon: 'body', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' };
      case 'attention':
        return { icon: 'eye', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' };
      case 'break':
        return { icon: 'coffee', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' };
      case 'hydration':
        return { icon: 'drop', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' };
      case 'stretch':
        return { icon: 'body', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' };
      case 'screen_time':
        return { icon: 'monitor', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' };
      default:
        return { icon: 'alert-circle', color: 'text-gray-400', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20' };
    }
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {visibleAlerts.map((alert) => {
        const config = getAlertConfig(alert.type);
        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className={`bg-white/10 backdrop-blur-sm border ${config.borderColor} rounded-xl p-4 shadow-lg w-full max-w-xs`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                <UIIcon name={config.icon as any} size={20} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm mb-1">
                  {alert.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Alert
                </h4>
                <p className="text-white/80 text-sm mb-3">
                  {alert.message.replace('{childName}', childName)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-medium hover:shadow-md transition"
                  >
                    Got it!
                  </button>
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="px-3 py-1.5 bg-white/10 border border-border text-white/80 rounded-lg text-xs font-medium hover:bg-white/20 transition"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-white/50 hover:text-white/80 flex-shrink-0"
              >
                <UIIcon name="x" size={16} />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WellnessReminder;