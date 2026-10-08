import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat koneksi Supabase sesi admin di sisi server menggunakan
 * SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, dan cookie auth via @supabase/ssr.
 * Dipakai untuk login, keluar, ganti password, dan kelola produk.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Abaikan jika dipanggil dari Server Component yang tidak mengizinkan penulisan cookie
        }
      },
    },
  });
}

export { createSessionClient as createAdminClient };
export default createSessionClient;

