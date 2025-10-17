import React from 'react';
import { getInitials, getProfileColor } from '../../utils/helpers.js';

export function Avatar({ name, size = 40, image = null }) {
  const initials = getInitials(name);
  const color = getProfileColor(name);

  return (
    <div style={{
      ...styles.avatar,
      width: size,
      height: size,
      fontSize: size / 2,
      background: image ? `url(${image})` : color
    }}>
      {!image && <span style={styles.initials}>{initials}</span>}
    </div>
  );
}

const styles = {
  avatar: {
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    fontWeight: 'bold'
  },
  initials: {
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
  }
};