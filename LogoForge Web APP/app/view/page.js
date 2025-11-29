// Import the helper
import { forceDownload } from '@/lib/utils'; 

// Update the PLP Button onClick
<button 
  onClick={() => {
     // Check user/token logic first...
     if(hasAccess) {
        // Use the fix for PLP files to ensure PixelLab can open them
        forceDownload(logo.url_plp, `${logo.title.replace(/\s/g, '_')}.plp`);
     }
  }}
  // ... rest of button props
>
