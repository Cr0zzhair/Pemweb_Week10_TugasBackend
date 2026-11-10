// ============================================
// SWEET BAKERY - Front-End JavaScript
// ============================================

const API_URL = "/api/cakes";

// Elemen DOM
const cakeForm = document.getElementById("cake-form");
const cakeIdInput = document.getElementById("cake-id");
const namaInput = document.getElementById("nama");
const kategoriInput = document.getElementById("kategori");
const hargaInput = document.getElementById("harga");
const stokInput = document.getElementById("stok");
const deskripsiInput = document.getElementById("deskripsi");
const formTitle = document.getElementById("form-title");
const btnSubmit = document.getElementById("btn-submit");
const btnCancel = document.getElementById("btn-cancel");
const cakeListEl = document.getElementById("cake-list");
const emptyState = document.getElementById("empty-state");
const totalBadge = document.getElementById("total-badge");

// =============================================
// GET - Ambil & tampilkan semua kue
// =============================================
async function loadCakes() {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();

    if (!json.success) throw new Error(json.message);

    const cakes = json.data;

    // Update badge
    totalBadge.textContent = cakes.length + " produk";

    // Tampilkan empty state atau daftar kue
    if (cakes.length === 0) {
      cakeListEl.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    cakeListEl.style.display = "grid";
    emptyState.style.display = "none";

    // Render card kue
    cakeListEl.innerHTML = cakes
      .map(
        (cake) => `
      <div class="cake-card">
        <div class="card-top">
          <div class="cake-name">${escapeHtml(cake.nama)}</div>
          <span class="cake-kategori">${escapeHtml(cake.kategori)}</span>
          <p class="cake-desc">${escapeHtml(cake.deskripsi || "Tidak ada deskripsi.")}</p>
          <div class="cake-info">
            <span class="price">Rp ${cake.harga.toLocaleString("id-ID")}</span>
            <span class="stock">📦 Stok: ${cake.stok}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn btn-edit" onclick="editCake(${cake.id})">✏️ Edit</button>
          <button class="btn btn-delete" onclick="deleteCake(${cake.id}, '${escapeHtml(cake.nama)}')">🗑️ Hapus</button>
        </div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    showToast("Gagal memuat data: " + err.message, "error");
  }
}

// =============================================
// POST / PUT - Form submit handler
// =============================================
cakeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nama: namaInput.value.trim(),
    kategori: kategoriInput.value,
    harga: parseInt(hargaInput.value),
    stok: parseInt(stokInput.value),
    deskripsi: deskripsiInput.value.trim(),
  };

  const editId = cakeIdInput.value;

  try {
    let res;

    if (editId) {
      // PUT - Update kue
      res = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      // POST - Tambah kue baru
      res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    const json = await res.json();

    if (!json.success) throw new Error(json.message);

    showToast(json.message, "success");
    resetForm();
    loadCakes();
  } catch (err) {
    showToast("Gagal menyimpan: " + err.message, "error");
  }
});

// =============================================
// EDIT - Isi form dengan data kue yang dipilih
// =============================================
async function editCake(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const json = await res.json();

    if (!json.success) throw new Error(json.message);

    const cake = json.data;

    // Isi form
    cakeIdInput.value = cake.id;
    namaInput.value = cake.nama;
    kategoriInput.value = cake.kategori;
    hargaInput.value = cake.harga;
    stokInput.value = cake.stok;
    deskripsiInput.value = cake.deskripsi;

    // Ubah tampilan form ke mode edit
    formTitle.textContent = "✏️ Edit Kue";
    btnSubmit.textContent = "💾 Update";
    btnCancel.style.display = "inline-block";

    // Scroll ke form
    document.querySelector(".form-section").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    showToast("Mode edit aktif - ubah data lalu klik Update", "info");
  } catch (err) {
    showToast("Gagal mengambil data: " + err.message, "error");
  }
}

// =============================================
// DELETE - Hapus kue berdasarkan ID
// =============================================
async function deleteCake(id, nama) {
  const konfirmasi = confirm(`Yakin ingin menghapus "${nama}"?`);
  if (!konfirmasi) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const json = await res.json();

    if (!json.success) throw new Error(json.message);

    showToast(json.message, "success");
    loadCakes();
  } catch (err) {
    showToast("Gagal menghapus: " + err.message, "error");
  }
}

// =============================================
// Reset form ke mode tambah
// =============================================
function resetForm() {
  cakeForm.reset();
  cakeIdInput.value = "";
  formTitle.textContent = "➕ Tambah Kue Baru";
  btnSubmit.textContent = "💾 Simpan";
  btnCancel.style.display = "none";
}

// =============================================
// Toast notification
// =============================================
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// =============================================
// Escape HTML untuk mencegah XSS
// =============================================
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// =============================================
// Load data saat halaman dibuka
// =============================================
document.addEventListener("DOMContentLoaded", loadCakes);

