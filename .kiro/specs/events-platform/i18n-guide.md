# Internationalization (i18n) Guide

This guide explains how to use the internationalization system in the Events Platform application.

## Overview

The application supports two languages:

- **Ukrainian (uk)** - Primary language
- **English (en)** - Secondary language

The i18n system is built using `next-intl` and provides:

- Automatic locale detection and routing
- Translation files for all UI elements
- Date/time formatting with locale support
- Language switching functionality

## Translation Files

Translation files are located in the `messages/` directory:

- `messages/en.json` - English translations
- `messages/uk.json` - Ukrainian translations

### Translation Structure

Translations are organized into logical groups:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    ...
  },
  "nav": {
    "home": "Home",
    "events": "Events",
    ...
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    ...
  },
  "events": {
    "title": "Events",
    "createEvent": "Create Event",
    ...
  },
  "validation": {
    "required": "This field is required",
    ...
  },
  "errors": {
    "somethingWentWrong": "Something went wrong",
    ...
  }
}
```

## Using Translations in Components

### Basic Usage

```tsx
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("events");

  return (
    <div>
      <h1>{t("title")}</h1>
      <button>{t("createEvent")}</button>
    </div>
  );
}
```

### Multiple Translation Namespaces

```tsx
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  return (
    <div>
      <h1>{t("title")}</h1>
      <button>{tCommon("save")}</button>
      <nav>{tNav("home")}</nav>
    </div>
  );
}
```

### Getting Current Locale

```tsx
import { useLocale } from "next-intl";

export function MyComponent() {
  const locale = useLocale(); // 'en' or 'uk'

  return <div>Current locale: {locale}</div>;
}
```

## Date and Time Formatting

The application provides utility functions for formatting dates and times with locale support in `lib/utils.ts`.

### Available Functions

#### `formatDate(date, formatStr, locale)`

Format a date with a custom format string.

```tsx
import { formatDate } from "@/lib/utils";
import { useLocale } from "next-intl";

const locale = useLocale();
const formatted = formatDate(new Date(), "PPP", locale);
// English: "December 25th, 2024"
// Ukrainian: "25-е грудня 2024 р."
```

#### `formatDateTime(date, locale)`

Format a date and time together.

```tsx
import { formatDateTime } from "@/lib/utils";

const formatted = formatDateTime(new Date(), "en");
// "December 25th, 2024 at 3:30 PM"
```

#### `formatDateShort(date, locale)`

Format a date in short format.

```tsx
import { formatDateShort } from "@/lib/utils";

const formatted = formatDateShort(new Date(), "uk");
// "25 груд. 2024 р."
```

#### `formatTime(date, locale)`

Format just the time portion.

```tsx
import { formatTime } from "@/lib/utils";

const formatted = formatTime(new Date(), "en");
// "3:30 PM"
```

#### `formatRelativeDate(date, locale)`

Format a date relative to now (e.g., "2 hours ago").

```tsx
import { formatRelativeDate } from "@/lib/utils";

const formatted = formatRelativeDate(new Date(), "en");
// "2 hours ago" or "in 3 days"
```

#### `formatEventDate(date, locale)`

Smart formatting for event dates (shows "Today", "Tomorrow", or formatted date).

```tsx
import { formatEventDate } from "@/lib/utils";

const formatted = formatEventDate(new Date(), "uk");
// "Сьогодні, 15:30" or "25-е грудня 2024 р. о 15:30"
```

#### `getDateLabel(date, locale)`

Get a human-readable label for dates (Today, Tomorrow, Yesterday).

```tsx
import { getDateLabel } from "@/lib/utils";

const label = getDateLabel(new Date(), "en");
// "Today", "Tomorrow", "Yesterday", or null
```

#### `formatDateRange(startDate, endDate, locale)`

Format a date range.

```tsx
import { formatDateRange } from "@/lib/utils";

const formatted = formatDateRange(startDate, endDate, "en");
// "December 25th, 2024 - December 31st, 2024"
```

### Example: Event Card with Locale-Aware Formatting

```tsx
import { useLocale, useTranslations } from "next-intl";
import { formatEventDate } from "@/lib/utils";

export function EventCard({ event }) {
  const locale = useLocale();
  const t = useTranslations("events");

  return (
    <div>
      <h3>{event.title}</h3>
      <p>{formatEventDate(event.date, locale)}</p>
      <p>
        {t("location")}: {event.location}
      </p>
    </div>
  );
}
```

## Language Switching

The `LanguageSwitcher` component allows users to switch between languages:

```tsx
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

The language preference is persisted in cookies and the URL path.

## Adding New Translations

To add new translations:

1. Add the key to both `messages/en.json` and `messages/uk.json`
2. Use the translation in your component with `useTranslations`

Example:

```json
// messages/en.json
{
  "events": {
    "newKey": "New Translation"
  }
}

// messages/uk.json
{
  "events": {
    "newKey": "Новий переклад"
  }
}
```

```tsx
// Component
const t = useTranslations("events");
<div>{t("newKey")}</div>;
```

## Translation Categories

### Common (`common`)

General UI elements used across the application:

- Actions: save, delete, edit, create, cancel, submit
- States: loading, error, success
- Navigation: back, next, close

### Navigation (`nav`)

Navigation menu items and links:

- Main pages: home, events, myEvents, myRegistrations
- Auth: login, register, logout, profile

### Authentication (`auth`)

Login and registration forms:

- Form fields: email, password, name
- Actions: login, register, loginWithGoogle
- Messages: loginSuccessful, accountCreated

### Events (`events`)

Event-related content:

- Labels: title, description, date, location, capacity
- Actions: register, cancelRegistration, createEvent, editEvent
- States: eventFull, alreadyRegistered, registrationSuccess

### Validation (`validation`)

Form validation error messages:

- Field requirements: required, emailInvalid, passwordMin
- Format validation: urlInvalid, dateInFuture
- Length validation: titleMin, titleMax, descriptionMin

### Errors (`errors`)

Error messages and error pages:

- General: somethingWentWrong, unexpectedError
- HTTP errors: unauthorized, forbidden, notFound
- Network: networkError, serverError

### Accessibility (`accessibility`)

Screen reader labels and ARIA descriptions:

- Navigation: skipToMainContent, openMobileMenu
- Actions: viewAllEvents, editThisEvent, registerForEvent

### Theme (`theme`)

Theme switching labels:

- Modes: light, dark, system
- Actions: toggleTheme, switchToLight

### Language (`language`)

Language switching labels:

- Languages: english, ukrainian
- Actions: switchLanguage, selectLanguage

### Date (`date`)

Date-related labels:

- Relative: today, tomorrow, yesterday
- Periods: thisWeek, nextWeek, thisMonth
- Categories: past, upcoming

## Best Practices

1. **Always use translations** - Never hardcode text in components
2. **Use appropriate namespaces** - Group related translations together
3. **Keep keys descriptive** - Use clear, meaningful key names
4. **Maintain consistency** - Use the same translations for the same concepts
5. **Test both languages** - Always verify translations in both English and Ukrainian
6. **Use date utilities** - Always use the provided date formatting functions for locale-aware dates
7. **Add accessibility labels** - Include translations for screen readers and ARIA labels

## Testing Translations

To test language switching:

1. Start the development server: `npm run dev`
2. Navigate to the application
3. Use the language switcher in the header
4. Verify all text updates to the selected language
5. Check that dates and times are formatted correctly for each locale

## Common Issues

### Translation not found

If you see a translation key instead of text:

- Check that the key exists in both translation files
- Verify the namespace is correct
- Ensure you're using the correct translation hook

### Date formatting issues

If dates aren't formatting correctly:

- Make sure you're passing the locale to the formatting function
- Use `useLocale()` to get the current locale
- Check that the date is a valid Date object

### Language not switching

If the language doesn't change:

- Clear browser cookies
- Check that the locale is in the URL path
- Verify middleware is configured correctly
