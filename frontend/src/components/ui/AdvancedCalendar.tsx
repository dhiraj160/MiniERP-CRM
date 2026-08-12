import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface AdvancedCalendarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const AdvancedCalendar = ({ value, onChange, placeholder = "Select date & time" }: AdvancedCalendarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [selectedTime, setSelectedTime] = useState(
    value ? `${String(initialDate.getHours()).padStart(2, '0')}:${String(initialDate.getMinutes()).padStart(2, '0')}` : '12:00'
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    newDate.setHours(hours, minutes);
    
    // Format to YYYY-MM-DDThh:mm
    const tzoffset = newDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(newDate.getTime() - tzoffset)).toISOString().slice(0, -1);
    
    onChange(localISOTime.slice(0, 16));
    setIsOpen(false);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = value && new Date(value).getDate() === d && new Date(value).getMonth() === currentMonth && new Date(value).getFullYear() === currentYear;
    days.push(
      <div 
        key={`day-${d}`} 
        className={`calendar-day ${isSelected ? 'selected' : ''}`}
        onClick={() => handleDateSelect(d)}
      >
        {d}
      </div>
    );
  }

  const displayValue = value ? new Date(value).toLocaleString(undefined, { 
    year: 'numeric', month: 'short', day: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  }) : '';

  return (
    <div className="advanced-calendar" ref={containerRef}>
      <div 
        className="calendar-input input-control" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <span style={{ color: displayValue ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {displayValue || placeholder}
        </span>
        <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
      </div>

      {isOpen && (
        <div className="calendar-popover glass-card">
          <div className="calendar-header">
            <button type="button" className="calendar-nav-btn" onClick={handlePrevMonth}>
              <ChevronLeft size={20} />
            </button>
            <div className="calendar-title">{monthNames[currentMonth]} {currentYear}</div>
            <button type="button" className="calendar-nav-btn" onClick={handleNextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="calendar-grid-header">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
          </div>
          
          <div className="calendar-grid">
            {days}
          </div>

          <div className="calendar-footer">
            <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
            <input 
              type="time" 
              className="calendar-time-input" 
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
