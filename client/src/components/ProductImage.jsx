import { useState } from 'react';

const ICONS = {
  'Food & Coffee': '☕',
  'Clothing & Textiles': '🧵',
  Handicrafts: '🏺',
  Electronics: '🎧',
  'Home & Living': '🏠',
  'Beauty & Health': '🧴',
};

// fit="cover": the photo fills the box (shop cards)
// fit="contain": the whole photo is shown, never cropped (product page)
export default function ProductImage({
  product,
  className = '',
  iconClass = 'text-5xl',
  fit = 'cover',
}) {
  // Remember which link failed, so a new link gets a fresh try
  const [failedUrl, setFailedUrl] = useState(null);
  const showPhoto = product.image_url && failedUrl !== product.image_url;

  if (showPhoto && fit === 'contain') {
    return (
      <div className={`relative overflow-hidden bg-panel2 ${className}`}>
        <img
          src={product.image_url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
        />
        <img
          src={product.image_url}
          alt={product.name}
          onError={() => setFailedUrl(product.image_url)}
          className="relative h-full w-full object-contain"
        />
      </div>
    );
  }

  if (showPhoto) {
    return (
      <div className={`overflow-hidden bg-panel2 ${className}`}>
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          onError={() => setFailedUrl(product.image_url)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-panel2 to-ink ${iconClass} ${className}`}
    >
      {ICONS[product.category_name] || '🛍️'}
    </div>
  );
}