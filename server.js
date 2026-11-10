const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/cakes", async (req, res) => {
  try {
    const cakes = await prisma.cake.findMany({ orderBy: { id: "asc" } });
    res.json({ success: true, message: "Data kue berhasil diambil", data: cakes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/cakes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const cake = await prisma.cake.findUnique({ where: { id } });
    if (!cake) return res.status(404).json({ success: false, message: "Kue tidak ditemukan" });
    res.json({ success: true, data: cake });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post("/api/cakes", async (req, res) => {
  try {
    const { nama, kategori, harga, stok, deskripsi } = req.body;
    if (!nama || !kategori || harga == null || stok == null) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }
    const newCake = await prisma.cake.create({
      data: { nama, kategori, harga: Number(harga), stok: Number(stok), deskripsi: deskripsi || "" },
    });
    res.status(201).json({ success: true, message: "Kue berhasil ditambahkan", data: newCake });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/cakes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nama, kategori, harga, stok, deskripsi } = req.body;
    if (!nama || !kategori || harga == null || stok == null) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }
    const cake = await prisma.cake.update({
      where: { id },
      data: { nama, kategori, harga: Number(harga), stok: Number(stok), deskripsi: deskripsi || "" },
    });
    res.json({ success: true, message: "Kue berhasil diperbarui", data: cake });
  } catch (e) {
    res.status(404).json({ success: false, message: "Kue tidak ditemukan" });
  }
});

app.delete("/api/cakes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await prisma.cake.delete({ where: { id } });
    res.json({ success: true, message: "Kue berhasil dihapus", data: deleted });
  } catch (e) {
    res.status(404).json({ success: false, message: "Kue tidak ditemukan" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🍰 Sweet Bakery server berjalan di http://localhost:${PORT}`);
});