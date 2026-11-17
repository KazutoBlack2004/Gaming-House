import { redirect } from 'next/navigation';

export default function AdminPortalRootPage() {
  redirect('/portal-admin-secure/dashboard');
}
