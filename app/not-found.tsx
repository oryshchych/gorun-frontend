import { redirect } from 'next/navigation';

export default function RootNotFound() {
  // Redirect to the default locale's not-found page
  redirect('/uk/not-found');
}
