import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import '../../../src/style.css';
import { xor } from 'lodash';
import { el } from 'date-fns/locale';

export default function Carousel({ children: slides, autoSlide = true, autoSlideInterval = 3000 }) {
  const [curr, setCurr] = useState(0);

  const next = () => {
    setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1));
  };

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, []);

  const handleDotClick = (i) => {
    setCurr(i);
  };

  const description = [
    'Optimize your business',
    'Manage Sales, Inventory and other transactions',
    'Easy payments',
  ];

  const textDescription = description.find(function (value, i) {
    if (curr === i) {
      return value;
    }
  });

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        paddingTop: '95px',
        height: '100%',
        paddingBottom: '4rem',
        backgroundColor: '#f5f5f5',
      }}
      className="container"
    >
      <div
        style={{
          transform: `translateX(-${curr * 100}%)`,
          display: 'flex',
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
        }}
      >
        {slides}
      </div>

      <h3
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '15px',
          paddingBottom: '25px',
          textAlign: 'center',
        }}
      >
        {textDescription}
      </h3>

      <div
        className="three-dot"
        style={{
          position: 'absolute',
          right: '0px',
          bottom: '5px',
          left: '0px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          // paddingBottom: '20px',
          gap: '15px',
        }}
      >
        <div
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
        >
          {slides.map((_, i) => (
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#5a0a45',
                borderRadius: '9999px',
                transitionProperty: 'all',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDuration: '150ms',
              }}
              className={`
                ${curr === i ? 'three-dots-padding' : 'three-dots-opacity'}
              `}
              onClick={() => handleDotClick(i)}
            />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            className="next-btn"
            variant="contained"
            size="medium"
            sx={{ display: 'flex', justifyContent: 'center' }}
            onClick={next}
          >
            {curr === 2 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
