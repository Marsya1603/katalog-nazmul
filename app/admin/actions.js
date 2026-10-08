'use server';

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export async function login(prevState, formData) {
  const form =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : formData || prevState;

  const email = form?.get ? form.get("email") : form?.email;
  const password = form?.get ? form.get("password") : form?.password;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    if (
      error.code === "invalid_credentials" ||
      error.message?.toLowerCase().includes("invalid login credentials")
    ) {
      return { error: "Email atau password salah." };
    }
    return { error: error.message || "Gagal masuk. Silakan periksa kembali akun Anda." };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const form =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : formData || prevState;

  const passwordBaru = form?.get
    ? (form.get("password_baru") ?? form.get("password"))
    : (form?.password_baru ?? form?.password);

  const konfirmasiPassword = form?.get
    ? (form.get("konfirmasi_password") ?? form.get("konfirmasi") ?? form.get("confirm_password"))
    : (form?.konfirmasi_password ?? form?.konfirmasi ?? form?.confirm_password);

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  if (String(passwordBaru).length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  const supabase = await createSessionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi admin tidak ditemukan. Silakan masuk terlebih dahulu." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: String(passwordBaru),
  });

  if (updateError) {
    return { error: updateError.message || "Gagal mengganti password." };
  }

  return { success: "Password berhasil diganti." };
}

export const masuk = login;
export const keluar = logout;
export const updatePassword = gantiPassword;
export const changePassword = gantiPassword;
