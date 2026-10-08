"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";

/**
 * Server Action untuk login admin dengan email dan password.
 * Mengembalikan objek { error } jika gagal, atau mengarahkan ke /admin jika sukses.
 */
export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get?.("email");
  const password = data?.get?.("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let supabase;
  try {
    supabase = await createSessionClient();
  } catch (err) {
    return { error: err.message || "Konfigurasi Supabase bermasalah." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email.toString().trim(),
    password: password.toString(),
  });

  if (error) {
    return { error: "Email atau password salah. Silakan coba lagi." };
  }

  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin (logout) lalu kembali ke /admin/login.
 */
export async function logout() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan error saat sign out dan lanjutkan redirect
  }

  redirect("/admin/login");
}

