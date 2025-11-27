'use client';

import { useState } from 'react';
import {
  FaCheck,
  FaEnvelope,
  FaFacebookF,
  FaLink,
  FaLinkedinIn,
  FaRedditAlien,
  FaWhatsapp,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export const ShareButtons = ({ url, title, description = '' }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}${
      description ? `&quote=${encodedDescription}` : ''
    }`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedDescription}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedDescription}%20${encodedUrl}`,
    email: `mailto:?subject=${description}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const openShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const shareButtons = [
    {
      name: 'X',
      icon: FaXTwitter,
      color: 'hover:bg-black hover:text-white',
      action: () => openShare('twitter'),
    },
    {
      name: 'Facebook',
      icon: FaFacebookF,
      color: 'hover:bg-blue-600 hover:text-white',
      action: () => openShare('facebook'),
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedinIn,
      color: 'hover:bg-blue-700 hover:text-white',
      action: () => openShare('linkedin'),
    },
    {
      name: 'Reddit',
      icon: FaRedditAlien,
      color: 'hover:bg-orange-600 hover:text-white',
      action: () => openShare('reddit'),
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'hover:bg-green-500 hover:text-white',
      action: () => openShare('whatsapp'),
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      color: 'hover:bg-gray-600 hover:text-white',
      action: () => openShare('email'),
    },
  ];

  return (
    <div className="my-8 border-t border-b border-gray-200 py-6 dark:border-gray-700">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Share this article</h3>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {shareButtons.map((button) => (
            <button
              key={button.name}
              onClick={button.action}
              className={`flex h-10 w-10 transform items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 dark:border-gray-600 dark:text-gray-400 ${button.color} `}
              title={`Share on ${button.name}`}
              aria-label={`Share on ${button.name}`}
            >
              <button.icon className="h-4 w-4" />
            </button>
          ))}

          {/* Copy Link Button */}
          <button
            onClick={copyToClipboard}
            className={`flex h-10 w-10 transform items-center justify-center rounded-full border border-gray-300 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 dark:border-gray-600 ${
              copied
                ? 'border-green-500 bg-green-500 text-white'
                : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400'
            } `}
            title={copied ? 'Copied!' : 'Copy link'}
            aria-label={copied ? 'Link copied' : 'Copy link'}
          >
            {copied ? <FaCheck className="h-4 w-4" /> : <FaLink className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {copied && (
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Link copied to clipboard!
          </span>
        </div>
      )}
    </div>
  );
};
