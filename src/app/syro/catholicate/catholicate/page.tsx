import { redirect } from 'next/navigation';

/**
 * Redirect to the single Catholicate introduction page.
 * Content previously at /syro/catholicate/catholicate is now at /syro/catholicate-intro.
 */
export default function CatholicateOverviewRedirect() {
  redirect('/syro/catholicate-intro');
}
