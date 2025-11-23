import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to splash/onboarding page
  redirect('/splash')
}
