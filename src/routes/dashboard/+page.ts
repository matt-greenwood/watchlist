import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  if (browser) {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
      throw redirect(302, '/login');
    }
  }
  
  return {};
};