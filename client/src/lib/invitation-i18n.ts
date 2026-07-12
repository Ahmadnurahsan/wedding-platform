export type Language = 'id' | 'en' | 'hi'

interface TranslationMap {
  [key: string]: { id: string; en: string; hi: string }
}

export const labels: Record<string, { id: string; en: string; hi: string }> = {
  theWeddingOf: {
    id: 'Undangan Pernikahan',
    en: 'The Wedding of',
    hi: 'विवाह आमंत्रण',
  },
  openInvitation: {
    id: 'Buka Undangan',
    en: 'Open Invitation',
    hi: 'आमंत्रण खोलें',
  },
  toYth: {
    id: 'Kepada Yth.',
    en: 'To the Honorable',
    hi: 'आदरणीय को',
  },
  couple: {
    id: 'Kami Berdua',
    en: 'The Couple',
    hi: 'हम दोनों',
  },
  groom: {
    id: 'Pria',
    en: 'Groom',
    hi: 'दूल्हा',
  },
  bride: {
    id: 'Wanita',
    en: 'Bride',
    hi: 'दुल्हन',
  },
  event: {
    id: 'Acara',
    en: 'Event',
    hi: 'कार्यक्रम',
  },
  countdown: {
    id: 'Menuju hari bahagia',
    en: 'Counting down to the happy day',
    hi: 'खुशी के दिन की प्रतीक्षा',
  },
  day: {
    id: 'Hari',
    en: 'Day',
    hi: 'दिन',
  },
  hour: {
    id: 'Jam',
    en: 'Hour',
    hi: 'घंटा',
  },
  minute: {
    id: 'Menit',
    en: 'Minute',
    hi: 'मिनट',
  },
  second: {
    id: 'Detik',
    en: 'Second',
    hi: 'सेकंड',
  },
  gallery: {
    id: 'Galeri',
    en: 'Gallery',
    hi: 'गैलरी',
  },
  rsvp: {
    id: 'Konfirmasi Kehadiran',
    en: 'RSVP',
    hi: 'उपस्थिति की पुष्टि',
  },
  rsvpSub: {
    id: 'Mohon konfirmasi sebelum acara',
    en: 'Please confirm before the event',
    hi: 'कृपया कार्यक्रम से पहले पुष्टि करें',
  },
  rsvpThank: {
    id: 'Terima kasih! Konfirmasi kamu sudah diterima.',
    en: 'Thank you! Your confirmation has been received.',
    hi: 'धन्यवाद! आपकी पुष्टि प्राप्त हो गई है।',
  },
  attending: {
    id: 'Hadir',
    en: 'Attending',
    hi: 'उपस्थित',
  },
  notAttending: {
    id: 'Tidak Hadir',
    en: 'Not Attending',
    hi: 'अनुपस्थित',
  },
  guestCount: {
    id: 'Jumlah tamu',
    en: 'Number of guests',
    hi: 'मेहमानों की संख्या',
  },
  send: {
    id: 'Kirim',
    en: 'Send',
    hi: 'भेजें',
  },
  location: {
    id: 'Lokasi',
    en: 'Location',
    hi: 'स्थान',
  },
  maps: {
    id: 'Buka Google Maps',
    en: 'Open Google Maps',
    hi: 'Google Maps खोलें',
  },
  wishes: {
    id: 'Ucapan & Doa',
    en: 'Wishes & Prayers',
    hi: 'शुभकामनाएं और प्रार्थनाएं',
  },
  wishPlaceholder: {
    id: 'Tulis ucapan & doa...',
    en: 'Write your wishes...',
    hi: 'अपनी शुभकामनाएं लिखें...',
  },
  wishThank: {
    id: 'Ucapan berhasil dikirim!',
    en: 'Wishes sent successfully!',
    hi: 'शुभकामनाएं सफलतापूर्वक भेजी गईं!',
  },
  gift: {
    id: 'Tanda Kasih',
    en: 'Gift',
    hi: 'उपहार',
  },
  giftDesc: {
    id: 'Doa restu adalah kado terindah. Jika ingin memberi tanda kasih, dapat melalui:',
    en: 'Your prayers are the best gift. If you wish to give a token of love, you can send it through:',
    hi: 'आपकी प्रार्थनाएं सबसे अच्छा उपहार हैं। यदि आप प्यार का प्रतीक देना चाहते हैं, तो आप इसके माध्यम से भेज सकते हैं:',
  },
  copy: {
    id: 'Salin nomor rekening',
    en: 'Copy account number',
    hi: 'खाता नंबर कॉपी करें',
  },
  footer: {
    id: 'Terima kasih atas doa & restu',
    en: 'Thank you for your prayers and blessings',
    hi: 'आपकी प्रार्थनाओं और आशीर्वाद के लिए धन्यवाद',
  },
  invitationNotFound: {
    id: 'Undangan Tidak Ditemukan',
    en: 'Invitation Not Found',
    hi: 'आमंत्रण नहीं मिला',
  },
  invitationNotFoundDesc: {
    id: 'Link undangan mungkin sudah tidak aktif atau belum dipublikasikan.',
    en: 'The invitation link may be inactive or not yet published.',
    hi: 'आमंत्रण लिंक निष्क्रिय हो सकता है या अभी तक प्रकाशित नहीं हुआ है।',
  },
}

export const languageNames: Record<Language, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
  hi: 'हिन्दी',
}

export const languageFlags: Record<Language, string> = {
  id: '🇮🇩',
  en: '🇬🇧',
  hi: '🇮🇳',
}

export function t(key: string, lang: Language): string {
  return labels[key]?.[lang] || labels[key]?.id || key
}
