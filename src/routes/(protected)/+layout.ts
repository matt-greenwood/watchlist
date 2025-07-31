import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
  if (browser) {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
      throw redirect(302, '/login');
    }
  }
  
  return {};
};