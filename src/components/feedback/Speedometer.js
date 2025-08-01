import React from 'react';
import './Speedometer.css';

const Speedometer = ({ label, value, min, max, zones, unit }) => {
  const clampedValue = Math.min(value, max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  const getZoneColor = () => {
    for (const zone of zones) {
      if (value >= zone.min && value <= zone.max) {
        return zone.color;
      }
    }
    return '#6b7280'; // Default gray
  };

  return (
    <div className="speedometer">
      <div className="speedometer__label">{label}</div>
      <div className="speedometer__gauge">
        <div className="speedometer__zones">
          {zones.map((zone, index) => (
            <div
              key={index}
              className="speedometer__zone"
              style={{ backgroundColor: zone.color, width: `${((zone.max - zone.min) / (max - min)) * 100}%` }}
            ></div>
          ))}
        </div>
        <div
        className="speedometer__needle"
        style={{
            left: `${percentage}%`,
            transform: 'translateX(-50%)',
            backgroundColor: 'black'
        }}
        ></div>

      </div>
      <div className="speedometer__value">{clampedValue}{unit}</div>
    </div>
  );
};

export default Speedometer;