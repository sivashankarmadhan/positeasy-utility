import { memo } from 'react';
// @mui
import { Box, useTheme } from '@mui/material';
//
import BackgroundIllustration from './BackgroundIllustration';

// ----------------------------------------------------------------------

function FallbackIllustration({ ...other }) {
  const theme = useTheme();


  const PRIMARY_MAIN = theme.palette.primary.main;

  console.log('Primary_main', PRIMARY_MAIN, theme.palette.primary);
  

  return (
    <Box {...other}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="auto"
        viewBox="0 0 1119.60911 699"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        role="img"
        artist="Katerina Limpitsouni"
        source="https://undraw.co/"
      >
        <title></title>
        <circle cx="292.60911" cy="213" r="213" fill="#862e70" opacity="0.1"/>
        <path
          d="M816.14,120,827,126.87l-6.6-12a10.76,10.76,0,0,1,6.57-2.34h.18a13,13,0,0,0,2.25-.17l3.68,2.34-1.58-2.87A13.21,13.21,0,0,0,838,107l6.59,4.18-4.17-7.57c3.86-4.63,9-7.47,14.77-7.47,6.85,0,13,4.08,16.9,10.43a12.61,12.61,0,0,0,11.17,6h.36c7.57,0,13.7,8.57,13.7,19.16s-6.13,19.15-13.7,19.15a10.34,10.34,0,0,1-4.77-1.19,19.72,19.72,0,0,0-16.58-.32,17.35,17.35,0,0,1-14.09,0,19.77,19.77,0,0,0-16.44.32,10.32,10.32,0,0,1-4.72,1.16c-7.56,0-13.7-8.57-13.7-19.15A24.36,24.36,0,0,1,816.14,120Z"
          transform="translate(-88.65 -57.09)"
          fill="#862e70"
          opacity="0.1"
        />
        <path
          d="M836.62,148a20.24,20.24,0,0,1,11.74,1.28,17.29,17.29,0,0,0,14.09,0,19.76,19.76,0,0,1,16.58.33,10.31,10.31,0,0,0,4.77,1.19c6.72,0,12.32-6.77,13.48-15.7a12.93,12.93,0,0,1-3.36-3.62C890,125.11,883.87,121,877,121s-12.88,4-16.82,10.31A13,13,0,0,1,849,137.48h-.17C843.51,137.47,838.87,141.76,836.62,148Z"
          transform="translate(-88.65 -57.09)"
          fill="#862e70"
          opacity="0.1"
        />
        
        <path
          d="M209,247.54a29,29,0,0,0-16.77,1.82,24.71,24.71,0,0,1-20.14-.05,28.22,28.22,0,0,0-23.68.47,14.75,14.75,0,0,1-6.82,1.7c-9.6,0-17.59-9.67-19.25-22.43a18.41,18.41,0,0,0,4.8-5.17c5.63-9.07,14.35-14.9,24.14-14.9s18.4,5.76,24,14.73a18.52,18.52,0,0,0,16,8.77h.25C199.11,232.47,205.73,238.6,209,247.54Z"
          transform="translate(-88.65 -200.09)"
          fill="#862e70"
          opacity="0.1"
        />
        <path
          d="M238.2,207.49l-15.52,9.84,9.42-17.13a15.34,15.34,0,0,0-9.39-3.35h-.25a18.16,18.16,0,0,1-3.22-.24L214,200l2.26-4.1a18.7,18.7,0,0,1-9.2-7l-9.42,6L203.57,184c-5.51-6.61-12.93-10.66-21.09-10.66-9.79,0-18.51,5.82-24.14,14.89a18.05,18.05,0,0,1-16,8.61h-.53c-10.81,0-19.57,12.25-19.57,27.37s8.76,27.37,19.57,27.37a14.61,14.61,0,0,0,6.82-1.71,28.22,28.22,0,0,1,23.68-.46,24.71,24.71,0,0,0,20.14.05,28.25,28.25,0,0,1,23.48.45,14.65,14.65,0,0,0,6.74,1.67c10.81,0,19.57-12.26,19.57-27.37A34.76,34.76,0,0,0,238.2,207.49Z"
          transform="translate(-88.65 -200.09)"
          fill="#862e70"
          opacity="0.1"
        />

        <path
          d="M836.62,148a20.24,20.24,0,0,1,11.74,1.28,17.29,17.29,0,0,0,14.09,0,19.76,19.76,0,0,1,16.58.33,10.31,10.31,0,0,0,4.77,1.19c6.72,0,12.32-6.77,13.48-15.7a12.93,12.93,0,0,1-3.36-3.62C890,125.11,883.87,121,877,121s-12.88,4-16.82,10.31A13,13,0,0,1,849,137.48h-.17C843.51,137.47,838.87,141.76,836.62,148Z"
          transform="translate(+200.65 -120.09)"
          fill="#862e70"
          opacity="0.1"
        />
        <path
          d="M816.14,120,827,126.87l-6.6-12a10.76,10.76,0,0,1,6.57-2.34h.18a13,13,0,0,0,2.25-.17l3.68,2.34-1.58-2.87A13.21,13.21,0,0,0,838,107l6.59,4.18-4.17-7.57c3.86-4.63,9-7.47,14.77-7.47,6.85,0,13,4.08,16.9,10.43a12.61,12.61,0,0,0,11.17,6h.36c7.57,0,13.7,8.57,13.7,19.16s-6.13,19.15-13.7,19.15a10.34,10.34,0,0,1-4.77-1.19,19.72,19.72,0,0,0-16.58-.32,17.35,17.35,0,0,1-14.09,0,19.77,19.77,0,0,0-16.44.32,10.32,10.32,0,0,1-4.72,1.16c-7.56,0-13.7-8.57-13.7-19.15A24.36,24.36,0,0,1,816.14,120Z"
          transform="translate(+200.65 -120.09)"
          fill="#862e70"
          opacity="0.1"
        />

        
        <path
          d="M31.39089,151.64237c0,77.49789,48.6181,140.20819,108.70073,140.20819"
          transform="translate(-31.39089 -100.5)"
          fill="#2f2e41"
        />
        <path
          d="M140.09162,291.85056c0-78.36865,54.255-141.78356,121.30372-141.78356"
          transform="translate(-31.39089 -100.5)"
          fill="#862e70"
        />
        <path
          d="M70.77521,158.66768c0,73.61476,31.00285,133.18288,69.31641,133.18288"
          transform="translate(-31.39089 -100.5)"
          fill="#862e70"
        />
        <path
          d="M140.09162,291.85056c0-100.13772,62.7103-181.16788,140.20819-181.16788"
          transform="translate(-31.39089 -100.5)"
          fill="#2f2e41"
        />
        <path
          d="M117.22379,292.83905s15.41555-.47479,20.06141-3.783,23.713-7.2585,24.86553-1.95278,23.16671,26.38821,5.76263,26.5286-40.43935-2.711-45.07627-5.53549S117.22379,292.83905,117.22379,292.83905Z"
          transform="translate(-31.39089 -100.5)"
          fill="#a8a8a8"
        />
        <path
          d="M168.224,311.78489c-17.40408.14042-40.43933-2.71094-45.07626-5.53548-3.53126-2.151-4.93843-9.86945-5.40926-13.43043-.32607.014-.51463.02-.51463.02s.97638,12.43276,5.61331,15.2573,27.67217,5.67589,45.07626,5.53547c5.02386-.04052,6.7592-1.82793,6.66391-4.47526C173.87935,310.756,171.96329,311.75474,168.224,311.78489Z"
          transform="translate(-31.39089 -100.5)"
          opacity="0.2"
        />
        <ellipse cx="198.60911" cy="424.5" rx="187" ry="25.43993" fill="#3f3d56" />
        <ellipse cx="198.60911" cy="424.5" rx="157" ry="21.35866" opacity="0.1" />
        <ellipse cx="836.60911" cy="660.5" rx="283" ry="38.5" fill="#3f3d56" />
        <ellipse cx="310.60911" cy="645.5" rx="170" ry="23.12721" fill="#3f3d56" />
        <path
          d="M494,726.5c90,23,263-30,282-90"
          transform="translate(-31.39089 -100.5)"
          fill="none"
          stroke="#2f2e41"
          stroke-miterlimit="10"
          stroke-width="2"
        />
        <path
          d="M341,359.5s130-36,138,80-107,149-17,172"
          transform="translate(-31.39089 -100.5)"
          fill="none"
          stroke="#2f2e41"
          stroke-miterlimit="10"
          stroke-width="2"
        />
        <path
          d="M215.40233,637.78332s39.0723-10.82,41.47675,24.04449-32.15951,44.78287-5.10946,51.69566"
          transform="translate(-31.39089 -100.5)"
          fill="none"
          stroke="#2f2e41"
          stroke-miterlimit="10"
          stroke-width="2"
        />
        <path
          d="M810.09554,663.73988,802.218,714.03505s-38.78182,20.60284-11.51335,21.20881,155.73324,0,155.73324,0,24.84461,0-14.54318-21.81478l-7.87756-52.719Z"
          transform="translate(-31.39089 -100.5)"
          fill="#2f2e41"
        />
        <path
          d="M785.21906,734.69812c6.193-5.51039,16.9989-11.252,16.9989-11.252l7.87756-50.2952,113.9216.10717,7.87756,49.582c9.185,5.08711,14.8749,8.987,18.20362,11.97818,5.05882-1.15422,10.58716-5.44353-18.20362-21.38921l-7.87756-52.719-113.9216,3.02983L802.218,714.03506S769.62985,731.34968,785.21906,734.69812Z"
          transform="translate(-31.39089 -100.5)"
          opacity="0.1"
        />

        <rect
          x="578.43291"
          y="212.68859"
          width="513.25314"
          height="357.51989"
          rx="18.04568"
          fill="#2d1c1c"
        />
        <rect x="595.70294" y="231.77652" width="478.71308" height="267.83694" fill="#fff" />
        <circle cx="835.05948" cy="223.29299" r="3.02983" fill="#f2f2f2" />
        <path
          d="M588.7,348.49c-8.73-11.6-21.38-18.92-35.46-18.92s-26.73,7.32-35.46,18.92a38.39,38.39,0,0,0,8.4,12.65,38.28,38.28,0,0,0,62.52-12.65Z"
          transform="translate(+280.65 -10.09)"
          fill="#862e70"
        />
        <path
          d="M513.17,355.28a9.17,9.17,0,0,1-1.76-1,7.06,7.06,0,0,1-1.94-2.51,7.18,7.18,0,1,0-11.72,1.74,8,8,0,0,0,1.7,1.37,4.94,4.94,0,0,1,1.91,2,14.44,14.44,0,0,0,3.32,4.36,29,29,0,0,0,4.55,3.2A66.31,66.31,0,0,0,505.49,384a27.05,27.05,0,0,0-7.62,1.23,12.29,12.29,0,0,0-3.53,1.76,8.48,8.48,0,0,0-.87-.06,7.19,7.19,0,1,0,6.73,9.72,4.59,4.59,0,0,1,3.71-3,16.75,16.75,0,0,1,1.85-.12,64.4,64.4,0,0,0,8.55,26.67c-4.24,3.29-6.85,6.88-7.95,10.86a3,3,0,0,0-.57.41,6.81,6.81,0,0,0-.84.78A7.18,7.18,0,1,0,517,434.6a4.71,4.71,0,0,1,1.17-5.08c.48-.45,1-.93,1.7-1.46,8.11,9.47,17.76,15.54,29.81,16.26V380.07C533.75,379.2,519.87,368.83,513.17,355.28ZM613,387a7.93,7.93,0,0,0-.87.06,13.56,13.56,0,0,0-3.53-1.76,26.86,26.86,0,0,0-7.62-1.23,67.76,67.76,0,0,0-3.74-19.55,29,29,0,0,0,4.55-3.2,15.58,15.58,0,0,0,3.44-4.57A4.22,4.22,0,0,1,607,355a0,0,0,0,0,0,0,7.18,7.18,0,1,0-10-3.17,6.82,6.82,0,0,1-1.94,2.51,18.85,18.85,0,0,1-1.76,1.29c-6.7,13.54-20.57,23.62-36.48,24.49v64.31c12-.72,21.71-6.82,29.81-16.26.63.5,1.16.95,1.61,1.37a4.86,4.86,0,0,1,1.26,5.23,7.18,7.18,0,1,0,12.08-2.33,6.81,6.81,0,0,0-.84-.78c-.33-.26-.57-.41-.57-.41-1.1-4-3.7-7.57-8-10.86a64.4,64.4,0,0,0,8.55-26.67,15.9,15.9,0,0,1,1.77.12,4.8,4.8,0,0,1,3.85,3,7.18,7.18,0,0,0,13.85-2.18A7.29,7.29,0,0,0,613,387Z"
          transform="translate(+280.65 -10.09)"
          fill="#862e70"
        />
        <path
          d="M1123.07694,621.32226V652.6628a18.04341,18.04341,0,0,1-18.04568,18.04568H627.86949A18.04341,18.04341,0,0,1,609.8238,652.6628V621.32226Z"
          transform="translate(-31.39089 -100.5)"
          fill="#2f2e41"
        />
        <polygon
          points="968.978 667.466 968.978 673.526 642.968 673.526 642.968 668.678 643.417 667.466 651.452 645.651 962.312 645.651 968.978 667.466"
          fill="#2f2e41"
        />
        <path
          d="M1125.828,762.03359c-.59383,2.539-2.83591,5.21743-7.90178,7.75032-18.179,9.08949-55.1429-2.42386-55.1429-2.42386s-28.4804-4.84773-28.4804-17.573a22.72457,22.72457,0,0,1,2.49658-1.48459c7.64294-4.04351,32.98449-14.02122,77.9177.42248a18.73921,18.73921,0,0,1,8.54106,5.59715C1125.07908,756.45353,1126.50669,759.15715,1125.828,762.03359Z"
          transform="translate(-31.39089 -100.5)"
          fill="#2f2e41"
        />
        <path
          d="M1125.828,762.03359c-22.251,8.526-42.0843,9.1622-62.43871-4.975-10.26507-7.12617-19.59089-8.88955-26.58979-8.75618,7.64294-4.04351,32.98449-14.02122,77.9177.42248a18.73921,18.73921,0,0,1,8.54106,5.59715C1125.07908,756.45353,1126.50669,759.15715,1125.828,762.03359Z"
          transform="translate(-31.39089 -100.5)"
          opacity="0.1"
        />
        <ellipse cx="1066.53846" cy="654.13477" rx="7.87756" ry="2.42386" fill="#f2f2f2" />
        <circle cx="835.05948" cy="545.66686" r="11.51335" fill="#f2f2f2" />
        <polygon
          points="968.978 667.466 968.978 673.526 642.968 673.526 642.968 668.678 643.417 667.466 968.978 667.466"
          opacity="0.1"
        />
        <rect x="108.60911" y="159" width="208" height="242" fill="#3f3d56" />
        <rect x="87.60911" y="135" width="250" height="86" fill="#5A0B45" />
        <rect x="87.60911" y="237" width="250" height="86" fill="#5A0B45" />
        <rect x="87.60911" y="339" width="250" height="86" fill="#5A0B45" />
        <rect x="271.60911" y="150" width="16" height="16" fill="#fff" opacity="0.4" />
        <rect x="294.60911" y="150" width="16" height="16" fill="#fff" opacity="0.8" />
        <rect x="317.60911" y="150" width="16" height="16" fill="#fff" />
        <rect x="271.60911" y="251" width="16" height="16" fill="#fff" opacity="0.4" />
        <rect x="294.60911" y="251" width="16" height="16" fill="#fff" opacity="0.8" />
        <rect x="317.60911" y="251" width="16" height="16" fill="#fff" />
        <rect x="271.60911" y="352" width="16" height="16" fill="#fff" opacity="0.4" />
        <rect x="294.60911" y="352" width="16" height="16" fill="#fff" opacity="0.8" />
        <rect x="317.60911" y="352" width="16" height="16" fill="#fff" />
        <circle cx="316.60911" cy="538" r="79" fill="#2f2e41" />
        <rect x="280.60911" y="600" width="24" height="43" fill="#862e70" />
        <rect x="328.60911" y="600" width="24" height="43" fill="#862e70" />
        <ellipse cx="300.60911" cy="643.5" rx="20" ry="7.5" fill="#862e70" />
        <ellipse cx="348.60911" cy="642.5" rx="20" ry="7.5" fill="#862e70" />
        <circle cx="318.60911" cy="518" r="27" fill="#fff" />
        <circle cx="318.60911" cy="518" r="9" fill="#3f3d56" />
        <path
          d="M271.36733,565.03228c-6.37889-28.56758,14.01185-57.43392,45.544-64.47477s62.2651,10.41,68.644,38.9776-14.51861,39.10379-46.05075,46.14464S277.74622,593.59986,271.36733,565.03228Z"
          transform="translate(-31.39089 -100.5)"
          fill="#862e70"
        />
        <ellipse
          cx="417.21511"
          cy="611.34365"
          rx="39.5"
          ry="12.40027"
          transform="translate(-238.28665 112.98044) rotate(-23.17116)"
          fill="#2f2e41"
        />
        <ellipse
          cx="269.21511"
          cy="664.34365"
          rx="39.5"
          ry="12.40027"
          transform="translate(-271.07969 59.02084) rotate(-23.17116)"
          fill="#2f2e41"
        />
        <path
          d="M394,661.5c0,7.732-19.90861,23-42,23s-43-14.268-43-22,20.90861-6,43-6S394,653.768,394,661.5Z"
          transform="translate(-31.39089 -100.5)"
          fill="#fff"
        />
        <ellipse
          cx="468.63"
          cy="660.88"
          rx="180"
          ry="33"
          fill="#862e70"
          opacity="0.1"
          transform="translate(-120.39089 +10.5)"
        />
      </svg>
      
    </Box>
  );
}

export default memo(FallbackIllustration);
