import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createClient, createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  const sessionClient = await createSessionClient();
  const {
    data: { user },
    error: authError,
  } = await sessionClient.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  let daftarProduk = [];
  let errorPesan = null;

  try {
    const { data, error } = await sessionClient
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      const serverClient = createClient();
      const { data: serverData, error: serverError } = await serverClient
        .from("produk")
        .select("*")
        .order("id", { ascending: true });

      if (serverError) {
        errorPesan = error.message;
      } else {
        daftarProduk = serverData || [];
      }
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    errorPesan = err.message || "Gagal memuat produk dari database.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {errorPesan ? (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-bahaya">
          <p className="font-semibold">Gagal memuat daftar produk</p>
          <p className="mt-1 text-sm text-teks-lembut">{errorPesan}</p>
        </div>
      ) : daftarProduk.length === 0 ? (
        <p className="rounded-xl border border-garis bg-permukaan p-6 text-center text-teks-lembut">
          Belum ada produk
        </p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
