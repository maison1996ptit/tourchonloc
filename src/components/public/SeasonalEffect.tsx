'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import styles from './seasonal-effect.module.css';

const SeasonalEffect: React.FC = () => {
  const { theme, currentSeason } = useTheme();

  if (!theme?.useSeasonalTheme) return null;

  const renderDecoration = () => {
    switch (currentSeason) {
      case 'Spring':
        return (
          <div className={`${styles.cornerDecoration} ${styles.spring}`}>
            <div className={styles.manekiNeko}>
              <div className={styles.catBody}>🐱</div>
              <div className={styles.wavingHand}>🐾</div>
            </div>
            <div className={styles.apricotBlossom}>
              <span className={styles.flower}>🌸</span>
              <span className={styles.flower}>🌸</span>
              <span className={styles.flower}>🌸</span>
            </div>
          </div>
        );
      case 'Summer':
        return (
          <div className={`${styles.cornerDecoration} ${styles.summer}`}>
            <div className={styles.sun}>☀️</div>
            <div className={styles.palmTree}>🌴</div>
            <div className={styles.waves}>🌊</div>
          </div>
        );
      case 'Autumn':
        return (
          <div className={`${styles.cornerDecoration} ${styles.autumn}`}>
            <div className={styles.leafPile}>🍂</div>
            <div className={styles.fallingLeaf}>🍁</div>
            <div className={styles.fallingLeaf}>🍁</div>
          </div>
        );
      case 'Winter':
        return (
          <div className={`${styles.cornerDecoration} ${styles.winter}`}>
            <div className={styles.snowman}>⛄</div>
            <div className={styles.snowflakes}>
              <span className={styles.snowflake}>❄️</span>
              <span className={styles.snowflake}>❄️</span>
              <span className={styles.snowflake}>❄️</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.seasonalContainer}>
      {renderDecoration()}
    </div>
  );
};

export default SeasonalEffect;
