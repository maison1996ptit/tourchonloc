'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { ThemePreset, ThemeConfig } from '@/types/theme';
import styles from './theme.module.css';

const presets: Record<ThemePreset, ThemeConfig> = {
  'Luxury Emerald': {
    primaryColor: '#006d5b',
    secondaryColor: '#f1f1f1',
    accentColor: '#d4af37',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '8px',
    buttonStyle: 'rounded',
    cardStyle: 'elevated',
    headerStyle: 'fixed',
    footerStyle: 'dark'
  },
  'Ocean Blue': {
    primaryColor: '#0077b6',
    secondaryColor: '#caf0f8',
    accentColor: '#00b4d8',
    backgroundColor: '#ffffff',
    textColor: '#03045e',
    fontFamily: 'Roboto, sans-serif',
    borderRadius: '4px',
    buttonStyle: 'square',
    cardStyle: 'bordered',
    headerStyle: 'static',
    footerStyle: 'simple'
  },
  'Golden Heritage': {
    primaryColor: '#8a6d3b',
    secondaryColor: '#fcf8e3',
    accentColor: '#c09853',
    backgroundColor: '#ffffff',
    textColor: '#3c3328',
    fontFamily: 'serif',
    borderRadius: '0px',
    buttonStyle: 'square',
    cardStyle: 'flat',
    headerStyle: 'fixed',
    footerStyle: 'detailed'
  },
  'Minimal White': {
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#666666',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0px',
    buttonStyle: 'pill',
    cardStyle: 'bordered',
    headerStyle: 'transparent',
    footerStyle: 'simple'
  },
  'Dark Premium': {
    primaryColor: '#bb86fc',
    secondaryColor: '#03dac6',
    accentColor: '#03dac6',
    backgroundColor: '#121212',
    textColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '12px',
    buttonStyle: 'pill',
    cardStyle: 'elevated',
    headerStyle: 'fixed',
    footerStyle: 'dark'
  },
  'Seasonal': {
    primaryColor: '#e056fd',
    secondaryColor: '#f1f2f6',
    accentColor: '#ff7f50',
    backgroundColor: '#ffffff',
    textColor: '#2f3542',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '8px',
    buttonStyle: 'rounded',
    cardStyle: 'elevated',
    headerStyle: 'fixed',
    footerStyle: 'dark'
  }
};

export default function ThemePage() {
  const { theme, updateTheme, applyTheme } = useTheme();
  const [tempConfig, setTempConfig] = useState<ThemeConfig | null>(null);
  const [activePreset, setActivePreset] = useState<ThemePreset>('Luxury Emerald');

  useEffect(() => {
    if (theme && !tempConfig) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTempConfig(theme.customConfig);
      setActivePreset(theme.activePreset);
    }
  }, [theme, tempConfig]);

  const handlePresetChange = (preset: ThemePreset) => {
    setActivePreset(preset);
    setTempConfig(presets[preset]);
    // Preview immediately
    applyTheme({ activePreset: preset, customConfig: presets[preset], useSeasonalTheme: theme?.useSeasonalTheme ?? false });
  };

  const handleConfigChange = (key: keyof ThemeConfig, value: string) => {
    if (tempConfig) {
      const newConfig = { ...tempConfig, [key]: value };
      setTempConfig(newConfig);
      applyTheme({ activePreset, customConfig: newConfig, useSeasonalTheme: theme?.useSeasonalTheme ?? false });
    }
  };

  const handleSave = async () => {
    if (tempConfig) {
      await updateTheme({ activePreset, customConfig: tempConfig, useSeasonalTheme: theme?.useSeasonalTheme ?? false });
      alert('Theme saved successfully!');
    }
  };

  const handleReset = () => {
    if (theme) {
      setTempConfig(theme.customConfig);
      setActivePreset(theme.activePreset);
      applyTheme(theme);
    }
  };

  if (!tempConfig) return <div>Loading theme...</div>;

  return (
    <div className={styles.container}>
      <h1>Theme Management</h1>
      
      <div className={styles.grid}>
        <div className={styles.controls}>
          <section>
            <h3>Presets</h3>
            <div className={styles.presetGrid}>
              {(Object.keys(presets) as ThemePreset[]).map(p => (
                <button 
                  key={p} 
                  className={`${styles.presetBtn} ${activePreset === p ? styles.active : ''}`}
                  onClick={() => handlePresetChange(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3>Custom Colors</h3>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label>Primary Color</label>
                <div className={styles.colorInput}>
                  <input type="color" value={tempConfig.primaryColor} onChange={(e) => handleConfigChange('primaryColor', e.target.value)} />
                  <input type="text" value={tempConfig.primaryColor} onChange={(e) => handleConfigChange('primaryColor', e.target.value)} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Secondary Color</label>
                <div className={styles.colorInput}>
                  <input type="color" value={tempConfig.secondaryColor} onChange={(e) => handleConfigChange('secondaryColor', e.target.value)} />
                  <input type="text" value={tempConfig.secondaryColor} onChange={(e) => handleConfigChange('secondaryColor', e.target.value)} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Background Color</label>
                <div className={styles.colorInput}>
                  <input type="color" value={tempConfig.backgroundColor} onChange={(e) => handleConfigChange('backgroundColor', e.target.value)} />
                  <input type="text" value={tempConfig.backgroundColor} onChange={(e) => handleConfigChange('backgroundColor', e.target.value)} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Text Color</label>
                <div className={styles.colorInput}>
                  <input type="color" value={tempConfig.textColor} onChange={(e) => handleConfigChange('textColor', e.target.value)} />
                  <input type="text" value={tempConfig.textColor} onChange={(e) => handleConfigChange('textColor', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3>Typography & Style</h3>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label>Font Family</label>
                <select value={tempConfig.fontFamily} onChange={(e) => handleConfigChange('fontFamily', e.target.value)}>
                  <option value="Inter, sans-serif">Inter (Modern)</option>
                  <option value="Roboto, sans-serif">Roboto (Clean)</option>
                  <option value="serif">Serif (Classic)</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Border Radius</label>
                <input type="text" value={tempConfig.borderRadius} onChange={(e) => handleConfigChange('borderRadius', e.target.value)} />
              </div>
            </div>
          </section>

          <div className={styles.actions}>
            <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
            <button className={styles.resetBtn} onClick={handleReset}>Reset to Default</button>
          </div>
        </div>

        <div className={styles.preview}>
          <h3>Live Preview</h3>
          <div className={styles.previewBox} style={{ 
            backgroundColor: tempConfig.backgroundColor,
            color: tempConfig.textColor,
            fontFamily: tempConfig.fontFamily,
            borderRadius: tempConfig.borderRadius
          }}>
            <h2 style={{ color: tempConfig.primaryColor }}>Heading Example</h2>
            <p>This is a preview of how your website will look with the current theme settings.</p>
            <button style={{ 
              backgroundColor: tempConfig.primaryColor, 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: tempConfig.borderRadius,
              marginTop: '10px'
            }}>
              Primary Button
            </button>
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              border: `1px solid ${tempConfig.accentColor}`,
              borderRadius: tempConfig.borderRadius
            }}>
              Accent Bordered Box
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
