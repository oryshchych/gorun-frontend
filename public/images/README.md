# Images Directory Structure

This directory contains all static images for the GoRun application.

## Directory Organization

### `/logos/`
- Application logos and branding
- Examples: `logo.svg`, `logo-dark.svg`, `logo-light.svg`
- Usage: `<Image src="/images/logos/logo.svg" alt="GoRun Logo" />`

### `/events/`
- Event-related images and placeholders
- Examples: `placeholder.jpg`, `default-event.png`
- Usage: `<Image src="/images/events/placeholder.jpg" alt="Event placeholder" />`

### `/icons/`
- Custom SVG icons and graphics
- Examples: `running.svg`, `sports.svg`
- Usage: `<Image src="/images/icons/running.svg" alt="Running icon" />`

### `/illustrations/`
- Hero images, backgrounds, and illustrations
- Examples: `hero-bg.jpg`, `404-illustration.svg`
- Usage: `<Image src="/images/illustrations/hero-bg.jpg" alt="Hero background" />`

## Usage Guidelines

1. **Always use Next.js Image component** for better performance:
   ```tsx
   import Image from 'next/image';
   
   <Image 
     src="/images/logos/logo.svg" 
     alt="GoRun Logo"
     width={200}
     height={50}
   />
   ```

2. **File naming conventions**:
   - Use kebab-case: `event-placeholder.jpg`
   - Include size if multiple versions: `logo-small.svg`, `logo-large.svg`
   - Use descriptive names: `running-icon.svg` not `icon1.svg`

3. **Supported formats**:
   - **SVG**: For logos, icons, and simple graphics
   - **PNG**: For images with transparency
   - **JPG/JPEG**: For photos and complex images
   - **WebP**: For optimized web images (Next.js can auto-convert)

4. **Optimization**:
   - Compress images before adding them
   - Use appropriate formats (SVG for icons, JPG for photos)
   - Consider using Next.js Image optimization features

## Examples

```tsx
// Logo in header
<Image 
  src="/images/logos/logo.svg" 
  alt="GoRun"
  width={120}
  height={40}
/>

// Event placeholder
<Image 
  src="/images/events/placeholder.jpg" 
  alt="Event placeholder"
  width={400}
  height={300}
  className="rounded-lg"
/>

// Icon in button
<Image 
  src="/images/icons/running.svg" 
  alt=""
  width={20}
  height={20}
  className="mr-2"
/>
```