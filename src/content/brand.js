export const BRAND = {
  name: 'mlibrary',
  email: 'info@mlibrary.example',
  phone: '',
  phoneHref: '',
  social: {
    facebook: '',
    instagram: '',
  },
};

export const hasUrl = (value) => typeof value === 'string' && /^https?:\/\//.test(value);
