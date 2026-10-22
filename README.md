# BIGFISH storefront

## WhatsApp enquiries

Set `VITE_WHATSAPP_NUMBER` to the shop's WhatsApp destination in international format using digits only (country code included, without a leading `+`). For local development, put it in `.env.local`. For a production build, set the same variable in the deployment environment before building. `.env.local` is ignored by Git.

If the variable is unset, product enquiry actions explain that WhatsApp is unavailable and direct customers to the Contact page email. The Contact page also displays an unavailable state instead of a broken WhatsApp link.

The destination is not printed in the storefront interface. WhatsApp click-to-chat links contain the destination and are public to anyone who follows or inspects the link; this configuration does not make the number secret. Enquiries open as drafts for the customer to review and send. Opening WhatsApp does not place or confirm an order.

## Development

Install dependencies with `npm install`, then run `npm run dev`. Use `npm run build` to create the production bundle and `npm run lint` to run Oxlint.
