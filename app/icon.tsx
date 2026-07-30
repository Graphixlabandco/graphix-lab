import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

// Route segment config
export const runtime = 'nodejs';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default async function Icon() {
  const filePath = path.join(process.cwd(), 'public', 'logo-favicon.png');
  const imageBuffer = fs.readFileSync(filePath);
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64Image}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'transparent',
        }}
      >
        <img
          src={dataUrl}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
