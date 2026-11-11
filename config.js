// One place to connect every waitlist page. How to fill it: README.md.
// Until formUrl is set, the forms tell the visitor they aren't connected yet; nothing is lost silently.
window.WAITLIST_CONFIG = {
  formUrl: '',   // https://docs.google.com/forms/d/e/<id>/formResponse
  entries: { email: '', app: '', answer: '', source: '' },   // 'entry.123456789'
  goatcounter: '',   // https://<code>.goatcounter.com/count
  contact: ''        // brand inbox shown on the privacy page
};
