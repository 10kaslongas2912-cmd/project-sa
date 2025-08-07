import React from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import ReactConfetti from 'react-confetti';

const Confetti: React.FC = () => {
  // ใช้ Hook เพื่อรับขนาดหน้าจอ
  const { width, height } = useWindowSize();

  return (
    <ReactConfetti
      width={width}
      height={height}
      recycle={false} // ทำให้เล่นแค่ครั้งเดียว
      numberOfPieces={200} // จำนวนลูกปา
      initialVelocityX={5} // ความเร็วเริ่มต้นในแกน X
      initialVelocityY={20} // ความเร็วเริ่มต้นในแกน Y
      colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722']}
    />
  );
};

export default Confetti;